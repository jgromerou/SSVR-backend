import { Router } from 'express';
import { validateAuth } from '../middlewares/auth.middleaware.js';
import usersController from '../controllers/users/index.js';

const router = Router();

router.get('/me', validateAuth, usersController.getMe);

export default router;
