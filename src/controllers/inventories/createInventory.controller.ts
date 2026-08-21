import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import inventoriesService from '../../services/inventories/index.js';
import { AppError } from '../../utils/appError.util.js';

export const createInventory = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { details } = req.body;

    if (!Array.isArray(details)) {
        throw new AppError('Los detalles deben enviarse como un listado', 400);
    }

    const newInventory = await inventoriesService.createInventory(req.currentUser.company_id, req.currentUser.id, details);

    res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Inventario creado correctamente',
        inventory: newInventory,
    });
});
