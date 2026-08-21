import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import stockAdjustmentsService from '../../services/stockAdjustments/index.js';
import { AppError } from '../../utils/appError.util.js';

export const updateStockAdjustment = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id, product_id, quantity, reason } = req.body;

    if (!id) {
        throw new AppError('El id del ajuste es requerido', 400);
    }

    const updatedAdjustment = await stockAdjustmentsService.updateStockAdjustment(
        Number(id),
        req.currentUser.company_id,
        {
            product_id: product_id !== undefined ? Number(product_id) : undefined,
            quantity: quantity !== undefined ? Number(quantity) : undefined,
            reason,
        }
    );

    if (!updatedAdjustment) {
        throw new AppError('No se encontró el ajuste de stock', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Ajuste de stock actualizado correctamente',
        stock_adjustment: updatedAdjustment,
    });
});
