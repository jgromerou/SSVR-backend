import prisma from '../../lib/prisma.js';

export const deleteSalesReturn = async (id: number, company_id: number) => {
    const salesReturn = await prisma.sales_returns.findFirst({ where: { id, company_id } });

    if (!salesReturn) {
        return null;
    }

    await prisma.sales_returns.delete({ where: { id } });

    return true;
};
