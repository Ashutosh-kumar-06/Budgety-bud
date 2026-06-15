import { Router, Request, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { User } from '../models/User'
import { hashPassword } from '../utils/password'

const router = Router()

// Get current user profile
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      campus: user.campus,
      major: user.major,
      livingSituation: user.livingSituation,
      preferences: user.preferences,
      chatbotPersona: user.chatbotPersona,
    })
  } catch (error) {
    next(error)
  }
})

// Update user profile
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, age, campus, major, livingSituation, incomeLevel, preferences, chatbotPersona } = req.body

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (age) updateData.age = age
    if (campus) updateData.campus = campus
    if (major) updateData.major = major
    if (livingSituation) updateData.livingSituation = livingSituation
    if (incomeLevel) updateData.incomeLevel = incomeLevel
    if (preferences) updateData.preferences = { ...preferences }
    if (chatbotPersona) updateData.chatbotPersona = chatbotPersona

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      campus: user.campus,
      major: user.major,
      preferences: user.preferences,
      chatbotPersona: user.chatbotPersona,
    })
  } catch (error) {
    next(error)
  }
})

// Change password
router.post('/me/change-password', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' })
    }

    // TODO: Verify old password and update

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
