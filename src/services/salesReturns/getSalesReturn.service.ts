import prisma from '../../lib/prisma.js';
import { formatSalesReturn, salesReturnSelect } from './salesReturns.helpers.js';

export const getSalesReturn = async (id: number, company_id: number) => {
    const salesReturn = await prisma.sales_returns.findFirst({
        where: { id, company_id },
        select: salesReturnSelect,
    });

    if (!salesReturn) {
        return null;
    }

    return formatSalesReturn(salesReturn);
};
