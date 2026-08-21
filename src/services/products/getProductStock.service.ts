import prisma from '../../lib/prisma.js';

export const getProductStock = async (id: number, company_id: number) => {
    const product = await prisma.products.findFirst({
        where: { id, company_id },
        select: { id: true, name: true, initial_stock: true },
    });

    if (!product) {
        return null;
    }

    const [purchased, sold, returned, adjusted] = await Promise.all([
        prisma.purchase_details.aggregate({
            _sum: { quantity: true },
            where: { product_id: id, purchases: { company_id } },
        }),
        prisma.sale_details.aggregate({
            _sum: { quantity: true },
            where: { product_id: id, sales: { company_id } },
        }),
        prisma.sales_return_details.aggregate({
            _sum: { quantity: true },
            where: { sale_details: { product_id: id }, sales_returns: { company_id } },
        }),
        prisma.stock_adjustments.aggregate({
            _sum: { quantity: true },
            where: { product_id: id, company_id },
        }),
    ]);

    const initial_stock = Number(product.initial_stock);
    const total_purchased = Number(purchased._sum.quantity ?? 0);
    const total_sold = Number(sold._sum.quantity ?? 0);
    const total_returned = Number(returned._sum.quantity ?? 0);
    const total_adjusted = Number(adjusted._sum.quantity ?? 0);

    const current_stock = initial_stock + total_purchased - total_sold + total_returned + total_adjusted;

    return {
        product_id: product.id,
        product_name: product.name,
        initial_stock,
        total_purchased,
        total_sold,
        total_returned,
        total_adjusted,
        current_stock,
    };
};
