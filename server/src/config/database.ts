/**
 * PocketBuddy — MongoDB Connection Manager
 * ==========================================
 * Connects to MongoDB via Mongoose, logs lifecycle events,
 * and registers process signal handlers for graceful shutdown.
 */

import mongoose from 'mongoose';
import env from './env';

/**
 * Establish the MongoDB connection.
 * Call this once from the server entry point (index.ts).
 */
export async function connectDatabase(): Promise<void> {
  const { mongoUri, nodeEnv } = env;

  // ── Connection event handlers ───────────────────────────
  mongoose.connection.on('connected', () => {
    console.log(`✅  MongoDB connected${nodeEnv === 'development' ? ` → ${mongoUri}` : ''}`);
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('❌  MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  // ── Attempt connection ──────────────────────────────────
  try {
    await mongoose.connect(mongoUri, {
      // Mongoose 8 defaults are sane; override only what we need.
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    console.error('❌  Failed to connect to MongoDB:', (err as Error).message);
    process.exit(1);
  }
}

/**
 * Gracefully close the Mongoose connection.
 * Used when the process receives SIGINT / SIGTERM.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log('🛑  MongoDB connection closed gracefully');
  } catch (err) {
    console.error('❌  Error closing MongoDB connection:', (err as Error).message);
  }
}
