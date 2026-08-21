import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';

export const leaveCompany = async (user_id: number, company_id: number) => {
    const membership = await prisma.user_companies.findFirst({
        where: { user_id, company_id },
    });

    if (!membership) {
        throw new AppError('No perteneces a esa empresa', 400);
    }

    const user = await prisma.users.findFirst({ where: { id: user_id } });

    await prisma.$transaction(async (tx) => {
        await tx.user_companies.delete({
            where: { user_id_company_id: { user_id, company_id } },
        });

        if (user?.main_company_id === company_id) {
            const nextMembership = await tx.user_companies.findFirst({
                where: { user_id, company_id: { not: company_id } },
                orderBy: { created_at: 'asc' },
            });

            await tx.users.update({
                where: { id: user_id },
                data: { main_company_id: nextMembership?.company_id ?? null },
            });
        }
    });

    return true;
};
