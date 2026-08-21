import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import unitsOfMeasureService from '../../services/unitsOfMeasure/index.js';

export const getAllUnitsOfMeasure = catchAsync(async (_req: Request, res: Response) => {

    const units = await unitsOfMeasureService.getAllUnitsOfMeasure();

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Unidades de medida obtenidas correctamente',
        units_of_measure: units,
    });
});
