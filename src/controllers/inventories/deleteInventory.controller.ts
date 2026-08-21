import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import inventoriesService from '../../services/inventories/index.js';
import { AppError } from '../../utils/appError.util.js';

export const deleteInventory = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id } = req.body;

    if (!id) {
        throw new AppError('El id del inventario es requerido', 400);
    }

    const deletedInventory = await inventoriesService.deleteInventory(Number(id), req.currentUser.company_id);

    if (!deletedInventory) {
        throw new AppError('No se encontró el inventario', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Inventario eliminado correctamente',
    });
});
