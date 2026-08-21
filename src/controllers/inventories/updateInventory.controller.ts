import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import inventoriesService from '../../services/inventories/index.js';
import { AppError } from '../../utils/appError.util.js';

export const updateInventory = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id, details } = req.body;

    if (!id) {
        throw new AppError('El id del inventario es requerido', 400);
    }

    if (!Array.isArray(details)) {
        throw new AppError('Los detalles deben enviarse como un listado', 400);
    }

    const updatedInventory = await inventoriesService.updateInventory(
        Number(id),
        req.currentUser.company_id,
        req.currentUser.id,
        details
    );

    if (!updatedInventory) {
        throw new AppError('No se encontró el inventario', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Inventario actualizado correctamente',
        inventory: updatedInventory,
    });
});
