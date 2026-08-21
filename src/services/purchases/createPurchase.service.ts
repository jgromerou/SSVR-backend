import prisma from '../../lib/prisma.js';
import {
    formatPurchase,
    getNextPurchaseNumber,
    normalizePurchaseDetails,
    purchaseSelect,
    validateProductsBelongToCompany,
    validateSupplierBelongsToCompany,
    type PurchaseDetailInput,
} from './purchases.helpers.js';

type CreatePurchaseData = {
    supplier_id: number | null;
    details: PurchaseDetailInput[];
};

export const createPurchase = async (company_id: number, user_id: number, data: CreatePurchaseData) => {
    const details = normalizePurchaseDetails(data.details);

    await validateProductsBelongToCompany(company_id, details.map((detail) => detail.product_id));

    if (data.supplier_id) {
        await validateSupplierBelongsToCompany(company_id, data.supplier_id);
    }

    const newPurchase = await prisma.$transaction(async (tx) => {
        const purchase_number = await getNextPurchaseNumber(tx, company_id);

        return tx.purchases.create({
            data: {
                company_id,
                purchase_number,
                supplier_id: data.supplier_id,
                created_by: user_id,
                purchase_details: {
                    create: details.map((detail) => ({
                        product_id: detail.product_id,
                        quantity: detail.quantity,
                        unit_price: detail.unit_price,
                        discount: detail.discount,
                        created_by: user_id,
                    })),
                },
            },
            select: purchaseSelect,
        });
    });

    return formatPurchase(newPurchase);
};
