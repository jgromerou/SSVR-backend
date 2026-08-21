import { Router } from 'express';
import { validateAuth } from '../middlewares/auth.middleaware.js';
import salesReturnsController from '../controllers/salesReturns/index.js';

const router = Router();

router.get('/', validateAuth, salesReturnsController.getAllSalesReturns);
router.get('/detail', validateAuth, salesReturnsController.getSalesReturn);
router.post('/create', validateAuth, salesReturnsController.createSalesReturn);
router.put('/update', validateAuth, salesReturnsController.updateSalesReturn);
router.delete('/delete', validateAuth, salesReturnsController.deleteSalesReturn);

export default router;
