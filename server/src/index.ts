import express, { Express, Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import transactionRoutes from './routes/transactions'
import budgetRoutes from './routes/budgets'
import analyticsRoutes from './routes/analytics'
import chatRoutes from './routes/chat'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pocketbuddy'

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })

// Middleware
app.use(helmet()) // Security headers
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`))
    }
  },
  credentials: true,
}))
app.use(cookieParser())
app.use(morgan('combined')) // Logging
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'PocketBuddy server is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/chat', chatRoutes)
// TODO: app.use('/api/habits', habitRoutes)
// TODO: app.use('/api/recommendations', recommendationRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 PocketBuddy server running on port ${PORT}`)
})

export default app
