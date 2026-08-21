import prisma from '../../lib/prisma.js';

export const updateUnitOfMeasure = async (id: number, name: string, abbreviation: string) => {
    const unit = await prisma.units_of_measure.findFirst({ where: { id } });

    if (!unit) {
        return null;
    }

    const updatedUnit = await prisma.units_of_measure.update({
        where: { id },
        data: { name, abbreviation },
        select: {
            id: true,
            name: true,
            abbreviation: true,
            created_at: true,
        },
    });

    return updatedUnit;
};
