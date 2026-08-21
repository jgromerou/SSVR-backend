import prisma from '../../lib/prisma.js';
import { formatStockAdjustment, stockAdjustmentSelect } from './stockAdjustments.helpers.js';

export const getAllStockAdjustments = async (company_id: number) => {
    const adjustments = await prisma.stock_adjustments.findMany({
        where: { company_id },
        select: stockAdjustmentSelect,
        orderBy: { created_at: 'desc' },
    });

    return adjustments.map(formatStockAdjustment);
};
