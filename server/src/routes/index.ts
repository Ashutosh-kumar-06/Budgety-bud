import { Router } from 'express';
import authRoutes from './auth';
import chatRoutes from './chat';
import userRoutes from './userRoutes';
import transactionRoutes from './transactionRoutes';
import menuScannerRoutes from './menuScanner';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/menu-scanner', menuScannerRoutes);

export default router;