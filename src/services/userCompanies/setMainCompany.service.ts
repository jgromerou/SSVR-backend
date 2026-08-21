import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';

export const setMainCompany = async (user_id: number, company_id: number) => {
    const membership = await prisma.user_companies.findFirst({
        where: { user_id, company_id },
    });

    if (!membership) {
        throw new AppError('No perteneces a esa empresa', 400);
    }

    const updatedUser = await prisma.users.update({
        where: { id: user_id },
        data: { main_company_id: company_id },
        select: {
            id: true,
            email: true,
            main_company_id: true,
        },
    });

    return updatedUser;
};
