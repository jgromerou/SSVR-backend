import prisma from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../../utils/appError.util.js';

export const inventorySelect = {
    id: true,
    inventory_number: true,
    created_at: true,
    inventory_details: {
        select: {
            id: true,
            product_id: true,
            quantity: true,
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

type InventoryDetailRow = {
    id: number;
    product_id: number;
    quantity: unknown;
    created_at: Date | null;
    products: { id: number; name: string };
};

export const formatInventory = (inventory: {
    id: number;
    inventory_number: number;
    created_at: Date | null;
    inventory_details: InventoryDetailRow[];
}) => ({
    id: inventory.id,
    inventory_number: inventory.inventory_number,
    created_at: inventory.created_at,
    details: inventory.inventory_details.map((detail) => ({
        id: detail.id,
        product: detail.products,
        quantity: Number(detail.quantity),
        created_at: detail.created_at,
    })),
});

export type InventoryDetailInput = {
    product_id: number;
    quantity: number;
};

export const normalizeInventoryDetails = (details: InventoryDetailInput[]) => {
    if (!Array.isArray(details) || details.length === 0) {
        throw new AppError('El inventario debe tener al menos un detalle', 400);
    }

    const normalized = details.map((detail) => {
        const product_id = Number(detail.product_id);
        const quantity = Number(detail.quantity);

        if (!product_id || quantity < 0) {
            throw new AppError('Los detalles del inventario contienen datos inválidos', 400);
        }

        return { product_id, quantity };
    });

    const uniqueIds = new Set(normalized.map((detail) => detail.product_id));

    if (uniqueIds.size !== normalized.length) {
        throw new AppError('No puedes repetir el mismo producto en el mismo inventario', 400);
    }

    return normalized;
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

export const getNextInventoryNumber = async (tx: Prisma.TransactionClient, company_id: number) => {
    const lastInventory = await tx.inventories.findFirst({
        where: { company_id },
        orderBy: { inventory_number: 'desc' },
        select: { inventory_number: true },
    });

    return (lastInventory?.inventory_number ?? 0) + 1;
};
