import prisma from '../../lib/prisma.js';

export const getAllUnitsOfMeasure = async () => {
    const units = await prisma.units_of_measure.findMany({
        select: {
            id: true,
            name: true,
            abbreviation: true,
            created_at: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return units;
};
