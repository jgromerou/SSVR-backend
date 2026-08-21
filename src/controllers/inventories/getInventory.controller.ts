import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import inventoriesService from '../../services/inventories/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getInventory = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id } = req.query;

    if (!id) {
        throw new AppError('El id del inventario es requerido', 400);
    }

    const inventory = await inventoriesService.getInventory(Number(id), req.currentUser.company_id);

    if (!inventory) {
        throw new AppError('No se encontró el inventario', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Inventario obtenido correctamente',
        inventory,
    });
});
