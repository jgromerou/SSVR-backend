import prisma from '../../lib/prisma.js';

export const deletePurchase = async (id: number, company_id: number) => {
    const purchase = await prisma.purchases.findFirst({ where: { id, company_id } });

    if (!purchase) {
        return null;
    }

    await prisma.purchases.delete({ where: { id } });

    return true;
};
