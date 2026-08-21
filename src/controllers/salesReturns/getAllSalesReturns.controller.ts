import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import salesReturnsService from '../../services/salesReturns/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getAllSalesReturns = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const salesReturns = await salesReturnsService.getAllSalesReturns(req.currentUser.company_id);

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Devoluciones obtenidas correctamente',
        sales_returns: salesReturns,
    });
});
