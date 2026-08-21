import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import unitsOfMeasureService from '../../services/unitsOfMeasure/index.js';
import { AppError } from '../../utils/appError.util.js';

export const createUnitOfMeasure = catchAsync(async (req: Request, res: Response) => {

    const { name, abbreviation } = req.body;

    if (!name) {
        throw new AppError('El nombre de la unidad de medida es requerido', 400);
    }

    if (!abbreviation) {
        throw new AppError('La abreviatura de la unidad de medida es requerida', 400);
    }

    const newUnit = await unitsOfMeasureService.createUnitOfMeasure(name, abbreviation);

    res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Unidad de medida creada correctamente',
        unit_of_measure: newUnit,
    });
});
