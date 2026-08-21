import { Router } from 'express';
import authRoutes from './auth.routes.js';
import testRoutes from './test.routes.js';
import companiesRoutes from './companies.routes.js';
import categoriesRoutes from './categories.routes.js';
import productsRoutes from './products.routes.js';
import customersRoutes from './customers.routes.js';
import suppliersRoutes from './suppliers.routes.js';
import usersRoutes from './users.routes.js';
import userCompaniesRoutes from './userCompanies.routes.js';
import unitsOfMeasureRoutes from './unitsOfMeasure.routes.js';
import salesRoutes from './sales.routes.js';
import purchasesRoutes from './purchases.routes.js';
import salesReturnsRoutes from './salesReturns.routes.js';
import stockAdjustmentsRoutes from './stockAdjustments.routes.js';
import inventoriesRoutes from './inventories.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/test', testRoutes);
router.use('/companies', companiesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/customers', customersRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/users', usersRoutes);
router.use('/user-companies', userCompaniesRoutes);
router.use('/units-of-measure', unitsOfMeasureRoutes);
router.use('/sales', salesRoutes);
router.use('/purchases', purchasesRoutes);
router.use('/sales-returns', salesReturnsRoutes);
router.use('/stock-adjustments', stockAdjustmentsRoutes);
router.use('/inventories', inventoriesRoutes);

export default router;
