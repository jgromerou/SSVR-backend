import prisma from '../../lib/prisma.js';

export const createCompany = async (name: string, logo: string | null, user_id: number) => {
    const user = await prisma.users.findFirst({ where: { id: user_id } });

    const newCompany = await prisma.$transaction(async (tx) => {
        const company = await tx.companies.create({
            select: {
                id: true,
                name: true,
                logo: true,
            },
            data: {
                name,
                logo: logo || null,
            },
        });

        await tx.user_companies.create({
            data: {
                user_id,
                company_id: company.id,
            },
        });

        if (!user?.main_company_id) {
            await tx.users.update({
                where: { id: user_id },
                data: { main_company_id: company.id },
            });
        }

        return company;
    });

    return newCompany;
};