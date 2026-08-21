import prisma from '../../lib/prisma.js';
import { formatInventory, inventorySelect } from './inventories.helpers.js';

export const getAllInventories = async (company_id: number) => {
    const inventories = await prisma.inventories.findMany({
        where: { company_id },
        select: inventorySelect,
        orderBy: { inventory_number: 'desc' },
    });

    return inventories.map(formatInventory);
};
