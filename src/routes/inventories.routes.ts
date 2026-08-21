import { Router } from 'express';
import { validateAuth } from '../middlewares/auth.middleaware.js';
import inventoriesController from '../controllers/inventories/index.js';

const router = Router();

router.get('/', validateAuth, inventoriesController.getAllInventories);
router.get('/detail', validateAuth, inventoriesController.getInventory);
router.post('/create', validateAuth, inventoriesController.createInventory);
router.put('/update', validateAuth, inventoriesController.updateInventory);
router.delete('/delete', validateAuth, inventoriesController.deleteInventory);

export default router;
