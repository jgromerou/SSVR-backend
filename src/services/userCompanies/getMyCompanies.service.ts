import prisma from '../../lib/prisma.js';

export const getMyCompanies = async (user_id: number, main_company_id: number | null) => {
    const memberships = await prisma.user_companies.findMany({
        where: { user_id },
        select: {
            companies: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    created_at: true,
                },
            },
        },
        orderBy: {
            companies: {
                name: 'asc',
            },
        },
    });

    return memberships.map((membership) => ({
        ...membership.companies,
        is_main: membership.companies.id === main_company_id,
    }));
};
