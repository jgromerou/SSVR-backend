import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import purchasesService from '../../services/purchases/index.js';
import { AppError } from '../../utils/appError.util.js';

export const updatePurchase = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id, supplier_id, details } = req.body;

    if (!id) {
        throw new AppError('El id de la compra es requerido', 400);
    }

    if (details !== undefined && !Array.isArray(details)) {
        throw new AppError('Los detalles deben enviarse como un listado', 400);
    }

    const updatedPurchase = await purchasesService.updatePurchase(Number(id), req.currentUser.company_id, req.currentUser.id, {
        supplier_id: supplier_id !== undefined ? (supplier_id ? Number(supplier_id) : null) : undefined,
        details,
    });

    if (!updatedPurchase) {
        throw new AppError('No se encontró la compra', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Compra actualizada correctamente',
        purchase: updatedPurchase,
    });
});
