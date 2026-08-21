import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import unitsOfMeasureService from '../../services/unitsOfMeasure/index.js';
import { AppError } from '../../utils/appError.util.js';

export const deleteUnitOfMeasure = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.body;

    if (!id) {
        throw new AppError('El id de la unidad de medida es requerido', 400);
    }

    const deletedUnit = await unitsOfMeasureService.deleteUnitOfMeasure(Number(id));

    if (!deletedUnit) {
        throw new AppError('No se encontró la unidad de medida', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Unidad de medida eliminada correctamente',
    });
});
