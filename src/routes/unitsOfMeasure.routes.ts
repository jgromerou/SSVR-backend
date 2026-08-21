import { Router } from 'express';
import { validateAuth } from '../middlewares/auth.middleaware.js';
import unitsOfMeasureController from '../controllers/unitsOfMeasure/index.js';

const router = Router();

router.get('/', validateAuth, unitsOfMeasureController.getAllUnitsOfMeasure);
router.get('/detail', validateAuth, unitsOfMeasureController.getUnitOfMeasure);
router.post('/create', validateAuth, unitsOfMeasureController.createUnitOfMeasure);
router.put('/update', validateAuth, unitsOfMeasureController.updateUnitOfMeasure);
router.delete('/delete', validateAuth, unitsOfMeasureController.deleteUnitOfMeasure);

export default router;
