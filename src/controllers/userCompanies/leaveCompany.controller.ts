import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import userCompaniesService from '../../services/userCompanies/index.js';
import { AppError } from '../../utils/appError.util.js';

export const leaveCompany = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    const { company_id } = req.body;

    if (!company_id) {
        throw new AppError('El id de la empresa es requerido', 400);
    }

    await userCompaniesService.leaveCompany(req.currentUser.id, Number(company_id));

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Saliste de la empresa correctamente',
    });
});
