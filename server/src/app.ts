import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/error';
import { AppError } from './utils/AppError';
import routes from './routes';

const app: Application = express();

// Security HTTP headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
}));

// Routes
app.use('/api', routes);

// Unhandled route
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
