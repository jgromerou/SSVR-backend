import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import salesReturnsService from '../../services/salesReturns/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getSalesReturn = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id } = req.query;

    if (!id) {
        throw new AppError('El id de la devolución es requerido', 400);
    }

    const salesReturn = await salesReturnsService.getSalesReturn(Number(id), req.currentUser.company_id);

    if (!salesReturn) {
        throw new AppError('No se encontró la devolución', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Devolución obtenida correctamente',
        sales_return: salesReturn,
    });
});
