import prisma from '../../lib/prisma.js';
import {
    formatInventory,
    getNextInventoryNumber,
    inventorySelect,
    normalizeInventoryDetails,
    validateProductsBelongToCompany,
    type InventoryDetailInput,
} from './inventories.helpers.js';

export const createInventory = async (company_id: number, user_id: number, details: InventoryDetailInput[]) => {
    const normalizedDetails = normalizeInventoryDetails(details);

    await validateProductsBelongToCompany(company_id, normalizedDetails.map((detail) => detail.product_id));

    const newInventory = await prisma.$transaction(async (tx) => {
        const inventory_number = await getNextInventoryNumber(tx, company_id);

        return tx.inventories.create({
            data: {
                company_id,
                inventory_number,
                created_by: user_id,
                inventory_details: {
                    create: normalizedDetails.map((detail) => ({
                        product_id: detail.product_id,
                        quantity: detail.quantity,
                        created_by: user_id,
                    })),
                },
            },
            select: inventorySelect,
        });
    });

    return formatInventory(newInventory);
};
