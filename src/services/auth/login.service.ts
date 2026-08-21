import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';
import { signToken } from '../../utils/jwt.util.js';

export const login = async (email: string, password: string) => {
    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
        throw new AppError('Email o contraseña incorrectos', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
        throw new AppError('Email o contraseña incorrectos', 401);
    }

    const token = signToken({ id: user.id });

    return {
        user: {
            id: user.id,
            email: user.email,
            main_company_id: user.main_company_id,
            created_at: user.created_at,
        },
        token,
    };
};
