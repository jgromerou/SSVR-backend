import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import salesService from '../../services/sales/index.js';
import { AppError } from '../../utils/appError.util.js';

export const createSale = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { customer_id, details } = req.body;

    const newSale = await salesService.createSale(req.currentUser.company_id, req.currentUser.id, {
        customer_id: customer_id ? Number(customer_id) : null,
        details: details || [],
    });

    res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Venta creada correctamente',
        sale: newSale,
    });
});
