import { formatINR } from '../utils/currency'
import type { SpendingAlert, UserProfile, MoodEntry, HabitLog } from '../context/AppDataContext'

export type AIPersona = 'sweet_supportive' | 'tough_love'

export type ChatMessageType =
  | 'text'
  | 'insight_budget'
  | 'insight_wellness'
  | 'crisis'
  | 'transparency'
  | 'check_in'

export interface CoachChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: ChatMessageType
  timestamp: string
  meta?: {
    budgetLeft?: number
    todaySpent?: number
    dailyLimit?: number
    foodPercent?: number
    moodScore?: number
    actionLabel?: string
    actionPath?: string
  }
}

export interface CoachContext {
  profile: UserProfile | null
  persona: AIPersona
  budgetLeft: number
  todaySpent: number
  dailyLimit: number
  savingsGoal: number
  foodPercent: number
  moodScore: number
  alerts: SpendingAlert[]
  moodEntries: MoodEntry[]
  habitLogs: HabitLog[]
  messageCount: number
  lateNightSessions: number
  lastCheckInDate: string | null
}

const CRISIS_PATTERNS = [
  /\b(kill myself|suicide|suicidal|end my life|want to die|don't want to live|dont want to live|self.?harm|hurt myself|cutting myself)\b/i,
  /\b(no reason to live|better off dead|can't go on|cant go on)\b/i,
]

export const CAMPUS_CRISIS_RESOURCES = `I'm really worried about you, and I want you to know you're not alone.

Please reach out to someone who can help right now:
• **iCall** (TISS): 9152987821
• **Vandrevala Foundation**: 1860-2662-345 (24/7)
• **Your campus counselling cell** — most colleges offer free, confidential support

I'm your AI buddy — not a therapist — but I care about you. Talking to a real person can make a real difference. 💙`

const TRANSPARENCY_NOTE = `Quick reminder — I'm Pocket Panda, your AI buddy! I'm here to listen and help you manage money and wellness, but I'm not a human and I'm not a therapist. You've got this! 🐼`

export function detectCrisis(message: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(message))
}

export function shouldShowTransparency(messageCount: number): boolean {
  return messageCount > 0 && messageCount % 12 === 0
}

function greet(name: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Hey ${name}`
  return `Hey ${name}`
}

function tone(persona: AIPersona, sweet: string, tough: string): string {
  return persona === 'sweet_supportive' ? sweet : tough
}

export function generateDailyCheckIn(ctx: CoachContext): CoachChatMessage | null {
  const today = new Date().toISOString().split('T')[0]
  if (ctx.lastCheckInDate === today) return null

  const hour = new Date().getHours()
  const name = ctx.profile?.name ?? 'there'
  let content: string

  if (hour < 11) {
    const lastHabit = ctx.habitLogs[ctx.habitLogs.length - 1]
    const sleptLate = lastHabit && lastHabit.sleep < 6
    content = tone(
      ctx.persona,
      sleptLate
        ? `${greet(name)}! 🌤️ How did you sleep after that late night? No pressure — just checking in on you.`
        : `${greet(name)}! ☀️ How are you feeling today? Anything on your mind?`,
      sleptLate
        ? `${greet(name)}. Late nights again? How much sleep did you actually get? Be honest.`
        : `${greet(name)}. Quick check — how's your energy today?`,
    )
  } else if (hour >= 21 || hour < 4) {
    if (ctx.lateNightSessions >= 2) {
      content = tone(
        ctx.persona,
        `It's pretty late again... 🌙 I noticed you've been up studying a lot lately. How are you holding up?`,
        `Third late night in a row? Your brain needs rest. What's keeping you up?`,
      )
    } else {
      content = tone(
        ctx.persona,
        `Still up? 🌙 Just wanted to say hi — everything okay?`,
        `Late night again. Everything under control?`,
      )
    }
  } else {
    content = tone(
      ctx.persona,
      `Hey ${name}! 👋 How's your day going so far?`,
      `Hey ${name}. How's the day treating you?`,
    )
  }

  return {
    id: `checkin-${Date.now()}`,
    role: 'assistant',
    content,
    type: 'check_in',
    timestamp: new Date().toISOString(),
  }
}

export function generateContextualInsight(ctx: CoachContext): CoachChatMessage | null {
  const { alerts, persona, foodPercent, budgetLeft, todaySpent, dailyLimit } = ctx
  if (!alerts.length) return null

  const foodAlert = alerts.find((a) => a.type === 'category_increase')
  const budgetAlert = alerts.find((a) => a.type === 'daily_limit')
  const burnoutAlert = alerts.find((a) => a.type === 'burnout')

  if (foodAlert && foodPercent >= 40) {
    return {
      id: `insight-food-${Date.now()}`,
      role: 'assistant',
      content: tone(
        persona,
        `Hey, noticed we've ordered out a lot this week! 🍛 Your food budget is feeling the pinch (${foodPercent}% of spending). Want me to pull up some quick 15-minute recipes so you can relax tonight?`,
        `Real talk — ${foodPercent}% of your spending is food delivery. That's a lot. Mess thali tomorrow? Saves ₹40 easy.`,
      ),
      type: 'insight_budget',
      timestamp: new Date().toISOString(),
      meta: { foodPercent, actionLabel: 'What should I eat?', actionPath: '/food' },
    }
  }

  if (budgetAlert && todaySpent > dailyLimit) {
    const over = todaySpent - dailyLimit
    return {
      id: `insight-budget-${Date.now()}`,
      role: 'assistant',
      content: tone(
        persona,
        `We've had a bit of a spendy day — about ${formatINR(over)} over our usual limit. No stress! Maybe a chill canteen dinner tonight? 🌿`,
        `You're ${formatINR(over)} over budget today. Not the end of the world, but let's not make it a habit.`,
      ),
      type: 'insight_budget',
      timestamp: new Date().toISOString(),
      meta: { budgetLeft, todaySpent, dailyLimit, actionLabel: 'View budget', actionPath: '/budget' },
    }
  }

  if (burnoutAlert) {
    return {
      id: `insight-burnout-${Date.now()}`,
      role: 'assistant',
      content: tone(
        persona,
        `I've noticed you've been running on low energy lately... 🌿 Skipping meals or feeling stressed? It's okay to slow down. Want to talk about it?`,
        `Burnout vibes detected. Low sleep, skipped meals, or high stress — something's off. What's going on?`,
      ),
      type: 'insight_wellness',
      timestamp: new Date().toISOString(),
      meta: { moodScore: ctx.moodScore, actionLabel: 'Log wellness', actionPath: '/habits' },
    }
  }

  return null
}

export function generateWelcomeMessage(ctx: CoachContext): CoachChatMessage {
  const name = ctx.profile?.name ?? 'friend'
  const content = tone(
    ctx.persona,
    `Hey ${name}! 🐼 I'm Pocket Panda — your AI buddy for money & wellness. Think of this like texting a friend who actually remembers your budget.\n\nI'm an AI, not a human — but I'm always here to chat. What's on your mind?`,
    `Yo ${name}! 🐼 Pocket Panda here. I'll keep it real about your money and habits — no lectures unless you need them.\n\nJust so you know — I'm AI, not your therapist. But I've got your back. What's up?`,
  )

  return {
    id: 'welcome',
    role: 'assistant',
    content,
    type: 'text',
    timestamp: new Date().toISOString(),
  }
}

export function generateResponse(
  userMessage: string,
  ctx: CoachContext,
): CoachChatMessage[] {
  const responses: CoachChatMessage[] = []
  const lower = userMessage.toLowerCase()
  const name = ctx.profile?.name ?? 'friend'

  if (detectCrisis(userMessage)) {
    responses.push({
      id: `crisis-${Date.now()}`,
      role: 'assistant',
      content: CAMPUS_CRISIS_RESOURCES,
      type: 'crisis',
      timestamp: new Date().toISOString(),
    })
    return responses
  }

  const hour = new Date().getHours()
  const isLateNight = hour >= 23 || hour < 4

  // Burnout pattern: late night + study mentions
  if (isLateNight && /study|exam|assignment|test|prepar/.test(lower)) {
    responses.push({
      id: `burnout-hint-${Date.now()}`,
      role: 'assistant',
      content: tone(
        ctx.persona,
        `Studying this late again? 📚 I get it — exams are tough. But your brain needs rest to actually remember stuff. Maybe a 10-min break?`,
        `3 AM study session? Your future self is going to hate you. At least hydrate and set an alarm.`,
      ),
      type: 'text',
      timestamp: new Date().toISOString(),
    })
  }

  let mainContent: string

  if (/stress|anxious|overwhelm|burnout|exhausted|can't cope|cant cope/.test(lower)) {
    mainContent = tone(
      ctx.persona,
      `I hear you, ${name}. 💙 Stress is real — especially in college. Maybe take a short break? A warm chai, a walk around campus, or just venting here is totally okay.\n\nDid spending time with friends or alone help you de-stress lately?`,
      `Stress sucks. No sugarcoating it. What's the main thing weighing on you — money, studies, or something else?\n\nAnd real talk — are you taking care of basics? Food, sleep, water?`,
    )
  } else if (/friend|hangout|went out|party|coffee/.test(lower)) {
    mainContent = tone(
      ctx.persona,
      `Sounds like a good time! 🎉 Hanging out is important. Did it help you feel better?\n\nJust a gentle heads-up — social outings can add up. You've got ${formatINR(ctx.budgetLeft)} left today if you're planning more.`,
      `Social life matters. Did you end up spending more than planned though? You've got ${formatINR(ctx.budgetLeft)} left today.`,
    )
  } else if (/pizza|burger|biryani|swiggy|zomato|order/.test(lower)) {
    const canAfford = ctx.budgetLeft >= 80
    mainContent = tone(
      ctx.persona,
      canAfford
        ? `Craving something good? 🍕 You've got ${formatINR(ctx.budgetLeft)} left today — sharing with a friend could make it even better!`
        : `Tight budget day — only ${formatINR(ctx.budgetLeft)} left. How about mess food or splitting something with a roommate?`,
      canAfford
        ? `${formatINR(ctx.budgetLeft)} left today. You can probably swing it — but don't make it a daily thing.`
        : `Only ${formatINR(ctx.budgetLeft)} left. Mess thali is ₹80. Your call.`,
    )
  } else if (/afford|can i buy|should i spend/.test(lower)) {
    mainContent = tone(
      ctx.persona,
      `Let me check... You've got ${formatINR(ctx.budgetLeft)} left for today (limit: ${formatINR(ctx.dailyLimit)}). What are you thinking of getting?`,
      `${formatINR(ctx.budgetLeft)} left today. Tell me what you want and I'll be straight with you.`,
    )
  } else if (/budget|spent|money|balance/.test(lower)) {
    mainContent = tone(
      ctx.persona,
      `Here's where we're at today:\n• Spent: ${formatINR(ctx.todaySpent)}\n• Left: ${formatINR(ctx.budgetLeft)}\n• Daily limit: ${formatINR(ctx.dailyLimit)}\n\nSaving ${formatINR(ctx.savingsGoal)}/month — you're doing better than you think! 🌱`,
      `Today's numbers:\n• Spent: ${formatINR(ctx.todaySpent)} / ${formatINR(ctx.dailyLimit)}\n• Left: ${formatINR(ctx.budgetLeft)}\n\nMonthly savings goal: ${formatINR(ctx.savingsGoal)}. Stay sharp.`,
    )
    responses.push({
      id: `budget-card-${Date.now()}`,
      role: 'assistant',
      content: '',
      type: 'insight_budget',
      timestamp: new Date().toISOString(),
      meta: {
        budgetLeft: ctx.budgetLeft,
        todaySpent: ctx.todaySpent,
        dailyLimit: ctx.dailyLimit,
        actionLabel: 'Full budget',
        actionPath: '/budget',
      },
    })
  } else if (/sleep|tired|insomnia|can't sleep|cant sleep/.test(lower)) {
    mainContent = tone(
      ctx.persona,
      `Sleep is everything, ${name}. 😴 How many hours did you get last night? If it's been rough, even a 20-min nap between classes helps.`,
      `How much sleep? Be honest. Under 6 hours and your grades AND wallet suffer — tired people order more delivery.`,
    )
  } else if (/save|saving|streak/.test(lower)) {
    mainContent = tone(
      ctx.persona,
      `Love that you're thinking about savings! 🌱 Even saving 10% of pocket money is huge for a student. Your goal is ${formatINR(ctx.savingsGoal)}/month — small steps count.`,
      `Savings goal: ${formatINR(ctx.savingsGoal)}/month. Skip one Swiggy order a week and you're halfway there.`,
    )
  } else if (/food|eat|hungry|recipe|canteen/.test(lower)) {
    mainContent = tone(
      ctx.persona,
      `Hungry? 🍛 I can suggest something based on your mood and budget — tap below! Mess thali is always a solid ₹80 option.`,
      `Food time. What's your budget? Mess is cheapest. I can suggest options if you want.`,
    )
    responses.push({
      id: `food-action-${Date.now()}`,
      role: 'assistant',
      content: '',
      type: 'insight_budget',
      timestamp: new Date().toISOString(),
      meta: { actionLabel: 'What should I eat?', actionPath: '/food' },
    })
  } else if (/thank|thanks|ty/.test(lower)) {
    mainContent = tone(
      ctx.persona,
      `Anytime, ${name}! 💚 That's what I'm here for.`,
      `You got it. Now go crush your day.`,
    )
  } else {
    mainContent = tone(
      ctx.persona,
      `I'm listening, ${name}! Tell me more — whether it's money stress, food cravings, or just needing to vent. No judgment here. 🐼`,
      `What's on your mind? Money, mood, food — shoot.`,
    )
  }

  responses.push({
    id: `reply-${Date.now()}`,
    role: 'assistant',
    content: mainContent,
    type: 'text',
    timestamp: new Date().toISOString(),
  })

  if (shouldShowTransparency(ctx.messageCount + 1)) {
    responses.push({
      id: `transparency-${Date.now()}`,
      role: 'assistant',
      content: TRANSPARENCY_NOTE,
      type: 'transparency',
      timestamp: new Date().toISOString(),
    })
  }

  return responses
}

export const PERSONA_OPTIONS: { id: AIPersona; label: string; emoji: string; desc: string }[] = [
  {
    id: 'sweet_supportive',
    label: 'Sweet & Supportive',
    emoji: '💚',
    desc: 'Like a caring partner — gentle, warm, and encouraging',
  },
  {
    id: 'tough_love',
    label: 'Tough Love Best Friend',
    emoji: '💪',
    desc: 'Direct and honest — keeps you accountable with love',
  },
]
