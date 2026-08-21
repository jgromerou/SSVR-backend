import prisma from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../../utils/appError.util.js';

export const purchaseSelect = {
    id: true,
    purchase_number: true,
    supplier_id: true,
    created_at: true,
    suppliers: {
        select: {
            id: true,
            name: true,
        },
    },
    purchase_details: {
        select: {
            id: true,
            product_id: true,
            quantity: true,
            unit_price: true,
            discount: true,
            created_at: true,
            products: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
} as const;

type PurchaseDetailRow = {
    id: number;
    product_id: number;
    quantity: unknown;
    unit_price: unknown;
    discount: unknown;
    created_at: Date | null;
    products: { id: number; name: string };
};

export const formatPurchase = (purchase: {
    id: number;
    purchase_number: number;
    supplier_id: number | null;
    created_at: Date | null;
    suppliers: { id: number; name: string } | null;
    purchase_details: PurchaseDetailRow[];
}) => {
    const details = purchase.purchase_details.map((detail) => ({
        id: detail.id,
        product: detail.products,
        quantity: Number(detail.quantity),
        unit_price: Number(detail.unit_price),
        discount: Number(detail.discount),
        created_at: detail.created_at,
        subtotal: Number(detail.quantity) * Number(detail.unit_price) - Number(detail.discount),
    }));

    return {
        id: purchase.id,
        purchase_number: purchase.purchase_number,
        supplier: purchase.suppliers,
        created_at: purchase.created_at,
        details,
        total: details.reduce((acc, detail) => acc + detail.subtotal, 0),
    };
};

export type PurchaseDetailInput = {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount?: number;
};

export const normalizePurchaseDetails = (details: PurchaseDetailInput[]) => {
    if (!Array.isArray(details) || details.length === 0) {
        throw new AppError('La compra debe tener al menos un detalle', 400);
    }

    return details.map((detail) => {
        const product_id = Number(detail.product_id);
        const quantity = Number(detail.quantity);
        const unit_price = Number(detail.unit_price);
        const discount = detail.discount != null ? Number(detail.discount) : 0;

        if (!product_id || quantity <= 0 || unit_price < 0 || discount < 0) {
            throw new AppError('Los detalles de la compra contienen datos inválidos', 400);
        }

        return { product_id, quantity, unit_price, discount };
    });
};

export const validateProductsBelongToCompany = async (company_id: number, product_ids: number[]) => {
    const uniqueIds = [...new Set(product_ids)];

    const products = await prisma.products.findMany({
        where: { id: { in: uniqueIds }, company_id },
        select: { id: true },
    });

    if (products.length !== uniqueIds.length) {
        throw new AppError('Uno o más productos no existen', 400);
    }
};

export const validateSupplierBelongsToCompany = async (company_id: number, supplier_id: number) => {
    const supplier = await prisma.suppliers.findFirst({
        where: { id: supplier_id, company_id },
        select: { id: true },
    });

    if (!supplier) {
        throw new AppError('El proveedor no existe', 400);
    }
};

export const getNextPurchaseNumber = async (tx: Prisma.TransactionClient, company_id: number) => {
    const lastPurchase = await tx.purchases.findFirst({
        where: { company_id },
        orderBy: { purchase_number: 'desc' },
        select: { purchase_number: true },
    });

    return (lastPurchase?.purchase_number ?? 0) + 1;
};
