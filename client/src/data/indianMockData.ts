/** Fake Indian bank accounts & transactions for demo */

export interface BankAccount {
  id: string
  bankName: string
  bankCode: string
  accountType: 'savings' | 'student'
  accountNumber: string
  balance: number
  ifsc: string
  logo: string
}

export const INDIAN_BANKS: BankAccount[] = [
  {
    id: 'sbi-1',
    bankName: 'State Bank of India',
    bankCode: 'SBI',
    accountType: 'savings',
    accountNumber: '****4521',
    balance: 12450,
    ifsc: 'SBIN0001234',
    logo: '🏦',
  },
  {
    id: 'hdfc-1',
    bankName: 'HDFC Bank',
    bankCode: 'HDFC',
    accountType: 'student',
    accountNumber: '****7890',
    balance: 8320,
    ifsc: 'HDFC0005678',
    logo: '💳',
  },
  {
    id: 'paytm-1',
    bankName: 'Paytm Payments Bank',
    bankCode: 'PAYTM',
    accountType: 'savings',
    accountNumber: '****3344',
    balance: 2150,
    ifsc: 'PYTM0123456',
    logo: '📱',
  },
]

export const INDIAN_COLLEGES = [
  'IIT Delhi',
  'IIT Bombay',
  'IIT Madras',
  'BITS Pilani',
  'Delhi University',
  'JNU Delhi',
  'Anna University',
  'VIT Vellore',
  'Manipal University',
  'SRM University',
  'NIT Trichy',
  'NIT Warangal',
  'Christ University',
  'Symbiosis Pune',
  'Ashoka University',
  'Other',
]

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Canteen', icon: '🍛', color: '#C4A77D' },
  { id: 'transport', label: 'Transport & Auto', icon: '🛺', color: '#7B9E87' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#9B8AA5' },
  { id: 'education', label: 'Books & Stationery', icon: '📚', color: '#6B8E7B' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#B8956B' },
  { id: 'health', label: 'Health & Medical', icon: '💊', color: '#8B9DC3' },
  { id: 'rent', label: 'Hostel & Rent', icon: '🏠', color: '#A67B5B' },
  { id: 'other', label: 'Other', icon: '📦', color: '#8A8A8A' },
] as const

export type ExpenseCategoryId = (typeof EXPENSE_CATEGORIES)[number]['id']

export interface MockTransaction {
  id: string
  type: 'expense' | 'income'
  amount: number
  category: ExpenseCategoryId
  merchant: string
  description: string
  date: string
  autoCategorized?: boolean
}

export const SAMPLE_TRANSACTIONS: MockTransaction[] = [
  { id: 't1', type: 'expense', amount: 65, category: 'food', merchant: 'Campus Canteen', description: 'Masala Dosa + Chai', date: new Date().toISOString(), autoCategorized: true },
  { id: 't2', type: 'expense', amount: 120, category: 'transport', merchant: 'Ola Auto', description: 'Hostel to College', date: new Date(Date.now() - 86400000).toISOString(), autoCategorized: true },
  { id: 't3', type: 'expense', amount: 45, category: 'food', merchant: 'Chai Point', description: 'Cold Coffee', date: new Date(Date.now() - 86400000).toISOString(), autoCategorized: true },
  { id: 't4', type: 'expense', amount: 350, category: 'entertainment', merchant: 'PVR Cinemas', description: 'Movie with friends', date: new Date(Date.now() - 172800000).toISOString(), autoCategorized: true },
  { id: 't5', type: 'expense', amount: 89, category: 'food', merchant: 'Swiggy', description: 'Paneer Roll', date: new Date(Date.now() - 172800000).toISOString(), autoCategorized: true },
  { id: 't6', type: 'income', amount: 5000, category: 'other', merchant: 'Parents', description: 'Monthly pocket money', date: new Date(Date.now() - 604800000).toISOString() },
  { id: 't7', type: 'expense', amount: 250, category: 'education', merchant: 'Amazon', description: 'Engineering textbook', date: new Date(Date.now() - 259200000).toISOString(), autoCategorized: true },
  { id: 't8', type: 'expense', amount: 30, category: 'food', merchant: 'Campus Canteen', description: 'Samosa + Tea', date: new Date().toISOString(), autoCategorized: true },
]

export type MoodType = 'happy' | 'sad' | 'tired' | 'stressed' | 'excited' | 'neutral'
export type CravingType = 'sweet' | 'spicy' | 'healthy' | 'comfort'

export interface FoodRecommendation {
  items: string[]
  reason: string
  totalCost: number
  place: string
}

export const FOOD_RECOMMENDATIONS: Record<string, FoodRecommendation> = {
  'stressed-50': { items: ['Masala Chai', 'Biscuit Pack'], reason: 'Warm and comforting — perfect for a study break ☕', totalCost: 35, place: 'Campus Canteen' },
  'stressed-100': { items: ['Veg Sandwich', 'Banana Shake'], reason: 'Energy boosting and affordable for stressed days 🌿', totalCost: 80, place: 'Canteen Corner' },
  'stressed-150': { items: ['Veg Sandwich', 'Banana Shake', 'Fruit Bowl'], reason: 'Balanced comfort food to lift your mood 🍌', totalCost: 130, place: 'Healthy Bites' },
  'happy-50': { items: ['Samosa (2pc)', 'Cold Drink'], reason: 'Celebrate small wins with a classic treat! 🎉', totalCost: 45, place: 'Snack Shack' },
  'happy-100': { items: ['Veg Biryani', 'Raita'], reason: 'A hearty meal to match your good vibes 🍚', totalCost: 90, place: 'Mess Special' },
  'happy-150': { items: ['Paneer Roll', 'Lassi', 'Gulab Jamun'], reason: 'Treat yourself — you deserve it! 🌟', totalCost: 140, place: 'Food Court' },
  'sad-50': { items: ['Hot Maggi', 'Tea'], reason: 'Sometimes comfort food is the best medicine 🍜', totalCost: 40, place: 'Night Canteen' },
  'sad-100': { items: ['Dal Khichdi', 'Papad', 'Pickle'], reason: 'Homely food to warm your heart 🏠', totalCost: 85, place: 'Home-style Mess' },
  'sad-150': { items: ['Butter Chicken', 'Naan', 'Sweet Lassi'], reason: 'Indulge a little — tomorrow is a new day 💛', totalCost: 145, place: 'Campus Dhaba' },
  'tired-50': { items: ['Banana', 'Energy Bar'], reason: 'Quick fuel without the crash ⚡', totalCost: 48, place: 'Campus Store' },
  'tired-100': { items: ['Poha', 'Jalebi', 'Coffee'], reason: 'Classic breakfast combo for instant energy ☀️', totalCost: 75, place: 'Morning Canteen' },
  'tired-150': { items: ['South Indian Thali', 'Filter Coffee'], reason: 'Wholesome meal to recharge your batteries 🔋', totalCost: 120, place: 'South Mess' },
  'excited-50': { items: ['Pani Puri (6pc)', 'Aam Panna'], reason: 'Street food vibes for your excited mood! 🎊', totalCost: 50, place: 'Campus Gate' },
  'excited-100': { items: ['Veg Momos', 'Chilli Sauce', 'Soft Drink'], reason: 'Fun finger food for an energetic day 🥟', totalCost: 95, place: 'Food Truck' },
  'excited-150': { items: ['Pizza Slice (2)', 'Garlic Bread', 'Mocktail'], reason: 'Party mode activated! 🍕', totalCost: 150, place: 'Café Zone' },
}

export const MENU_ITEMS = [
  { name: 'Masala Dosa', price: 50, type: 'healthy' as const },
  { name: 'Veg Thali', price: 80, type: 'healthy' as const },
  { name: 'Paneer Roll', price: 60, type: 'comfort' as const },
  { name: 'Chicken Biryani', price: 120, type: 'spicy' as const },
  { name: 'Veg Biryani', price: 90, type: 'spicy' as const },
  { name: 'Samosa (2pc)', price: 20, type: 'comfort' as const },
  { name: 'Cold Coffee', price: 40, type: 'sweet' as const },
  { name: 'Fruit Bowl', price: 60, type: 'healthy' as const },
  { name: 'Maggi', price: 30, type: 'comfort' as const },
  { name: 'Chai', price: 15, type: 'comfort' as const },
  { name: 'Ice Cream', price: 45, type: 'sweet' as const },
  { name: 'Poha', price: 35, type: 'healthy' as const },
]

export const PANDA_TIPS = [
  'Great job! You saved ₹120 today 🌿',
  'Only ₹50 more saved today and you\'ll maintain your 8-day savings streak 🌱',
  'You spent 45% of your budget on food this month — try the canteen thali!',
  'Your mood has been positive this week — keep it up! 🐼',
  'Daily tip: Carry a water bottle to save ₹20/day on drinks 💧',
  'Hostel mess is ₹40 cheaper than ordering in today!',
  'You\'re ₹116 under your daily limit — room for a small treat 🍪',
]

export const CHAT_RESPONSES: Record<string, string> = {
  stressed: 'Maybe take a short break and have something warm to eat ☕ A 10-minute walk around campus can help too!',
  pizza: 'Yes, but you\'ll exceed your daily budget by ₹40. How about sharing a pizza with a friend to split the cost? 🍕',
  afford: 'Let me check your budget... You have ₹{budgetLeft} left for today. Plan wisely! 🐼',
  save: 'Try the 50-30-20 rule: 50% needs, 30% wants, 20% savings. For students, even 10% savings is great! 🌱',
  default: 'I\'m Pocket Panda, your campus buddy! Ask me about budgets, food, mood, or savings anytime 🐼',
}

export const CAMPUS_DEALS = [
  { name: 'Spotify Student', savings: '₹589/year', icon: '🎵', category: 'Subscription' },
  { name: 'Amazon Prime Student', savings: '₹499/year', icon: '📦', category: 'Shopping' },
  { name: 'IRCTC Student Concession', savings: '50% off', icon: '🚂', category: 'Travel' },
  { name: 'Campus Canteen Combo', savings: '₹30/day', icon: '🍛', category: 'Food' },
  { name: 'Jio Student Plan', savings: '₹100/month', icon: '📱', category: 'Mobile' },
  { name: 'BookMyShow Student', savings: '25% off', icon: '🎬', category: 'Entertainment' },
]

export const CAMPUS_RESOURCES = [
  { name: 'Counselling Cell', type: 'Mental Health', icon: '🧠', desc: 'Free confidential counselling' },
  { name: 'Health Centre', type: 'Medical', icon: '🏥', desc: 'Campus doctor & first aid' },
  { name: 'Placement Cell', type: 'Career', icon: '💼', desc: 'Internships & job support' },
  { name: 'Library', type: 'Academic', icon: '📚', desc: '24/7 study space' },
  { name: 'Sports Complex', type: 'Wellness', icon: '⚽', desc: 'Gym, courts & yoga' },
  { name: 'NSS / NCC', type: 'Community', icon: '🤝', desc: 'Volunteer & leadership' },
]

export type RewardLevel = 'seedling' | 'sapling' | 'tree'

export function getRewardLevel(streak: number): RewardLevel {
  if (streak >= 21) return 'tree'
  if (streak >= 7) return 'sapling'
  return 'seedling'
}

export function getRewardEmoji(level: RewardLevel): string {
  return { seedling: '🌱', sapling: '🌿', tree: '🌳' }[level]
}

export function getFoodRecommendation(mood: MoodType, budget: number): FoodRecommendation {
  const budgetKey = budget <= 60 ? '50' : budget <= 110 ? '100' : '150'
  const key = `${mood}-${budgetKey}`
  return FOOD_RECOMMENDATIONS[key] ?? FOOD_RECOMMENDATIONS['stressed-100']
}

export function categorizeExpense(description: string, merchant: string): ExpenseCategoryId {
  const text = `${description} ${merchant}`.toLowerCase()
  if (/food|canteen|swiggy|zomato|chai|dosa|biryani|mess|snack|restaurant|cafe|coffee/.test(text)) return 'food'
  if (/ola|uber|auto|metro|bus|fuel|petrol|transport/.test(text)) return 'transport'
  if (/movie|pvr|netflix|spotify|game|entertainment/.test(text)) return 'entertainment'
  if (/book|amazon|stationery|exam|course/.test(text)) return 'education'
  if (/medical|pharmacy|doctor|health/.test(text)) return 'health'
  if (/hostel|rent|pg|accommodation/.test(text)) return 'rent'
  if (/flipkart|myntra|shop|clothes/.test(text)) return 'shopping'
  return 'other'
}
