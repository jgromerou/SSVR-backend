import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.util.js';
import authService from '../../services/auth/index.js';
import { AppError } from '../../utils/appError.util.js';

export const register = catchAsync(async (req: Request, res: Response) => {

    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
        throw new AppError('El email es requerido', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    const { user, token } = await authService.register(email, password);

    res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Cuenta creada correctamente',
        user,
        token,
    });
});
