import prisma from '../../lib/prisma.js';

export const deleteStockAdjustment = async (id: number, company_id: number) => {
    const adjustment = await prisma.stock_adjustments.findFirst({ where: { id, company_id } });

    if (!adjustment) {
        return null;
    }

    await prisma.stock_adjustments.delete({ where: { id } });

    return true;
};
