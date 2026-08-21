import prisma from '../../lib/prisma.js';
import {
    formatInventory,
    inventorySelect,
    normalizeInventoryDetails,
    validateProductsBelongToCompany,
    type InventoryDetailInput,
} from './inventories.helpers.js';

export const updateInventory = async (
    id: number,
    company_id: number,
    user_id: number,
    details: InventoryDetailInput[]
) => {
    const inventory = await prisma.inventories.findFirst({ where: { id, company_id } });

    if (!inventory) {
        return null;
    }

    const normalizedDetails = normalizeInventoryDetails(details);

    await validateProductsBelongToCompany(company_id, normalizedDetails.map((detail) => detail.product_id));

    const updatedInventory = await prisma.inventories.update({
        where: { id },
        data: {
            inventory_details: {
                deleteMany: {},
                create: normalizedDetails.map((detail) => ({
                    product_id: detail.product_id,
                    quantity: detail.quantity,
                    created_by: user_id,
                })),
            },
        },
        select: inventorySelect,
    });

    return formatInventory(updatedInventory);
};
