import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';
import {
    formatSalesReturn,
    getNextReturnNumber,
    normalizeReturnDetails,
    salesReturnSelect,
    validateReturnQuantities,
    validateSaleBelongsToCompany,
    type SalesReturnDetailInput,
} from './salesReturns.helpers.js';

type CreateSalesReturnData = {
    sale_id: number;
    details: SalesReturnDetailInput[];
};

export const createSalesReturn = async (company_id: number, user_id: number, data: CreateSalesReturnData) => {
    if (!data.sale_id) {
        throw new AppError('La venta es requerida', 400);
    }

    const details = normalizeReturnDetails(data.details);

    await validateSaleBelongsToCompany(data.sale_id, company_id);
    await validateReturnQuantities(data.sale_id, details);

    const newReturn = await prisma.$transaction(async (tx) => {
        const return_number = await getNextReturnNumber(tx, company_id);

        return tx.sales_returns.create({
            data: {
                company_id,
                return_number,
                sale_id: data.sale_id,
                created_by: user_id,
                sales_return_details: {
                    create: details.map((detail) => ({
                        sale_detail_id: detail.sale_detail_id,
                        quantity: detail.quantity,
                        created_by: user_id,
                    })),
                },
            },
            select: salesReturnSelect,
        });
    });

    return formatSalesReturn(newReturn);
};
