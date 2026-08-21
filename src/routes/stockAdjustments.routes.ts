import { Router } from 'express';
import { validateAuth } from '../middlewares/auth.middleaware.js';
import stockAdjustmentsController from '../controllers/stockAdjustments/index.js';

const router = Router();

router.get('/', validateAuth, stockAdjustmentsController.getAllStockAdjustments);
router.get('/detail', validateAuth, stockAdjustmentsController.getStockAdjustment);
router.post('/create', validateAuth, stockAdjustmentsController.createStockAdjustment);
router.put('/update', validateAuth, stockAdjustmentsController.updateStockAdjustment);
router.delete('/delete', validateAuth, stockAdjustmentsController.deleteStockAdjustment);

export default router;
