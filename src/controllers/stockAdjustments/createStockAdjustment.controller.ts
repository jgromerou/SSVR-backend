import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import stockAdjustmentsService from '../../services/stockAdjustments/index.js';
import { AppError } from '../../utils/appError.util.js';

export const createStockAdjustment = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { product_id, quantity, reason } = req.body;

    if (!product_id) {
        throw new AppError('El id del producto es requerido', 400);
    }

    if (quantity === undefined || quantity === null) {
        throw new AppError('La cantidad del ajuste es requerida', 400);
    }

    if (!reason) {
        throw new AppError('El motivo del ajuste es requerido', 400);
    }

    const newAdjustment = await stockAdjustmentsService.createStockAdjustment(
        req.currentUser.company_id,
        req.currentUser.id,
        { product_id: Number(product_id), quantity: Number(quantity), reason }
    );

    res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Ajuste de stock creado correctamente',
        stock_adjustment: newAdjustment,
    });
});
