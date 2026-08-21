import prisma from '../../lib/prisma.js';

export const deleteInventory = async (id: number, company_id: number) => {
    const inventory = await prisma.inventories.findFirst({ where: { id, company_id } });

    if (!inventory) {
        return null;
    }

    await prisma.inventories.delete({ where: { id } });

    return true;
};
