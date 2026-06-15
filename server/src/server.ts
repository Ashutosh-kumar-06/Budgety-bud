import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to Database
connectDB();

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT} in ${env.NODE_ENV} mode...`);
  console.log(`AI Provider configured as: ${env.AI_PROVIDER}`);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
