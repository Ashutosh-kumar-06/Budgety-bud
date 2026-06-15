import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { catchAsync } from '../utils/catchAsync';
import { validate } from '../middlewares/validate';

const router = Router();

router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
  ]),
  catchAsync(authController.register)
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  catchAsync(authController.login)
);

export default router;
