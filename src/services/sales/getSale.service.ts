import prisma from '../../lib/prisma.js';
import { formatSale, saleSelect } from './sales.helpers.js';

export const getSale = async (id: number, company_id: number) => {
    const sale = await prisma.sales.findFirst({
        where: { id, company_id },
        select: saleSelect,
    });

    if (!sale) {
        return null;
    }

    return formatSale(sale);
};
