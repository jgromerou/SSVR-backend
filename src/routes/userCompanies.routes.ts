import { Router } from 'express';
import { validateAuth } from '../middlewares/auth.middleaware.js';
import userCompaniesController from '../controllers/userCompanies/index.js';

const router = Router();

router.get('/', validateAuth, userCompaniesController.getMyCompanies);
router.post('/join', validateAuth, userCompaniesController.joinCompany);
router.put('/main', validateAuth, userCompaniesController.setMainCompany);
router.delete('/leave', validateAuth, userCompaniesController.leaveCompany);

export default router;
