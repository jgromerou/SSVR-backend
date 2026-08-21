import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import salesService from '../../services/sales/index.js';
import { AppError } from '../../utils/appError.util.js';

export const updateSale = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id, customer_id, details } = req.body;

    if (!id) {
        throw new AppError('El id de la venta es requerido', 400);
    }

    if (details !== undefined && !Array.isArray(details)) {
        throw new AppError('Los detalles deben enviarse como un listado', 400);
    }

    const updatedSale = await salesService.updateSale(Number(id), req.currentUser.company_id, req.currentUser.id, {
        customer_id: customer_id !== undefined ? (customer_id ? Number(customer_id) : null) : undefined,
        details,
    });

    if (!updatedSale) {
        throw new AppError('No se encontró la venta', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Venta actualizada correctamente',
        sale: updatedSale,
    });
});
