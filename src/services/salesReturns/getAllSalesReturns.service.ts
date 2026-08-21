import prisma from '../../lib/prisma.js';
import { formatSalesReturn, salesReturnSelect } from './salesReturns.helpers.js';

export const getAllSalesReturns = async (company_id: number) => {
    const salesReturns = await prisma.sales_returns.findMany({
        where: { company_id },
        select: salesReturnSelect,
        orderBy: { return_number: 'desc' },
    });

    return salesReturns.map(formatSalesReturn);
};
