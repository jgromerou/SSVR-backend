import prisma from '../../lib/prisma.js';
import {
    formatPurchase,
    normalizePurchaseDetails,
    purchaseSelect,
    validateProductsBelongToCompany,
    validateSupplierBelongsToCompany,
    type PurchaseDetailInput,
} from './purchases.helpers.js';

type UpdatePurchaseData = {
    supplier_id?: number | null | undefined;
    details?: PurchaseDetailInput[] | undefined;
};

export const updatePurchase = async (id: number, company_id: number, user_id: number, data: UpdatePurchaseData) => {
    const purchase = await prisma.purchases.findFirst({ where: { id, company_id } });

    if (!purchase) {
        return null;
    }

    if (data.supplier_id) {
        await validateSupplierBelongsToCompany(company_id, data.supplier_id);
    }

    const details = data.details !== undefined ? normalizePurchaseDetails(data.details) : undefined;

    if (details) {
        await validateProductsBelongToCompany(company_id, details.map((detail) => detail.product_id));
    }

    const updatedPurchase = await prisma.purchases.update({
        where: { id },
        data: {
            ...(data.supplier_id !== undefined && { supplier_id: data.supplier_id }),
            ...(details && {
                purchase_details: {
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
        select: purchaseSelect,
    });

    return formatPurchase(updatedPurchase);
};
