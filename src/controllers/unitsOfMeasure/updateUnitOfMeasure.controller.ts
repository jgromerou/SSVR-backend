import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import unitsOfMeasureService from '../../services/unitsOfMeasure/index.js';
import { AppError } from '../../utils/appError.util.js';

export const updateUnitOfMeasure = catchAsync(async (req: Request, res: Response) => {

    const { id, name, abbreviation } = req.body;

    if (!id) {
        throw new AppError('El id de la unidad de medida es requerido', 400);
    }

    if (!name) {
        throw new AppError('El nombre de la unidad de medida es requerido', 400);
    }

    if (!abbreviation) {
        throw new AppError('La abreviatura de la unidad de medida es requerida', 400);
    }

    const updatedUnit = await unitsOfMeasureService.updateUnitOfMeasure(Number(id), name, abbreviation);

    if (!updatedUnit) {
        throw new AppError('No se encontró la unidad de medida', 400);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Unidad de medida actualizada correctamente',
        unit_of_measure: updatedUnit,
    });
});
