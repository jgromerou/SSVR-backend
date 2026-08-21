import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import stockAdjustmentsService from '../../services/stockAdjustments/index.js';
import { AppError } from '../../utils/appError.util.js';

export const deleteStockAdjustment = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id } = req.body;

    if (!id) {
        throw new AppError('El id del ajuste es requerido', 400);
    }

    const deletedAdjustment = await stockAdjustmentsService.deleteStockAdjustment(Number(id), req.currentUser.company_id);

    if (!deletedAdjustment) {
        throw new AppError('No se encontró el ajuste de stock', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Ajuste de stock eliminado correctamente',
    });
});
