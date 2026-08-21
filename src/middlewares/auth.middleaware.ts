import { type Request, type Response, type NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync.util.js';
import { verifyToken } from '../utils/jwt.util.js';
import prisma from '../lib/prisma.js';

declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        id: number;
        email: string;
        main_company_id: number | null;
        company_id: number | null;
      };
    }
  }
}

export const validateAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', statusCode: 401, message: 'No autorizado. Token inexistente.' });
  }

  const token = authHeader.split(' ')[1] as string;

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ status: 'error', statusCode: 401, message: 'Token inválido o expirado.' });
  }

  const userInDb = await prisma.users.findFirst({
    where: { id: payload.id },
  });

  if (!userInDb) {
    return res.status(401).json({ status: 'error', statusCode: 401, message: 'La cuenta ya no existe.' });
  }

  const requestedCompanyId = req.headers['x-company-id'];
  let company_id: number | null = userInDb.main_company_id;

  if (typeof requestedCompanyId === 'string' && requestedCompanyId.trim() !== '') {
    const parsedCompanyId = Number(requestedCompanyId);

    if (Number.isNaN(parsedCompanyId)) {
      return res.status(400).json({ status: 'error', statusCode: 400, message: 'El header X-Company-Id no es válido.' });
    }

    const membership = await prisma.user_companies.findFirst({
      where: { user_id: userInDb.id, company_id: parsedCompanyId },
    });

    if (!membership) {
      return res.status(403).json({ status: 'error', statusCode: 403, message: 'No perteneces a esa empresa.' });
    }

    company_id = parsedCompanyId;
  }

  req.currentUser = {
    id: userInDb.id,
    email: userInDb.email,
    main_company_id: userInDb.main_company_id,
    company_id,
  };

  return next();
});
