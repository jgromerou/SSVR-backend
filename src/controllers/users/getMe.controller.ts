import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import usersService from '../../services/users/index.js';
import { AppError } from '../../utils/appError.util.js';

export const getMe = catchAsync(async (req: Request, res: Response) => {

    if (!req.currentUser?.id) {
        throw new AppError('No tienes una cuenta', 401);
    }

    const user = await usersService.getMe(req.currentUser.id);

    if (!user) {
        throw new AppError('No se encontró el usuario', 404);
    }

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Perfil obtenido correctamente',
        user,
    });
});
