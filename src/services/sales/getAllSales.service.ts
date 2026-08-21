import prisma from '../../lib/prisma.js';
import { formatSale, saleSelect } from './sales.helpers.js';

export const getAllSales = async (company_id: number) => {
    const sales = await prisma.sales.findMany({
        where: { company_id },
        select: saleSelect,
        orderBy: { sale_number: 'desc' },
    });

    return sales.map(formatSale);
};
