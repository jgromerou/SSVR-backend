import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import purchasesService from '../../services/purchases/index.js';
import { AppError } from '../../utils/appError.util.js';

export const createPurchase = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { supplier_id, details } = req.body;

    const newPurchase = await purchasesService.createPurchase(req.currentUser.company_id, req.currentUser.id, {
        supplier_id: supplier_id ? Number(supplier_id) : null,
        details: details || [],
    });

    res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Compra creada correctamente',
        purchase: newPurchase,
    });
});
