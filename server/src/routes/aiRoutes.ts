import { Router } from 'express';
import { body } from 'express-validator';
import * as aiController from '../controllers/aiController';
import { catchAsync } from '../utils/catchAsync';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.post(
  '/chat',
  validate([
    body('message').notEmpty().withMessage('Message is required').isString(),
  ]),
  catchAsync(aiController.chat)
);

export default router;
