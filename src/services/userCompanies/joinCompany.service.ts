import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';

export const joinCompany = async (user_id: number, company_id: number) => {
    const company = await prisma.companies.findFirst({
        where: { id: company_id },
    });

    if (!company) {
        throw new AppError('No se encontró la empresa', 400);
    }

    const existingMembership = await prisma.user_companies.findFirst({
        where: { user_id, company_id },
    });

    if (existingMembership) {
        throw new AppError('Ya perteneces a esa empresa', 400);
    }

    const user = await prisma.users.findFirst({ where: { id: user_id } });

    await prisma.$transaction(async (tx) => {
        await tx.user_companies.create({
            data: { user_id, company_id },
        });

        if (!user?.main_company_id) {
            await tx.users.update({
                where: { id: user_id },
                data: { main_company_id: company_id },
            });
        }
    });

    return company;
};
