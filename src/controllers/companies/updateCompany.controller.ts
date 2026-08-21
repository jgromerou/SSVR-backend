import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import companiesService from '../../services/companies/index.js';
import { AppError } from '../../utils/appError.util.js';

export const updateCompany = catchAsync(async (req: Request, res: Response) => {
    
    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    if (!req.currentUser?.company_id) {
        throw new AppError('No tienes una empresa activa asignada', 400);
    }

    const { name, logo } = req.body;

    if (!name) {
        throw new AppError('El nombre de la empresa es requerido', 400);
    }

    const updatedCompany = await companiesService.updateCompany(req.currentUser.company_id, name, logo);


    res.status(200).json({ 
        status: 'success', 
        statusCode: 200, 
        message: 'Empresa actualizada correctamente', 
        company: updatedCompany
     });
});