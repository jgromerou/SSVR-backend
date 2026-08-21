import prisma from '../../lib/prisma.js';
import {
    formatStockAdjustment,
    stockAdjustmentSelect,
    validateProductBelongsToCompany,
    validateQuantity,
} from './stockAdjustments.helpers.js';

export const createStockAdjustment = async (
    company_id: number,
    user_id: number,
    data: { product_id: number; quantity: number; reason: string }
) => {
    validateQuantity(data.quantity);
    await validateProductBelongsToCompany(company_id, data.product_id);

    const newAdjustment = await prisma.stock_adjustments.create({
        data: {
            company_id,
            product_id: data.product_id,
            quantity: data.quantity,
            reason: data.reason,
            created_by: user_id,
        },
        select: stockAdjustmentSelect,
    });

    return formatStockAdjustment(newAdjustment);
};
