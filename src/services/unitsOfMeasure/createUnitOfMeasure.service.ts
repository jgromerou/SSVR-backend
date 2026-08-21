import prisma from '../../lib/prisma.js';

export const createUnitOfMeasure = async (name: string, abbreviation: string) => {
    const newUnit = await prisma.units_of_measure.create({
        select: {
            id: true,
            name: true,
            abbreviation: true,
            created_at: true,
        },
        data: {
            name,
            abbreviation,
        },
    });

    return newUnit;
};
