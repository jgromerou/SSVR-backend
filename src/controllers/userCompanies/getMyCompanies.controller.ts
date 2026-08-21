import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import userCompaniesService from '../../services/userCompanies/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getMyCompanies = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    const companies = await userCompaniesService.getMyCompanies(req.currentUser.id, req.currentUser.main_company_id);

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Empresas obtenidas correctamente',
        companies,
    });
});
