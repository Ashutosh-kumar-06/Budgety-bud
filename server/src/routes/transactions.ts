import { Router, Request, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { Transaction } from '../models/Transaction'

const router = Router()

// Get all transactions with filters
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, category, type, skip = 0, limit = 20 } = req.query

    const filter: Record<string, unknown> = { userId: req.userId }

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate as string)
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate as string)
    }

    if (category) filter.category = category
    if (type) filter.type = type

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(parseInt(skip as string) || 0)
      .limit(parseInt(limit as string) || 20)

    const total = await Transaction.countDocuments(filter)

    res.json({
      transactions,
      total,
      page: Math.floor(parseInt(skip as string) / parseInt(limit as string)) + 1,
    })
  } catch (error) {
    next(error)
  }
})

// Create transaction
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date, amount, type, category, merchant, description } = req.body

    if (!date || !amount || !type || !category) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const transaction = await Transaction.create({
      userId: req.userId,
      date: new Date(date),
      amount,
      type,
      category,
      merchant,
      description,
    })

    res.status(201).json(transaction)
  } catch (error) {
    next(error)
  }
})

// Update transaction
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    )

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }

    res.json(transaction)
  } catch (error) {
    next(error)
  }
})

// Delete transaction
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }

    res.json({ message: 'Transaction deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
