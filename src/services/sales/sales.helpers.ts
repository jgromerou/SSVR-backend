import prisma from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../../utils/appError.util.js';

export const saleSelect = {
    id: true,
    sale_number: true,
    customer_id: true,
    created_at: true,
    customers: {
        select: {
            id: true,
            name: true,
        },
    },
    sale_details: {
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

type SaleDetailRow = {
    id: number;
    product_id: number;
    quantity: unknown;
    unit_price: unknown;
    discount: unknown;
    created_at: Date | null;
    products: { id: number; name: string };
};

export const formatSale = (sale: {
    id: number;
    sale_number: number;
    customer_id: number | null;
    created_at: Date | null;
    customers: { id: number; name: string } | null;
    sale_details: SaleDetailRow[];
}) => {
    const details = sale.sale_details.map((detail) => ({
        id: detail.id,
        product: detail.products,
        quantity: Number(detail.quantity),
        unit_price: Number(detail.unit_price),
        discount: Number(detail.discount),
        created_at: detail.created_at,
        subtotal: Number(detail.quantity) * Number(detail.unit_price) - Number(detail.discount),
    }));

    return {
        id: sale.id,
        sale_number: sale.sale_number,
        customer: sale.customers,
        created_at: sale.created_at,
        details,
        total: details.reduce((acc, detail) => acc + detail.subtotal, 0),
    };
};

export type SaleDetailInput = {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount?: number;
};

export const normalizeSaleDetails = (details: SaleDetailInput[]) => {
    if (!Array.isArray(details) || details.length === 0) {
        throw new AppError('La venta debe tener al menos un detalle', 400);
    }

    return details.map((detail) => {
        const product_id = Number(detail.product_id);
        const quantity = Number(detail.quantity);
        const unit_price = Number(detail.unit_price);
        const discount = detail.discount != null ? Number(detail.discount) : 0;

        if (!product_id || quantity <= 0 || unit_price < 0 || discount < 0) {
            throw new AppError('Los detalles de la venta contienen datos inválidos', 400);
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

export const validateCustomerBelongsToCompany = async (company_id: number, customer_id: number) => {
    const customer = await prisma.customers.findFirst({
        where: { id: customer_id, company_id },
        select: { id: true },
    });

    if (!customer) {
        throw new AppError('El cliente no existe', 400);
    }
};

export const getNextSaleNumber = async (tx: Prisma.TransactionClient, company_id: number) => {
    const lastSale = await tx.sales.findFirst({
        where: { company_id },
        orderBy: { sale_number: 'desc' },
        select: { sale_number: true },
    });

    return (lastSale?.sale_number ?? 0) + 1;
};
