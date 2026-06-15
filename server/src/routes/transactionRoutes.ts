import { Router } from 'express';
import { body } from 'express-validator';
import * as transactionController from '../controllers/transactionController';
import { catchAsync } from '../utils/catchAsync';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.post(
  '/',
  validate([
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').notEmpty().withMessage('Category is required'),
  ]),
  catchAsync(transactionController.createTransaction)
);

router.get('/', catchAsync(transactionController.getAllTransactions));
router.get('/:id', catchAsync(transactionController.getTransaction));
router.delete('/:id', catchAsync(transactionController.deleteTransaction));

export default router;
