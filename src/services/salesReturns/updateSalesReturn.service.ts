import prisma from '../../lib/prisma.js';
import {
    formatSalesReturn,
    normalizeReturnDetails,
    salesReturnSelect,
    validateReturnQuantities,
    type SalesReturnDetailInput,
} from './salesReturns.helpers.js';

export const updateSalesReturn = async (
    id: number,
    company_id: number,
    user_id: number,
    details: SalesReturnDetailInput[]
) => {
    const salesReturn = await prisma.sales_returns.findFirst({ where: { id, company_id } });

    if (!salesReturn) {
        return null;
    }

    const normalizedDetails = normalizeReturnDetails(details);

    await validateReturnQuantities(salesReturn.sale_id, normalizedDetails, id);

    const updatedReturn = await prisma.sales_returns.update({
        where: { id },
        data: {
            sales_return_details: {
                deleteMany: {},
                create: normalizedDetails.map((detail) => ({
                    sale_detail_id: detail.sale_detail_id,
                    quantity: detail.quantity,
                    created_by: user_id,
                })),
            },
        },
        select: salesReturnSelect,
    });

    return formatSalesReturn(updatedReturn);
};
