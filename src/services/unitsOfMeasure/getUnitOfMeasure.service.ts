import prisma from '../../lib/prisma.js';

export const getUnitOfMeasure = async (id: number) => {
    const unit = await prisma.units_of_measure.findFirst({
        where: { id },
        select: {
            id: true,
            name: true,
            abbreviation: true,
            created_at: true,
        },
    });

    return unit;
};
