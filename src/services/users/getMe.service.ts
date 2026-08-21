import prisma from '../../lib/prisma.js';

export const getMe = async (user_id: number) => {
    const user = await prisma.users.findFirst({
        where: { id: user_id },
        select: {
            id: true,
            email: true,
            main_company_id: true,
            created_at: true,
            user_companies: {
                select: {
                    companies: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        main_company_id: user.main_company_id,
        created_at: user.created_at,
        companies: user.user_companies.map((membership) => membership.companies),
    };
};
