# Instalación desde cero en un VPS Ubuntu Server

Guía paso a paso para un VPS **Ubuntu Server 22.04/24.04 LTS** recién creado, sin nada instalado, usando el esquema **Docker (backend + nginx en contenedores) + MySQL nativo del sistema**.

Al terminar vas a tener:
- **MySQL** instalado directo en el sistema operativo (no en un contenedor), con la base `ssvr`.
- **Backend** (Node/Express) corriendo en un contenedor Docker, conectado a ese MySQL nativo.
- **Nginx** corriendo en otro contenedor Docker, sirviendo el frontend compilado y haciendo de proxy de `/api` hacia el backend.

Todos los comandos están pensados para copiar y pegar tal cual, conectado por SSH al VPS como usuario con `sudo` (o como `root`, ajustando `sudo` donde corresponda).

---

## 1. Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Firewall base (UFW)

Antes de tocar nada más, asegurate de no quedarte afuera por SSH:

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw enable
```

Vamos a agregar las reglas de HTTP/MySQL más adelante, una vez que sepamos qué necesitamos permitir exactamente.

## 3. Instalar Docker y Docker Compose

```bash
# Dependencias
sudo apt install -y ca-certificates curl gnupg

# Clave y repositorio oficial de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verificar:

```bash
docker --version
docker compose version
```

Opcional, para no tener que usar `sudo` con cada comando de `docker`:

```bash
sudo usermod -aG docker $USER
newgrp docker   # o cerrar sesión y volver a entrar por SSH
```

## 4. Instalar MySQL nativo

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

`mysql_secure_installation` te va a preguntar por una contraseña de root, si sacar usuarios anónimos, deshabilitar el login remoto de root, etc. — respondé "sí" a las opciones de seguridad salvo que tengas una razón puntual para lo contrario.

En Ubuntu, el usuario `root` de MySQL usa autenticación por socket por defecto, así que se accede con `sudo mysql` (sin pedir la contraseña que configuraste recién) en vez de `mysql -u root -p`.

### 4.1. Permitir conexiones desde los contenedores Docker

Por defecto MySQL solo escucha en `127.0.0.1`, lo cual **no** es alcanzable desde un contenedor. Editar:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Buscar la línea `bind-address` y cambiarla a:

```
bind-address = 0.0.0.0
```

Guardar y reiniciar:

```bash
sudo systemctl restart mysql
```

Esto abre el puerto 3306 a todas las interfaces — lo vamos a restringir con el firewall en el paso 4.4, así que en ningún momento queda expuesto a internet sin protección.

### 4.2. Crear la base de datos

Cloná el repo del backend primero (ver paso 6) o subí `ssvr.sql` al VPS, y luego:

```bash
sudo mysql < /opt/SSVR/SSVR-backend/ssvr.sql
```

### 4.3. Crear el usuario de la app

**Importante**: quien se conecta es el contenedor Docker, no "localhost" — el usuario tiene que tener host `'%'` (cualquier host) o el de la subred de Docker, nunca `'localhost'`, o la conexión va a fallar aunque la contraseña sea correcta.

```bash
sudo mysql -e "
CREATE USER 'ssvr_user'@'%' IDENTIFIED BY 'PONE_UNA_CONTRASEÑA_FUERTE_ACA';
GRANT ALL PRIVILEGES ON ssvr.* TO 'ssvr_user'@'%';
FLUSH PRIVILEGES;
"
```

### 4.4. Restringir el puerto 3306 con el firewall

Todavía no levantamos Docker, así que por ahora bloqueá 3306 completamente (lo vamos a abrir solo para la subred de Docker en el paso 9, una vez que sepamos cuál es):

```bash
sudo ufw deny 3306
```

## 5. Instalar Node.js (solo para compilar el frontend)

El backend corre en Docker (no necesita Node en el host), pero el frontend se compila afuera de Docker — nginx solo sirve el `dist/` ya generado.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

## 6. Clonar los repos

```bash
sudo mkdir -p /opt/SSVR
sudo chown $USER:$USER /opt/SSVR
cd /opt/SSVR

git clone <URL_DE_TU_REPO_SSVR-BACKEND> SSVR-backend
git clone <URL_DE_TU_REPO_SSVR-FRONTEND> SSVR-frontend
```

Si todavía no hiciste el paso 4.2 (crear la base), volvé a hacerlo ahora que ya está el repo clonado.

## 7. Compilar el frontend

```bash
cd /opt/SSVR/SSVR-frontend
cp .env.example .env
```

Editar `.env` y completar `VITE_API_URL=/api` (en producción, servido por el mismo nginx, va sin dominio ni puerto).

```bash
npm ci
npm run build
```

Esto genera `/opt/SSVR/SSVR-frontend/dist`, que es lo que el contenedor de nginx va a servir.

## 8. Configurar el backend

```bash
cd /opt/SSVR/SSVR-backend
cp .env.production.example .env.production
nano .env.production
```

Completar:

```
NODE_ENV=production
PORT=3000

JWT_SECRET=<generar con el comando de abajo>

DATABASE_URL=mysql://ssvr_user:PONE_UNA_CONTRASEÑA_FUERTE_ACA@host.docker.internal:3306/ssvr
```

`JWT_SECRET` — generar uno propio y pegarlo:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Las líneas `MYSQL_USER`, `MYSQL_PASSWORD` y `MYSQL_ROOT_PASSWORD` del archivo de ejemplo se pueden borrar o dejar vacías: solo las usa el servicio `mysql` de `docker-compose.yml` (la variante "todo en Docker"), que acá no se usa.

## 9. Levantar Docker

```bash
cd /opt/SSVR/SSVR-backend
docker compose -f docker-compose.native-db.yml up -d --build
```

Esto construye la imagen del backend y levanta dos contenedores: `backend` (puerto 3000 interno, sin publicar al host) y `nginx` (publicado en el puerto 80 del host).

Verificar que levantaron bien:

```bash
docker compose -f docker-compose.native-db.yml ps
docker compose -f docker-compose.native-db.yml logs -f backend
```

## 10. Ahora sí, restringir 3306 a la subred de Docker

Con los contenedores ya corriendo, obtené la subred real que Docker le asignó a la red del proyecto:

```bash
docker network inspect SSVR-backend_SSVR --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}'
```

Va a imprimir algo como `172.19.0.0/16`. Usá ese valor exacto para permitir 3306 solo desde ahí:

```bash
sudo ufw allow from 172.19.0.0/16 to any port 3306
```

(Reemplazá `172.19.0.0/16` por lo que te haya devuelto el comando anterior en tu VPS — puede variar.)

## 11. Abrir HTTP (y HTTPS si vas a usar Certbot)

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp   # si vas a poner HTTPS, ver más abajo
sudo ufw status
```

## 12. Verificar que todo funciona

```bash
curl http://localhost/api/test/
# {"message":"Hello World"}

curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tuempresa.com","password":"contraseñaDePrueba123"}'
# Debería devolver status "success" y un token
```

Desde tu navegador, entrar a `http://IP_DEL_VPS/` (o tu dominio si ya lo apuntaste) — debería cargar el login del frontend.

## 13. HTTPS (opcional pero recomendado)

Como nginx corre dentro de un contenedor sirviendo directo el puerto 80 del host, Certbot no puede reconfigurarlo automáticamente con `--nginx`. Dos opciones:

- **Nginx nativo del host como reverse proxy delante del contenedor**: instalar Nginx en el VPS (`sudo apt install nginx`), configurarlo para hacer `proxy_pass` a `http://127.0.0.1:80` (el puerto donde ya escucha el contenedor — hay que cambiar el mapeo de puertos del contenedor a algo como `8080:80` para liberar el 80 real), y correr `sudo certbot --nginx -d tu-dominio.com` sobre ese nginx del host.
- **Certbot standalone**: parar el contenedor de nginx un momento, correr `sudo certbot certonly --standalone -d tu-dominio.com`, y montar los certificados generados (`/etc/letsencrypt/live/tu-dominio.com/`) como volumen de solo lectura en el contenedor de nginx, agregando el bloque `listen 443 ssl` a `deploy/nginx/docker.conf`.

Cualquiera de las dos funciona; la primera es más simple de mantener (Certbot renueva automáticamente sin tocar el contenedor).

## 14. Actualizar después de un cambio de código

```bash
# Backend
cd /opt/SSVR/SSVR-backend
git pull
docker compose -f docker-compose.native-db.yml up -d --build backend

# Frontend
cd /opt/SSVR/SSVR-frontend
git pull
npm ci
npm run build
# nginx sirve el dist/ por bind mount, no hace falta reiniciar el contenedor
```

## 15. Problemas comunes

**`PrismaClientInitializationError: Can't reach database server at mysql:3306`**
`DATABASE_URL` en `.env.production` quedó con el host `mysql` (el de la variante "todo en Docker"). Acá tiene que ser `host.docker.internal`. Corregir y `docker compose -f docker-compose.native-db.yml up -d` para recrear el contenedor con el valor nuevo.

**`Access denied for user 'ssvr_user'@'...'`**
El usuario se creó con host `'localhost'` en vez de `'%'` (o la subred de Docker). Volver a crearlo como en el paso 4.3.

**El backend no arranca / `docker compose logs backend` no muestra nada de MySQL**
Confirmar que `bind-address = 0.0.0.0` quedó aplicado (`sudo systemctl restart mysql` después de editarlo) y que el firewall permite la subred de Docker (paso 10) — si UFW la bloquea, la conexión también falla con timeout/"can't reach database server".

**`curl http://localhost/` devuelve 502 o conexión rechazada**
`docker compose -f docker-compose.native-db.yml ps` — si `nginx` está arriba pero `backend` no, revisar `docker compose -f docker-compose.native-db.yml logs backend`. Si ninguno de los dos arrancó, revisar que `SSVR-frontend/dist` exista (paso 7) — el bind mount de un directorio inexistente puede dejar a nginx sirviendo una carpeta vacía sin fallar, pero conviene confirmarlo con `ls /opt/SSVR/SSVR-frontend/dist`.
