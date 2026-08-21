import prisma from '../../lib/prisma.js';
import { formatInventory, inventorySelect } from './inventories.helpers.js';

export const getInventory = async (id: number, company_id: number) => {
    const inventory = await prisma.inventories.findFirst({
        where: { id, company_id },
        select: inventorySelect,
    });

    if (!inventory) {
        return null;
    }

    return formatInventory(inventory);
};
