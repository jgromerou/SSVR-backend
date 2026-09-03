# Despliegue en VPS

Tres rutas soportadas: **Docker Compose** (todo en contenedores, incluido MySQL), **Docker con MySQL nativo del host** (backend/nginx en contenedores, MySQL instalado directo en el sistema) o **nativa** (Node + PM2 + Nginx del sistema, MySQL del sistema, sin Docker). Todas asumen que `SSVR-backend` y `SSVR-frontend` están clonados como carpetas hermanas en el VPS:

```
/opt/ssvr/
  SSVR-backend/
  SSVR-frontend/
```

## ¿Cómo se crea la base de datos?

**No con Prisma.** `prisma/schema.prisma` es un espejo de `ssvr.sql` que solo sirve para generar el cliente TypeScript (`prisma generate`, ya integrado en el build); no hay carpeta de migraciones ni `prisma migrate` corrido en ningún lado, así que Prisma nunca crea ni modifica tablas por su cuenta. `ssvr.sql` es la única fuente de verdad del esquema, y hay que importarlo — la única diferencia entre las opciones de abajo es **quién** lo importa:

- **Opción A (Docker Compose completo)**: nadie lo hace a mano. La imagen oficial de `mysql` importa automáticamente cualquier `.sql` que encuentre en `/docker-entrypoint-initdb.d/` la primera vez que el volumen de datos está vacío — `docker-compose.yml` ya monta `ssvr.sql` ahí.
- **Opciones B y C (MySQL nativo)**: hay que importarlo vos mismo una vez con `mysql -u root -p < ssvr.sql` (o subiéndolo desde phpMyAdmin).

## Pasos comunes

1. Clonar ambos repos en `/opt/ssvr/`.
2. Generar un `JWT_SECRET` propio (usado para firmar la sesión): `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
3. Compilar el frontend: dentro de `SSVR-frontend`, `npm ci && npm run build` (genera `SSVR-frontend/dist`). Nginx sirve ese build estático en ambas rutas.

## Opción A: Docker Compose (recomendada para empezar de cero)

Todo en contenedores, incluida la base. No hace falta tener Node ni MySQL instalados en la máquina, solo Docker.

1. En `SSVR-backend/`, copiar `.env.production.example` a `.env.production` y completar:
   - `MYSQL_USER` / `MYSQL_PASSWORD`: el usuario de la app (no root). La imagen de `mysql` lo crea sola en el primer arranque, con permisos sobre la base `ssvr`.
   - `MYSQL_ROOT_PASSWORD`: contraseña del usuario administrador de MySQL (la app no lo usa, pero el contenedor lo exige).
   - `DATABASE_URL`: dejar la variante con host `mysql` (nombre del servicio), usando el mismo usuario/contraseña de `MYSQL_USER`/`MYSQL_PASSWORD`.
   - `JWT_SECRET`.
2. Levantar todo (la primera vez importa `ssvr.sql` automáticamente, ver arriba):
   ```
   docker compose up -d --build
   ```
3. Verificar: `docker compose ps` (los tres servicios deben quedar "Up"/"healthy"), `docker compose logs -f backend`.
4. Probar que responde: `curl http://localhost/api/test/` debería devolver `{"message":"Hello World"}`.
5. Nginx queda escuchando en el puerto 80 del host (ver `docker-compose.yml`). Para HTTPS, poner un reverse proxy adicional (Certbot/Nginx del host, o Traefik) delante del contenedor `nginx`, o migrar ese servicio a la instalación nativa de Nginx con Certbot (ver Opción C) apuntando a este contenedor.

Para actualizar tras un cambio de código: `docker compose up -d --build backend`. Para arrancar de cero (borra los datos): `docker compose down -v && docker compose up -d --build`.

### Opción A endurecida para VPS público: `docker-compose.prod.yml`

`docker-compose.yml` publica el puerto de MySQL al host (`${MYSQL_PORT:-3306}:3306`), pensado para poder conectarse desde afuera con un cliente (DBeaver, MySQL Workbench) durante desarrollo. En un VPS expuesto a internet conviene no publicarlo. `docker-compose.prod.yml` es la misma Opción A sin ese puerto público (solo alcanzable desde `backend` por la red interna) y con `no-new-privileges` en los tres servicios:

```
docker compose -f docker-compose.prod.yml up -d --build
```

La imagen oficial de `mysql` ya aplica por defecto lo que hace `mysql_secure_installation` (sin usuarios anónimos, sin base `test`, `root` solo loguea como `'root'@'localhost'`, nunca por red), así que no hace falta correrlo a mano. Para administrar la base sin puerto publicado: `docker compose -f docker-compose.prod.yml exec mysql mysql -u root -p`.

## Opción B: Docker (backend + nginx) + MySQL nativo del host

Para cuando MySQL ya corre instalado directo en la máquina (el VPS, o en desarrollo un WAMP/XAMPP local) en vez de en un contenedor — por ejemplo porque ya lo usás para otras apps, o es un servicio administrado del proveedor.

1. Crear la base con `ssvr.sql` contra ese MySQL nativo: `mysql -u root -p < ssvr.sql` (o importarlo desde phpMyAdmin). Si la base ya existía con un schema viejo (por ejemplo con la columna `firebase_uid` de una versión anterior) y no tiene datos reales que conservar, hacer `DROP DATABASE ssvr;` antes de reimportar.
2. Crear un usuario de MySQL para la app. **Importante**: quien se conecta es el contenedor Docker, no "localhost" — el usuario no puede tener host `'localhost'` (ese es el que usa el snippet de la Opción C, no sirve acá) o la conexión falla igual aunque la contraseña sea correcta. Usar `'%'` (cualquier host) o, más restrictivo, la subred del bridge de Docker:
   ```sql
   CREATE USER 'ssvr_user'@'%' IDENTIFIED BY 'CHANGE_ME';
   GRANT ALL PRIVILEGES ON ssvr.* TO 'ssvr_user'@'%';
   FLUSH PRIVILEGES;
   ```
3. En `SSVR-backend/`, copiar `.env.production.example` a `.env.production` y completar `JWT_SECRET`. Para `DATABASE_URL`, el host **no** es `localhost`/`127.0.0.1` sino `host.docker.internal` (Docker lo resuelve a la IP del host tanto en Docker Desktop como, gracias al `extra_hosts` ya configurado en `docker-compose.native-db.yml`, en Linux):
   ```
   DATABASE_URL=mysql://ssvr_user:CHANGE_ME@host.docker.internal:3306/ssvr
   ```
4. Levantar solo backend + nginx (sin el servicio `mysql`):
   ```
   docker compose -f docker-compose.native-db.yml up -d --build
   ```
5. Si da `Can't reach database server at mysql:3306` (en vez de `host.docker.internal:3306`), es que `DATABASE_URL` en `.env.production` quedó con el host `mysql` del paso de la Opción A — corregirlo a `host.docker.internal` y `docker compose -f docker-compose.native-db.yml up -d` para recrear el contenedor con el nuevo valor.
6. En Linux, asegurarse de que MySQL acepte conexiones desde el contenedor: `bind-address` en `my.cnf` debe incluir la interfaz del bridge de Docker (no solo `127.0.0.1`), y el firewall (`ufw`) debe permitir el puerto 3306 solo desde la subred de Docker (normalmente `172.17.0.0/16`, verificar con `docker network inspect ssvr-backend_ssvr`), no desde internet.

Para actualizar tras un cambio de código: `docker compose -f docker-compose.native-db.yml up -d --build backend`.

## Opción C: Nativa (PM2 + Nginx + MySQL del sistema, sin Docker)

Requisitos: Node 22+, MySQL 8 instalado y corriendo, Nginx instalado, PM2 (`npm i -g pm2`).

1. Crear la base de datos: `mysql -u root -p < ssvr.sql` (crea el schema `ssvr` y la carga inicial de `units_of_measure`).
2. Crear un usuario de MySQL para la app (no usar root en producción):
   ```sql
   CREATE USER 'ssvr_user'@'localhost' IDENTIFIED BY 'CHANGE_ME';
   GRANT ALL PRIVILEGES ON ssvr.* TO 'ssvr_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. En `SSVR-backend/`, copiar `.env.production.example` a `.env.production`, usar la variante `DATABASE_URL` con host `127.0.0.1` y las credenciales del paso anterior, y completar `JWT_SECRET`.
4. Instalar, generar cliente y compilar:
   ```
   npm ci
   npx prisma generate
   npm run build
   ```
5. Arrancar con PM2 (carga `.env.production` vía `env_file` de PM2 no aplica automáticamente; exportar las variables antes o usar `pm2 start deploy/ecosystem.config.cjs --env production` con las variables ya en el entorno del shell, por ejemplo con `dotenv-cli` o exportándolas en el servicio systemd de PM2):
   ```
   pm2 start deploy/ecosystem.config.cjs --env production
   pm2 save
   pm2 startup   # deja el arranque de PM2 configurado como servicio del sistema
   ```
6. Copiar `deploy/nginx/vps-native.conf` a `/etc/nginx/sites-available/ssvr.conf`, ajustar `server_name` y la ruta de `root` (debe apuntar al `dist` compilado de `SSVR-frontend`), habilitarlo y recargar Nginx:
   ```
   sudo ln -s /etc/nginx/sites-available/ssvr.conf /etc/nginx/sites-enabled/ssvr.conf
   sudo nginx -t && sudo systemctl reload nginx
   ```
7. HTTPS con Certbot: `sudo certbot --nginx -d tu-dominio.com`.

Para actualizar tras un cambio de código: `git pull`, `npm ci`, `npx prisma generate`, `npm run build`, `pm2 restart ssvr-backend`.

## Cambios de schema en producción

`ssvr.sql` es la fuente de verdad del esquema. Cualquier cambio futuro debería aplicarse como una migración de Prisma (`npx prisma migrate dev` en local contra una copia de desarrollo, luego `npx prisma migrate deploy` en el VPS) en lugar de editar `ssvr.sql` y recrear la base a mano.
