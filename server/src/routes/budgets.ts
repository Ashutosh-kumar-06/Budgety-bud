import { Router, Request, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import Budget from '../models/Budget'
import Transaction from '../models/Transaction'

const router = Router()

// Get all budgets for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const budgets = await Budget.find({ userId: req.userId })

    res.json(budgets)
  } catch (error) {
    next(error)
  }
})

// Get budget with spending
router.get('/:category', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const budget = await Budget.findOne({
      userId: req.userId,
      category: req.params.category,
    })

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' })
    }

    // Get spending for this category this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: { $oid: req.userId },
          category: req.params.category,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ])

    res.json({
      budget,
      spent: spending[0]?.total || 0,
      remaining: budget.limit - (spending[0]?.total || 0),
    })
  } catch (error) {
    next(error)
  }
})

// Create budget
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, limit, period } = req.body

    if (!category || !limit) {
      return res.status(400).json({ error: 'Category and limit are required' })
    }

    const budget = await Budget.create({
      userId: req.userId,
      category,
      limit,
      period: period || 'monthly',
    })

    res.status(201).json(budget)
  } catch (error) {
    next(error)
  }
})

// Update budget
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    )

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' })
    }

    res.json(budget)
  } catch (error) {
    next(error)
  }
})

// Delete budget
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' })
    }

    res.json({ message: 'Budget deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
