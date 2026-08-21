import prisma from '../../lib/prisma.js';
import {
    formatStockAdjustment,
    stockAdjustmentSelect,
    validateProductBelongsToCompany,
    validateQuantity,
} from './stockAdjustments.helpers.js';

type UpdateStockAdjustmentData = {
    product_id?: number | undefined;
    quantity?: number | undefined;
    reason?: string | undefined;
};

export const updateStockAdjustment = async (
    id: number,
    company_id: number,
    data: UpdateStockAdjustmentData
) => {
    const adjustment = await prisma.stock_adjustments.findFirst({ where: { id, company_id } });

    if (!adjustment) {
        return null;
    }

    if (data.quantity !== undefined) {
        validateQuantity(data.quantity);
    }

    if (data.product_id !== undefined) {
        await validateProductBelongsToCompany(company_id, data.product_id);
    }

    const updatedAdjustment = await prisma.stock_adjustments.update({
        where: { id },
        data: {
            ...(data.product_id !== undefined && { product_id: data.product_id }),
            ...(data.quantity !== undefined && { quantity: data.quantity }),
            ...(data.reason !== undefined && { reason: data.reason }),
        },
        select: stockAdjustmentSelect,
    });

    return formatStockAdjustment(updatedAdjustment);
};
