import { Router, Request, Response, NextFunction } from 'express'
import { protect, type AuthRequest } from '../middlewares/auth'
import Message from '../models/Message'
import { getAIProvider } from '../services/ai/factory'

const router = Router()

const CRISIS_RESPONSE = `I'm really worried about you, and I want you to know you're not alone.

Please reach out to someone who can help right now:
• iCall (TISS): 9152987821
• Vandrevala Foundation: 1860-2662-345 (24/7)
• Your campus counselling cell

I'm your AI buddy — not a therapist — but I care about you. Talking to a real person can make a real difference.`

const CRISIS_PATTERNS = [
  /\b(kill myself|suicide|suicidal|end my life|want to die|self.?harm|hurt myself)\b/i,
  /\b(no reason to live|better off dead|can't go on|cant go on)\b/i,
]

function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(text))
}

router.get('/history', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId, limit = 50 } = req.query
    const filter: Record<string, unknown> = { userId: req.user?.id }
    if (conversationId) filter.conversationId = conversationId

    const messages = await Message.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))

    res.json(messages.reverse())
  } catch (error) {
    next(error)
  }
})

router.post('/send', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, lat, lng } = req.body
    // Generate a conversationId if not provided (required by Message schema)
    const conversationId = req.body.conversationId || `conv-${req.user?.id}-${Date.now()}`

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' })
    }

    const userMessage = await Message.create({
      userId: req.user?.id,
      conversationId,
      role: 'user',
      content,
    })

    let aiResponse: string
    let systemPrompt = 'You are a helpful student budget assistant called Budgety Bud. Keep responses brief, friendly, and focused on helping students save money.'

    if (lat && lng) {
      try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'PLACEHOLDER'
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=restaurant&maxprice=1&key=${apiKey}`
        const gRes = await fetch(url)
        const gData: any = await gRes.json()
        const placesInfo = JSON.stringify(gData.results?.slice(0, 5).map((p: any) => ({ name: p.name, rating: p.rating, vicinity: p.vicinity })))
        systemPrompt = `You are a helpful student budget assistant called Budgety Bud. The user is currently at lat: ${lat}, lng: ${lng}. Here are some nearby cheap restaurants (maxprice=1) from Google Maps: ${placesInfo}. Use this to suggest specific food options. Keep responses brief and friendly.`
      } catch (err) {
        console.error('Google Places API error', err)
      }
    }

    if (detectCrisis(content)) {
      aiResponse = CRISIS_RESPONSE
    } else {
      try {
        const provider = getAIProvider()
        aiResponse = await provider.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content }
        ])
      } catch (aiErr) {
        console.error('AI Provider error:', aiErr)
        aiResponse = "I'm having trouble connecting to my brain right now 🧠. But I'm still here for you! Try asking me again in a moment."
      }
    }

    const assistantMessage = await Message.create({
      userId: req.user?.id,
      conversationId,
      role: 'assistant',
      content: aiResponse,
    })

    res.json({ userMessage, assistantMessage, isCrisis: detectCrisis(content) })
  } catch (error) {
    next(error)
  }
})

export default router
