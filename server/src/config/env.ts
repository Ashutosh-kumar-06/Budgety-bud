import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/pocketbuddy',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai', // 'openai' | 'anthropic' | 'gemini'
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};
