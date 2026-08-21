import prisma from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../../utils/appError.util.js';

export const salesReturnSelect = {
    id: true,
    return_number: true,
    sale_id: true,
    created_at: true,
    sales: {
        select: {
            id: true,
            sale_number: true,
        },
    },
    sales_return_details: {
        select: {
            id: true,
            sale_detail_id: true,
            quantity: true,
            created_at: true,
            sale_details: {
                select: {
                    id: true,
                    unit_price: true,
                    products: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    },
} as const;

type SalesReturnDetailRow = {
    id: number;
    sale_detail_id: number;
    quantity: unknown;
    created_at: Date | null;
    sale_details: {
        id: number;
        unit_price: unknown;
        products: { id: number; name: string };
    };
};

export const formatSalesReturn = (salesReturn: {
    id: number;
    return_number: number;
    sale_id: number;
    created_at: Date | null;
    sales: { id: number; sale_number: number };
    sales_return_details: SalesReturnDetailRow[];
}) => {
    const details = salesReturn.sales_return_details.map((detail) => ({
        id: detail.id,
        sale_detail_id: detail.sale_detail_id,
        product: detail.sale_details.products,
        quantity: Number(detail.quantity),
        unit_price: Number(detail.sale_details.unit_price),
        created_at: detail.created_at,
    }));

    return {
        id: salesReturn.id,
        return_number: salesReturn.return_number,
        sale: salesReturn.sales,
        created_at: salesReturn.created_at,
        details,
    };
};

export type SalesReturnDetailInput = {
    sale_detail_id: number;
    quantity: number;
};

export const normalizeReturnDetails = (details: SalesReturnDetailInput[]) => {
    if (!Array.isArray(details) || details.length === 0) {
        throw new AppError('La devolución debe tener al menos un detalle', 400);
    }

    const normalized = details.map((detail) => {
        const sale_detail_id = Number(detail.sale_detail_id);
        const quantity = Number(detail.quantity);

        if (!sale_detail_id || quantity <= 0) {
            throw new AppError('Los detalles de la devolución contienen datos inválidos', 400);
        }

        return { sale_detail_id, quantity };
    });

    const uniqueIds = new Set(normalized.map((detail) => detail.sale_detail_id));

    if (uniqueIds.size !== normalized.length) {
        throw new AppError('No puedes devolver el mismo detalle de venta más de una vez en la misma devolución', 400);
    }

    return normalized;
};

export const validateSaleBelongsToCompany = async (sale_id: number, company_id: number) => {
    const sale = await prisma.sales.findFirst({
        where: { id: sale_id, company_id },
        select: { id: true },
    });

    if (!sale) {
        throw new AppError('La venta no existe', 400);
    }
};

export const validateReturnQuantities = async (
    sale_id: number,
    details: SalesReturnDetailInput[],
    exclude_sales_return_id?: number
) => {
    const saleDetailIds = details.map((detail) => detail.sale_detail_id);

    const saleDetails = await prisma.sale_details.findMany({
        where: { id: { in: saleDetailIds }, sale_id },
        select: {
            id: true,
            quantity: true,
            sales_return_details: {
                ...(exclude_sales_return_id !== undefined && {
                    where: { sales_return_id: { not: exclude_sales_return_id } },
                }),
                select: { quantity: true },
            },
        },
    });

    if (saleDetails.length !== saleDetailIds.length) {
        throw new AppError('Uno o más detalles de venta no pertenecen a esta venta', 400);
    }

    for (const detail of details) {
        const saleDetail = saleDetails.find((sd) => sd.id === detail.sale_detail_id);

        if (!saleDetail) {
            continue;
        }

        const alreadyReturned = saleDetail.sales_return_details.reduce(
            (acc, returnDetail) => acc + Number(returnDetail.quantity),
            0
        );
        const available = Number(saleDetail.quantity) - alreadyReturned;

        if (detail.quantity > available) {
            throw new AppError(
                `La cantidad a devolver del detalle ${detail.sale_detail_id} excede la cantidad disponible (${available})`,
                400
            );
        }
    }
};

export const getNextReturnNumber = async (tx: Prisma.TransactionClient, company_id: number) => {
    const lastReturn = await tx.sales_returns.findFirst({
        where: { company_id },
        orderBy: { return_number: 'desc' },
        select: { return_number: true },
    });

    return (lastReturn?.return_number ?? 0) + 1;
};
