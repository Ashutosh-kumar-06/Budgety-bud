import { Router, Request, Response, NextFunction } from 'express'
import { signJWT, verifyJWT } from '../utils/jwt'
import { comparePassword, hashPassword } from '../utils/password'
import { isValidEmail, validatePasswordStrength } from '../utils/validators'
import { protect, type AuthRequest } from '../middlewares/auth'
import { User } from '../models/User'

const router = Router()

/**
 * Normalize email: trim whitespace and lowercase
 * Prevents duplicate accounts with different cases/spaces
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

// Signup
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { email, password, name } = req.body
    
    // Normalize email
    email = normalizeEmail(email)
    name = (name || '').trim()

    // Additional validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, password, and name are required',
        received: { email: !!email, password: !!password, name: !!name }
      })
    }

    if (name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' })
    }

    const passwordCheck = validatePasswordStrength(password)
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      name,
      passwordHash: hashedPassword,
    })

    // Generate tokens — use { id } to match middlewares/auth.ts protect middleware
    const accessToken = await signJWT({ id: String(user._id) }, '15m')
    const refreshToken = await signJWT({ id: String(user._id) }, '7d')

    // Set refresh token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    })
  } catch (error: any) {
    console.error('[Signup Error]', error.message)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    next(error)
  }
})

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { email, password } = req.body
    
    // Normalize email for case-insensitive lookup
    email = normalizeEmail(email)

    // Additional validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' })
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate tokens — use { id } to match middlewares/auth.ts protect middleware
    const accessToken = await signJWT({ id: String(user._id) }, '15m')
    const refreshToken = await signJWT({ id: String(user._id) }, '7d')

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    })
  } catch (error) {
    console.error('[Login Error]', error)
    next(error)
  }
})

// Get current profile
router.get('/profile', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Change password
router.post('/change-password', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { currentPassword, newPassword } = req.body

    // Required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'New password must be a string' })
    }

    const passwordCheck = validatePasswordStrength(newPassword)
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from the current password' })
    }

    // Fetch user with passwordHash (excluded by default via select: false)
    const user = await User.findById(userId).select('+passwordHash')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.passwordHash)
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash and persist the new password
    user.passwordHash = await hashPassword(newPassword)
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('[Change Password Error]', error)
    next(error)
  }
})

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out successfully' })
})

export default router