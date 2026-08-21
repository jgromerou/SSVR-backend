import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import salesReturnsService from '../../services/salesReturns/index.js';
import { AppError } from '../../utils/appError.util.js';

export const createSalesReturn = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { sale_id, details } = req.body;

    if (!sale_id) {
        throw new AppError('El id de la venta es requerido', 400);
    }

    const newReturn = await salesReturnsService.createSalesReturn(req.currentUser.company_id, req.currentUser.id, {
        sale_id: Number(sale_id),
        details: details || [],
    });

    res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Devolución creada correctamente',
        sales_return: newReturn,
    });
});
