import prisma from '../../lib/prisma.js';
import { formatPurchase, purchaseSelect } from './purchases.helpers.js';

export const getPurchase = async (id: number, company_id: number) => {
    const purchase = await prisma.purchases.findFirst({
        where: { id, company_id },
        select: purchaseSelect,
    });

    if (!purchase) {
        return null;
    }

    return formatPurchase(purchase);
};
