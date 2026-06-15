import { useState } from 'react'
import { getFoodRecommendation, type MoodType, type CravingType } from '../data/indianMockData'
import { formatINR } from '../utils/currency'
import PocketPanda from '../components/mascot/PocketPanda'
import { useAppData } from '../hooks/useAppData'

const MOODS: { id: MoodType; label: string; emoji: string }[] = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
]

const CRAVINGS: { id: CravingType; label: string; emoji: string }[] = [
  { id: 'sweet', label: 'Sweet', emoji: '🍬' },
  { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
  { id: 'comfort', label: 'Comfort Food', emoji: '🍜' },
]

const BUDGETS = [50, 100, 150]

export default function FoodCompanion() {
  const [mood, setMood] = useState<MoodType | null>(null)
  const [craving, setCraving] = useState<CravingType | null>(null)
  const [budget, setBudget] = useState<number | null>(null)
  const [recommendation, setRecommendation] = useState<ReturnType<typeof getFoodRecommendation> | null>(null)
  const { budgetLeft } = useAppData()

  const handleRecommend = () => {
    if (!mood || !budget) return
    setRecommendation(getFoodRecommendation(mood, budget))
  }

  const canAfford = budget !== null && budget <= budgetLeft + 200

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-2)' }}>
        What should I eat? 🍛
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
        AI Food Companion — mood-based canteen picks for Indian students
      </p>

      <PocketPanda message="Tell me how you're feeling and your budget — I'll find the perfect campus meal! 🐼" compact />

      <div style={{ marginTop: 'var(--space-8)' }}>
        <Section title="How's your mood?" emoji="💭">
          <OptionGrid
            options={MOODS.map((m) => ({ id: m.id, label: `${m.emoji} ${m.label}` }))}
            selected={mood}
            onSelect={(id) => { setMood(id as MoodType); setRecommendation(null) }}
          />
        </Section>

        <Section title="What are you craving?" emoji="🤤">
          <OptionGrid
            options={CRAVINGS.map((c) => ({ id: c.id, label: `${c.emoji} ${c.label}` }))}
            selected={craving}
            onSelect={(id) => { setCraving(id as CravingType); setRecommendation(null) }}
          />
        </Section>

        <Section title="Your budget today" emoji="💰">
          <OptionGrid
            options={BUDGETS.map((b) => ({ id: String(b), label: formatINR(b) }))}
            selected={budget !== null ? String(budget) : null}
            onSelect={(id) => { setBudget(parseInt(id)); setRecommendation(null) }}
          />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            You have {formatINR(budgetLeft)} left in today's budget
          </p>
        </Section>

        <button
          onClick={handleRecommend}
          disabled={!mood || !budget}
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--gradient-primary)',
            color: 'white',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--fw-bold)',
            cursor: mood && budget ? 'pointer' : 'not-allowed',
            opacity: mood && budget ? 1 : 0.5,
            marginTop: 'var(--space-4)',
          }}
        >
          🐼 Find My Perfect Meal
        </button>

        {recommendation && (
          <div className="cozy-card-warm" style={{ marginTop: 'var(--space-8)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>✨ Panda's Pick for You</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {recommendation.items.map((item) => (
                <div key={item} style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 'var(--fw-medium)',
                }}>
                  🍽️ {item}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>📍 {recommendation.place}</span>
              <span style={{ fontWeight: 'var(--fw-bold)', color: 'var(--color-primary-dark)' }}>
                {formatINR(recommendation.totalCost)}
              </span>
            </div>
            <div className="alert-card">
              <strong>Why?</strong> {recommendation.reason}
            </div>
            {!canAfford && (
              <div className="alert-card alert-card-warning" style={{ marginTop: 'var(--space-3)' }}>
                ⚠️ This might push you over today's daily limit. Consider sharing with a friend!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>
        {emoji} {title}
      </h3>
      {children}
    </div>
  )
}

function OptionGrid({ options, selected, onSelect }: {
  options: { id: string; label: string }[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            border: selected === opt.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
            background: selected === opt.id ? 'rgba(123, 158, 135, 0.15)' : 'var(--bg-secondary)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: selected === opt.id ? 'var(--fw-semibold)' : 'var(--fw-normal)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
