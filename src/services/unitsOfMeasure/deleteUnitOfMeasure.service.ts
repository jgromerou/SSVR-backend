import prisma from '../../lib/prisma.js';
import { AppError } from '../../utils/appError.util.js';

export const deleteUnitOfMeasure = async (id: number) => {
    const unit = await prisma.units_of_measure.findFirst({ where: { id } });

    if (!unit) {
        return null;
    }

    const productsCount = await prisma.products.count({
        where: { unit_of_measure_id: id },
    });

    if (productsCount > 0) {
        throw new AppError('No se puede eliminar la unidad de medida porque tiene productos asociados', 400);
    }

    await prisma.units_of_measure.delete({
        where: { id },
    });

    return true;
};
