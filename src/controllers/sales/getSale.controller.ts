import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import salesService from '../../services/sales/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getSale = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id } = req.query;

    if (!id) {
        throw new AppError('El id de la venta es requerido', 400);
    }

    const sale = await salesService.getSale(Number(id), req.currentUser.company_id);

    if (!sale) {
        throw new AppError('No se encontró la venta', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Venta obtenida correctamente',
        sale,
    });
});
