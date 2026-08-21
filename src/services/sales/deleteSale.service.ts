import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';

export const deleteSale = async (id: number, company_id: number) => {
    const sale = await prisma.sales.findFirst({ where: { id, company_id } });

    if (!sale) {
        return null;
    }

    const returnsCount = await prisma.sales_return_details.count({
        where: { sale_details: { sale_id: id } },
    });

    if (returnsCount > 0) {
        throw new AppError('No se puede eliminar la venta porque tiene devoluciones asociadas', 400);
    }

    await prisma.sales.delete({ where: { id } });

    return true;
};
