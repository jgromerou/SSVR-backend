import prisma from '../../lib/prisma.js';
import { formatStockAdjustment, stockAdjustmentSelect } from './stockAdjustments.helpers.js';

export const getStockAdjustment = async (id: number, company_id: number) => {
    const adjustment = await prisma.stock_adjustments.findFirst({
        where: { id, company_id },
        select: stockAdjustmentSelect,
    });

    if (!adjustment) {
        return null;
    }

    return formatStockAdjustment(adjustment);
};
