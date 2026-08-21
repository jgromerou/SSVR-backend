import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import stockAdjustmentsService from '../../services/stockAdjustments/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getAllStockAdjustments = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const adjustments = await stockAdjustmentsService.getAllStockAdjustments(req.currentUser.company_id);

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Ajustes de stock obtenidos correctamente',
        stock_adjustments: adjustments,
    });
});
