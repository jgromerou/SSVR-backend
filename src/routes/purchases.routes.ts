import { Router } from 'express';
import { validateAuth } from '../middlewares/auth.middleaware.js';
import purchasesController from '../controllers/purchases/index.js';

const router = Router();

router.get('/', validateAuth, purchasesController.getAllPurchases);
router.get('/detail', validateAuth, purchasesController.getPurchase);
router.post('/create', validateAuth, purchasesController.createPurchase);
router.put('/update', validateAuth, purchasesController.updatePurchase);
router.delete('/delete', validateAuth, purchasesController.deletePurchase);

export default router;
