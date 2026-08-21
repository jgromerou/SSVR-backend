import { Router } from 'express';
import { validateAuth } from '../middlewares/auth.middleaware.js';
import salesController from '../controllers/sales/index.js';

const router = Router();

router.get('/', validateAuth, salesController.getAllSales);
router.get('/detail', validateAuth, salesController.getSale);
router.post('/create', validateAuth, salesController.createSale);
router.put('/update', validateAuth, salesController.updateSale);
router.delete('/delete', validateAuth, salesController.deleteSale);

export default router;
