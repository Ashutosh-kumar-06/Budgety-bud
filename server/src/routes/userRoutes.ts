import { Router } from 'express';
import * as userController from '../controllers/userController';
import { catchAsync } from '../utils/catchAsync';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/profile', catchAsync(userController.getProfile));

export default router;
