import { type Request, type Response, type NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../utils/appError.util.js';

const mapPrismaError = (err: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (err.code) {
    case 'P2002':
      return new AppError('Ya existe un registro con esos datos', 400);
    case 'P2003':
      return new AppError('La operación viola una referencia con otro registro', 400);
    case 'P2025':
      return new AppError('No se encontró el registro solicitado', 404);
    default:
      return new AppError('Error al procesar la solicitud en la base de datos', 400);
  }
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let error = err;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    error = mapPrismaError(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      statusCode: error.statusCode,
      message: error.message,
    });
  }

  console.error('❌ Error no controlado:', error);

  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Error interno del servidor',
  });
};
