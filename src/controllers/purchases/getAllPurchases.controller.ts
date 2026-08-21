import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import purchasesService from '../../services/purchases/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getAllPurchases = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const purchases = await purchasesService.getAllPurchases(req.currentUser.company_id);

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Compras obtenidas correctamente',
        purchases,
    });
});
