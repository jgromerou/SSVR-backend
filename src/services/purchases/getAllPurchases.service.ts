import prisma from '../../lib/prisma.js';
import { formatPurchase, purchaseSelect } from './purchases.helpers.js';

export const getAllPurchases = async (company_id: number) => {
    const purchases = await prisma.purchases.findMany({
        where: { company_id },
        select: purchaseSelect,
        orderBy: { purchase_number: 'desc' },
    });

    return purchases.map(formatPurchase);
};
