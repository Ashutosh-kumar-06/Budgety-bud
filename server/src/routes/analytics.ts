import { Router, Request, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import Transaction from '../models/Transaction'

const router = Router()

// Get spending summary
router.get('/spending-summary', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: { $oid: req.userId },
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ])

    const expenses = summary.find((s) => s._id === 'expense')?.total || 0
    const income = summary.find((s) => s._id === 'income')?.total || 0

    res.json({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      income,
      expenses,
      balance: income - expenses,
    })
  } catch (error) {
    next(error)
  }
})

// Get category breakdown
router.get('/category-breakdown', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          userId: { $oid: req.userId },
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { amount: -1 },
      },
    ])

    res.json(breakdown)
  } catch (error) {
    next(error)
  }
})

// Get spending trends
router.get('/trends', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId: { $oid: req.userId },
          type: 'expense',
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          amount: { $sum: '$amount' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    res.json(trends)
  } catch (error) {
    next(error)
  }
})

export default router
