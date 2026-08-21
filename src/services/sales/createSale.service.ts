import prisma from '../../lib/prisma.js';
import {
    formatSale,
    getNextSaleNumber,
    normalizeSaleDetails,
    saleSelect,
    validateCustomerBelongsToCompany,
    validateProductsBelongToCompany,
    type SaleDetailInput,
} from './sales.helpers.js';

type CreateSaleData = {
    customer_id: number | null;
    details: SaleDetailInput[];
};

export const createSale = async (company_id: number, user_id: number, data: CreateSaleData) => {
    const details = normalizeSaleDetails(data.details);

    await validateProductsBelongToCompany(company_id, details.map((detail) => detail.product_id));

    if (data.customer_id) {
        await validateCustomerBelongsToCompany(company_id, data.customer_id);
    }

    const newSale = await prisma.$transaction(async (tx) => {
        const sale_number = await getNextSaleNumber(tx, company_id);

        return tx.sales.create({
            data: {
                company_id,
                sale_number,
                customer_id: data.customer_id,
                created_by: user_id,
                sale_details: {
                    create: details.map((detail) => ({
                        product_id: detail.product_id,
                        quantity: detail.quantity,
                        unit_price: detail.unit_price,
                        discount: detail.discount,
                        created_by: user_id,
                    })),
                },
            },
            select: saleSelect,
        });
    });

    return formatSale(newSale);
};
