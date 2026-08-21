import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import userCompaniesService from '../../services/userCompanies/index.js';
import { AppError } from '../../utils/appError.util.js';

export const joinCompany = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    const { company_id } = req.body;

    if (!company_id) {
        throw new AppError('El id de la empresa es requerido', 400);
    }

    const company = await userCompaniesService.joinCompany(req.currentUser.id, Number(company_id));

    res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Te uniste a la empresa correctamente',
        company,
    });
});
