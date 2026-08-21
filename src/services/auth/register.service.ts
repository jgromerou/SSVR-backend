import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';
import { signToken } from '../../utils/jwt.util.js';

const SALT_ROUNDS = 10;

export const register = async (email: string, password: string) => {
    const existingUser = await prisma.users.findFirst({ where: { email } });

    if (existingUser) {
        throw new AppError('Ya existe una cuenta con ese email', 400);
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.users.create({
        data: { email, password_hash },
        select: {
            id: true,
            email: true,
            main_company_id: true,
            created_at: true,
        },
    });

    const token = signToken({ id: user.id });

    return { user, token };
};
