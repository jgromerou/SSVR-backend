import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import salesReturnsService from '../../services/salesReturns/index.js';
import { AppError } from '../../utils/appError.util.js';

export const deleteSalesReturn = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { id } = req.body;

    if (!id) {
        throw new AppError('El id de la devolución es requerido', 400);
    }

    const deletedReturn = await salesReturnsService.deleteSalesReturn(Number(id), req.currentUser.company_id);

    if (!deletedReturn) {
        throw new AppError('No se encontró la devolución', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Devolución eliminada correctamente',
    });
});
