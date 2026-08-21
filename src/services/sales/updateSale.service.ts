import prisma from '../../lib/prisma.js';
import {
    formatSale,
    normalizeSaleDetails,
    saleSelect,
    validateCustomerBelongsToCompany,
    validateProductsBelongToCompany,
    type SaleDetailInput,
} from './sales.helpers.js';

type UpdateSaleData = {
    customer_id?: number | null | undefined;
    details?: SaleDetailInput[] | undefined;
};

export const updateSale = async (id: number, company_id: number, user_id: number, data: UpdateSaleData) => {
    const sale = await prisma.sales.findFirst({ where: { id, company_id } });

    if (!sale) {
        return null;
    }

    if (data.customer_id) {
        await validateCustomerBelongsToCompany(company_id, data.customer_id);
    }

    const details = data.details !== undefined ? normalizeSaleDetails(data.details) : undefined;

    if (details) {
        await validateProductsBelongToCompany(company_id, details.map((detail) => detail.product_id));
    }

    const updatedSale = await prisma.sales.update({
        where: { id },
        data: {
            ...(data.customer_id !== undefined && { customer_id: data.customer_id }),
            ...(details && {
                sale_details: {
                    deleteMany: {},
                    create: details.map((detail) => ({
                        product_id: detail.product_id,
                        quantity: detail.quantity,
                        unit_price: detail.unit_price,
                        discount: detail.discount,
                        created_by: user_id,
                    })),
                },
            }),
        },
        select: saleSelect,
    });

    return formatSale(updatedSale);
};
