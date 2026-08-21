import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import authService from '../../services/auth/index.js';
import { AppError } from '../../utils/appError.util.js';

export const login = catchAsync(async (req: Request, res: Response) => {

    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
        throw new AppError('El email es requerido', 400);
    }

    if (!password || typeof password !== 'string') {
        throw new AppError('La contraseña es requerida', 400);
    }

    const { user, token } = await authService.login(email, password);

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Sesión iniciada correctamente',
        user,
        token,
    });
});
