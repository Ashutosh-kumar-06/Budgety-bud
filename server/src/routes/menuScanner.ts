import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as menuScannerController from '../controllers/menuScannerController';
import { catchAsync } from '../utils/catchAsync';
import { protect } from '../middlewares/auth';
import { AppError } from '../utils/AppError';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files (jpg, png, webp, etc.) are allowed.', 400));
    }
  },
});

/**
 * Wraps multer's single-file upload so Multer/file-filter errors are
 * converted into AppError instances and handled by the global error handler.
 */
const uploadMenuImage = (req: Request, res: Response, next: NextFunction) => {
  upload.single('menuImage')(req, res, (err: unknown) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Image is too large. Maximum size is 8MB.', 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }

    return next(err);
  });
};

const router = Router();

router.use(protect);

router.post('/scan', uploadMenuImage, catchAsync(menuScannerController.scanMenu));

export default router;