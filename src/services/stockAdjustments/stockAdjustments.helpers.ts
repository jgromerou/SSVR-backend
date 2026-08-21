import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';

export const stockAdjustmentSelect = {
    id: true,
    quantity: true,
    reason: true,
    created_at: true,
    products: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

export const formatStockAdjustment = (adjustment: {
    id: number;
    quantity: unknown;
    reason: string;
    created_at: Date | null;
    products: { id: number; name: string };
}) => ({
    id: adjustment.id,
    product: adjustment.products,
    quantity: Number(adjustment.quantity),
    reason: adjustment.reason,
    created_at: adjustment.created_at,
});

export const validateProductBelongsToCompany = async (company_id: number, product_id: number) => {
    const product = await prisma.products.findFirst({
        where: { id: product_id, company_id },
        select: { id: true },
    });

    if (!product) {
        throw new AppError('El producto no existe', 400);
    }
};

export const validateQuantity = (quantity: number) => {
    if (!Number.isFinite(quantity) || quantity === 0) {
        throw new AppError('La cantidad del ajuste debe ser distinta de cero', 400);
    }
};
