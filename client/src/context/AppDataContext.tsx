import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  SAMPLE_TRANSACTIONS,
  INDIAN_BANKS,
  PANDA_TIPS,
  type MockTransaction,
  type MoodType,
  type ExpenseCategoryId,
  categorizeExpense,
  getRewardLevel,
  getRewardEmoji,
} from '../data/indianMockData'
import type { AIPersona, CoachChatMessage } from '../services/aiCoachEngine'

export interface UserProfile {
  name: string
  age: number
  college: string
  pocketMoney: number
  monthlySavingsGoal: number
  monthlyBudget: number
  dailySpendingLimit: number
  onboarded: boolean
  aiPersona?: AIPersona
}

export interface MoodEntry {
  date: string
  mood: MoodType
  energy: number
  stress: number
}

export interface HabitLog {
  date: string
  sleep: number
  meals: number
  water: number
  exercise: number
}

export interface SpendingAlert {
  id: string
  type: 'daily_limit' | 'spending_spike' | 'category_increase' | 'burnout'
  message: string
  severity: 'info' | 'warning' | 'gentle'
}

interface CoachMeta {
  messageCount: number
  lateNightSessions: number
  lastCheckInDate: string | null
}

interface AppDataContextType {
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  aiPersona: AIPersona
  setAiPersona: (persona: AIPersona) => void
  chatMessages: CoachChatMessage[]
  setChatMessages: (messages: CoachChatMessage[] | ((prev: CoachChatMessage[]) => CoachChatMessage[])) => void
  coachMeta: CoachMeta
  updateCoachMeta: (patch: Partial<CoachMeta>) => void
  transactions: MockTransaction[]
  addTransaction: (tx: Omit<MockTransaction, 'id'>) => void
  banks: typeof INDIAN_BANKS
  moodEntries: MoodEntry[]
  logMood: (entry: Omit<MoodEntry, 'date'>) => void
  habitLogs: HabitLog[]
  logHabits: (log: Omit<HabitLog, 'date'>) => void
  savingsStreak: number
  eatingStreak: number
  moodStreak: number
  pandaTip: string
  alerts: SpendingAlert[]
  todaySpent: number
  budgetLeft: number
  savingsGoal: number
  foodPercent: number
  savingsProgress: number
  moodScore: number
  rewardLevel: ReturnType<typeof getRewardLevel>
  rewardEmoji: string
}

const STORAGE_KEY = 'pocketbuddy-india-data'

const defaultProfile: UserProfile = {
  name: 'Arjun',
  age: 20,
  college: 'IIT Delhi',
  pocketMoney: 5000,
  monthlySavingsGoal: 1500,
  monthlyBudget: 3500,
  dailySpendingLimit: 116,
  onboarded: true,
}

const AppDataContext = createContext<AppDataContextType | null>(null)

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() =>
    loadStored('profile', defaultProfile)
  )
  const [transactions, setTransactions] = useState<MockTransaction[]>(() =>
    loadStored('transactions', SAMPLE_TRANSACTIONS)
  )
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(() =>
    loadStored('moodEntries', [
      { date: new Date().toISOString().split('T')[0], mood: 'happy', energy: 7, stress: 3 },
    ])
  )
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() =>
    loadStored('habitLogs', [
      { date: new Date().toISOString().split('T')[0], sleep: 7, meals: 3, water: 6, exercise: 30 },
    ])
  )
  const [chatMessages, setChatMessages] = useState<CoachChatMessage[]>(() =>
    loadStored('chatMessages', [])
  )
  const [coachMeta, setCoachMeta] = useState<CoachMeta>(() =>
    loadStored('coachMeta', { messageCount: 0, lateNightSessions: 0, lastCheckInDate: null })
  )
  const [aiPersona, setAiPersonaState] = useState<AIPersona>(() =>
    loadStored('aiPersona', 'sweet_supportive' as AIPersona)
  )
  const [pandaTipIndex, setPandaTipIndex] = useState(0)

  useEffect(() => {
    if (profile) localStorage.setItem(`${STORAGE_KEY}-profile`, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-transactions`, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-moodEntries`, JSON.stringify(moodEntries))
  }, [moodEntries])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-habitLogs`, JSON.stringify(habitLogs))
  }, [habitLogs])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-chatMessages`, JSON.stringify(chatMessages))
  }, [chatMessages])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-coachMeta`, JSON.stringify(coachMeta))
  }, [coachMeta])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-aiPersona`, JSON.stringify(aiPersona))
  }, [aiPersona])

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p)
    if (p.aiPersona) setAiPersonaState(p.aiPersona)
  }, [])

  const setAiPersona = useCallback((persona: AIPersona) => {
    setAiPersonaState(persona)
    setProfileState((prev) => prev ? { ...prev, aiPersona: persona } : prev)
  }, [])

  const updateCoachMeta = useCallback((patch: Partial<CoachMeta>) => {
    setCoachMeta((prev) => ({ ...prev, ...patch }))
  }, [])

  const addTransaction = useCallback((tx: Omit<MockTransaction, 'id'>) => {
    const category = tx.category || categorizeExpense(tx.description, tx.merchant)
    const newTx: MockTransaction = {
      ...tx,
      id: `t-${Date.now()}`,
      category,
      autoCategorized: true,
    }
    setTransactions((prev) => [newTx, ...prev])
  }, [])

  const logMood = useCallback((entry: Omit<MoodEntry, 'date'>) => {
    const today = new Date().toISOString().split('T')[0]
    setMoodEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== today)
      return [...filtered, { ...entry, date: today }]
    })
  }, [])

  const logHabits = useCallback((log: Omit<HabitLog, 'date'>) => {
    const today = new Date().toISOString().split('T')[0]
    setHabitLogs((prev) => {
      const filtered = prev.filter((e) => e.date !== today)
      return [...filtered, { ...log, date: today }]
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date()
  monthStart.setDate(1)

  const todaySpent = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(today))
    .reduce((s, t) => s + t.amount, 0)

  const monthExpenses = transactions
    .filter((t) => t.type === 'expense' && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + t.amount, 0)

  const monthFood = transactions
    .filter((t) => t.type === 'expense' && t.category === 'food' && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + t.amount, 0)

  const dailyLimit = profile?.dailySpendingLimit ?? 116
  const monthlyBudget = profile?.monthlyBudget ?? 3500
  const budgetLeft = Math.max(0, dailyLimit - todaySpent)
  const savingsGoal = profile?.monthlySavingsGoal ?? 1500
  const savingsProgress = Math.min(100, Math.round((savingsGoal - Math.max(0, monthExpenses - monthlyBudget)) / savingsGoal * 100))

  const moodScore = moodEntries.length
    ? Math.round(moodEntries.slice(-7).reduce((s, e) => s + e.energy * 10 - e.stress * 5, 0) / Math.min(7, moodEntries.length))
    : 70

  const savingsStreak = 8
  const eatingStreak = habitLogs.filter((h) => h.meals >= 2).length
  const moodStreak = moodEntries.length

  const rewardLevel = getRewardLevel(savingsStreak)
  const rewardEmoji = getRewardEmoji(rewardLevel)

  const last24h = transactions
    .filter((t) => t.type === 'expense' && Date.now() - new Date(t.date).getTime() < 86400000)
    .reduce((s, t) => s + t.amount, 0)

  const foodPercent = monthExpenses > 0 ? Math.round((monthFood / monthExpenses) * 100) : 0

  const alerts = buildAlerts(last24h, foodPercent, todaySpent, dailyLimit, moodEntries, habitLogs)
  const pandaTip = PANDA_TIPS[pandaTipIndex % PANDA_TIPS.length]

  useEffect(() => {
    const interval = setInterval(() => setPandaTipIndex((i) => i + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppDataContext.Provider
      value={{
        profile,
        setProfile,
        aiPersona,
        setAiPersona,
        chatMessages,
        setChatMessages,
        coachMeta,
        updateCoachMeta,
        transactions,
        addTransaction,
        banks: INDIAN_BANKS,
        moodEntries,
        logMood,
        habitLogs,
        logHabits,
        savingsStreak,
        eatingStreak,
        moodStreak,
        pandaTip,
        alerts,
        todaySpent,
        budgetLeft,
        savingsGoal,
        foodPercent,
        savingsProgress,
        moodScore,
        rewardLevel,
        rewardEmoji,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

function buildAlerts(
  last24h: number,
  foodPercent: number,
  todaySpent: number,
  dailyLimit: number,
  moodEntries: MoodEntry[],
  habitLogs: HabitLog[],
): SpendingAlert[] {
  const alerts: SpendingAlert[] = []
  if (last24h >= 500) {
    alerts.push({ id: 'a1', type: 'spending_spike', message: `You spent ${formatAlert(last24h)} in the last 24 hours.`, severity: 'warning' })
  }
  if (foodPercent >= 40) {
    alerts.push({ id: 'a2', type: 'category_increase', message: `Food spending is ${foodPercent}% of your budget this month.`, severity: 'info' })
  }
  if (todaySpent > dailyLimit) {
    alerts.push({ id: 'a3', type: 'daily_limit', message: `Daily limit exceeded by ${formatAlert(todaySpent - dailyLimit)}.`, severity: 'warning' })
  }
  const recentMoods = moodEntries.slice(-3)
  const avgStress = recentMoods.length ? recentMoods.reduce((s, m) => s + m.stress, 0) / recentMoods.length : 0
  const recentHabits = habitLogs.slice(-3)
  const skippingMeals = recentHabits.some((h) => h.meals < 2)
  if (avgStress >= 7 || skippingMeals) {
    alerts.push({ id: 'a4', type: 'burnout', message: 'You may be experiencing burnout. Consider taking a break. 🌿', severity: 'gentle' })
  }
  return alerts
}

function formatAlert(amount: number): string {
  return `₹${amount}`
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}

export type { ExpenseCategoryId, MoodType }
