import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import purchasesService from '../../services/purchases/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getPurchase = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id } = req.query;

    if (!id) {
        throw new AppError('El id de la compra es requerido', 400);
    }

    const purchase = await purchasesService.getPurchase(Number(id), req.currentUser.company_id);

    if (!purchase) {
        throw new AppError('No se encontró la compra', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Compra obtenida correctamente',
        purchase,
    });
});
