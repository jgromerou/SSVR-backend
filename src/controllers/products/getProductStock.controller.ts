import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import productsService from '../../services/products/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getProductStock = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id } = req.query;

    if (!id) {
        throw new AppError('El id del producto es requerido', 400);
    }

    const stock = await productsService.getProductStock(Number(id), req.currentUser.company_id);

    if (!stock) {
        throw new AppError('No se encontró el producto', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Stock del producto obtenido correctamente',
        stock,
    });
});
