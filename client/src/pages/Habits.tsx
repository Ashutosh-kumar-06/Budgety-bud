import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { getRewardEmoji, getRewardLevel } from '../data/indianMockData'
import PocketPanda from '../components/mascot/PocketPanda'

export default function Habits() {
  const {
    habitLogs,
    logHabits,
    moodEntries,
    logMood,
    savingsStreak,
    eatingStreak,
    moodStreak,
    alerts,
  } = useAppData()

  const today = new Date().toISOString().split('T')[0]
  const todayHabits = habitLogs.find((h) => h.date === today) ?? { sleep: 7, meals: 2, water: 4, exercise: 0 }
  const todayMood = moodEntries.find((m) => m.date === today)

  const [habits, setHabits] = useState(todayHabits)
  const [energy, setEnergy] = useState(todayMood?.energy ?? 5)
  const [stress, setStress] = useState(todayMood?.stress ?? 4)

  const burnoutAlert = alerts.find((a) => a.type === 'burnout')
  const rewardLevel = getRewardLevel(savingsStreak)
  const rewardEmoji = getRewardEmoji(rewardLevel)

  const handleSaveHabits = () => {
    logHabits(habits)
    if (todayMood) {
      logMood({ mood: todayMood.mood, energy, stress })
    }
  }

  const habitItems = [
    { key: 'sleep' as const, label: 'Sleep', target: 8, unit: 'hrs', icon: '😴', color: '#8B9DC3' },
    { key: 'meals' as const, label: 'Meals', target: 3, unit: 'meals', icon: '🍛', color: '#C4A77D' },
    { key: 'water' as const, label: 'Water', target: 8, unit: 'glasses', icon: '💧', color: '#7B9E87' },
    { key: 'exercise' as const, label: 'Exercise', target: 30, unit: 'mins', icon: '🏃', color: '#A67B5B' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-2)' }}>
        Wellness & Habits 🌿
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
        Gentle reminders — no aggressive notifications
      </p>

      <PocketPanda message="Small daily habits lead to big growth. Log your day and earn rewards! 🌱" compact />

      {burnoutAlert && (
        <div className="alert-card" style={{ marginTop: 'var(--space-4)' }}>
          🌿 {burnoutAlert.message}
        </div>
      )}

      {/* Streaks & Rewards */}
      <div className="cozy-card-warm" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>🏆 Streaks & Rewards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', textAlign: 'center' }}>
          <RewardCard label="Savings Streak" days={savingsStreak} emoji={rewardEmoji} level={rewardLevel} />
          <RewardCard label="Healthy Eating" days={eatingStreak} emoji="🍛" level={getRewardLevel(eatingStreak)} />
          <RewardCard label="Mood Check" days={moodStreak} emoji="💭" level={getRewardLevel(moodStreak)} />
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-4)', textAlign: 'center' }}>
          Grow from 🌱 Seedling → 🌿 Sapling → 🌳 Tree
        </p>
      </div>

      {/* Healthy Habits */}
      <h3 style={{ marginBottom: 'var(--space-4)' }}>Today's Habits</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {habitItems.map((habit) => (
          <div key={habit.key} className="cozy-card" style={{ borderLeft: `4px solid ${habit.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <span>{habit.icon}</span>
              <h4 style={{ fontWeight: 'var(--fw-semibold)' }}>{habit.label}</h4>
            </div>
            <input
              type="range"
              min="0"
              max={habit.key === 'exercise' ? 60 : habit.key === 'sleep' ? 12 : habit.key === 'water' ? 12 : 5}
              value={habits[habit.key]}
              onChange={(e) => setHabits({ ...habits, [habit.key]: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <p style={{ marginTop: 'var(--space-2)', fontWeight: 'var(--fw-bold)', color: habit.color }}>
              {habits[habit.key]} / {habit.target} {habit.unit}
            </p>
          </div>
        ))}
      </div>

      {/* Mood Tracking */}
      <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>💭 Mood & Energy</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)' }}>Energy Level: {energy}/10</label>
            <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))} style={{ width: '100%', marginTop: 'var(--space-2)' }} />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)' }}>Stress Level: {stress}/10</label>
            <input type="range" min="1" max="10" value={stress} onChange={(e) => setStress(parseInt(e.target.value))} style={{ width: '100%', marginTop: 'var(--space-2)' }} />
          </div>
        </div>
      </div>

      {/* Burnout Detection */}
      <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>🔍 Burnout Detection</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          Monitoring sleep, mood & spending patterns for early signs
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Signal label="Skipping meals" active={habits.meals < 2} />
          <Signal label="Low sleep (< 6 hrs)" active={habits.sleep < 6} />
          <Signal label="High stress (≥ 7)" active={stress >= 7} />
          <Signal label="Irregular spending" active={alerts.some((a) => a.type === 'spending_spike')} />
        </div>
      </div>

      <button onClick={handleSaveHabits} style={{
        width: '100%', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: 'none',
        background: 'var(--color-primary)', color: 'white', fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-base)', cursor: 'pointer',
      }}>
        Save Today's Log 🌿
      </button>
    </div>
  )
}

function RewardCard({ label, days, emoji, level }: { label: string; days: number; emoji: string; level: string }) {
  return (
    <div>
      <div style={{ fontSize: '2rem' }}>{emoji}</div>
      <p style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-xl)' }}>{days} days</p>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{label}</p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{level}</p>
    </div>
  )
}

function Signal({ label, active }: { label: string; active: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
      padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
      background: active ? 'rgba(184, 125, 125, 0.12)' : 'rgba(123, 158, 135, 0.08)',
      fontSize: 'var(--text-sm)',
    }}>
      <span>{active ? '⚠️' : '✅'}</span>
      {label}
    </div>
  )
}
