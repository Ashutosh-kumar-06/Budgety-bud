import { useNavigate } from 'react-router-dom'
import { useAppData } from '../hooks/useAppData'
import { formatINR } from '../utils/currency'
import { EXPENSE_CATEGORIES } from '../data/indianMockData'
import PocketPanda from '../components/mascot/PocketPanda'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    profile,
    transactions,
    banks,
    alerts,
    pandaTip,
    todaySpent,
    budgetLeft,
    savingsProgress,
    moodScore,
    savingsStreak,
    eatingStreak,
    moodStreak,
    rewardEmoji,
    rewardLevel,
    logMood,
    moodEntries,
  } = useAppData()

  const dailyLimit = profile?.dailySpendingLimit ?? 116
  const monthlyBudget = profile?.monthlyBudget ?? 3500
  const savingsGoal = profile?.monthlySavingsGoal ?? 1500

  const monthStart = new Date()
  monthStart.setDate(1)
  const monthExpenses = transactions
    .filter((t) => t.type === 'expense' && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + t.amount, 0)

  const monthFood = transactions
    .filter((t) => t.type === 'expense' && t.category === 'food' && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + t.amount, 0)

  const foodPercent = monthExpenses > 0 ? Math.round((monthFood / monthExpenses) * 100) : 0

  const topCategories = EXPENSE_CATEGORIES.map((cat) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === cat.id && new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0)
    const limit = Math.round(monthlyBudget * (cat.id === 'food' ? 0.4 : cat.id === 'transport' ? 0.15 : 0.1))
    return { ...cat, spent, limit: limit || 100 }
  }).filter((c) => c.spent > 0).slice(0, 4)

  const totalBankBalance = banks.reduce((s, b) => s + b.balance, 0)
  const todayMood = moodEntries.find((m) => m.date === new Date().toISOString().split('T')[0])

  const moods = [
    { id: 'happy' as const, emoji: '😊' },
    { id: 'neutral' as const, emoji: '😐' },
    { id: 'stressed' as const, emoji: '😰' },
    { id: 'tired' as const, emoji: '😴' },
    { id: 'sad' as const, emoji: '😢' },
    { id: 'excited' as const, emoji: '🤩' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-2)', color: 'var(--color-primary)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 'var(--fw-medium)' }}>
          {profile?.college} — your financial & wellness overview
        </p>
      </div>

      {/* Panda Tip */}
      <PocketPanda message={pandaTip} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-card ${alert.severity === 'warning' ? 'alert-card-warning' : ''}`}
            >
              {alert.type === 'daily_limit' && '⚠️ '}
              {alert.type === 'spending_spike' && '💸 '}
              {alert.type === 'category_increase' && '🍛 '}
              {alert.type === 'burnout' && '🌿 '}
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Health Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginTop: 'var(--space-6)',
      }}>
        <HealthCard title="Budget Left Today" value={formatINR(budgetLeft)} subtitle={`of ${formatINR(dailyLimit)}`} icon="💰" color="var(--color-primary)" />
        <HealthCard title="Wellness Score" value={`${moodScore}/100`} subtitle="Mood + Energy" icon="🧘" color="var(--color-info)" />
        <HealthCard title="Savings Progress" value={`${savingsProgress}%`} subtitle={`Goal: ${formatINR(savingsGoal)}`} icon="🌱" color="var(--color-success)" />
        <HealthCard title="Savings Streak" value={`${savingsStreak} days`} subtitle={`${rewardEmoji} ${rewardLevel}`} icon="🔥" color="var(--color-secondary)" />
      </div>

      {/* Hero Balance */}
      <div className="cozy-card" style={{
        marginTop: 'var(--space-6)',
        padding: 'var(--space-8)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--gradient-hero)',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Total Balance (Linked Banks)</p>
            <h2 className="amount" style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--fw-semibold)', color: 'white' }}>
              {formatINR(totalBankBalance)}
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginTop: 'var(--space-2)' }}>
              Spent today: {formatINR(todaySpent)} · Monthly: {formatINR(monthExpenses)}/{formatINR(monthlyBudget)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Pocket Money</p>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-bold)' }}>
              {formatINR(profile?.pocketMoney ?? 5000)}/mo
            </p>
          </div>
        </div>
      </div>

      {/* Bank Accounts */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>🏦 Linked Accounts (Demo)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          {banks.map((bank) => (
            <div key={bank.id} className="cozy-card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: '1.5rem' }}>{bank.logo}</span>
                <div>
                  <p style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-sm)' }}>{bank.bankName}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{bank.accountNumber}</p>
                </div>
              </div>
              <p style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)' }}>{formatINR(bank.balance)}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>IFSC: {bank.ifsc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--space-6)',
        marginTop: 'var(--space-6)',
      }}>
        {/* Budget Overview */}
        <div className="cozy-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📊 Smart Finance</h3>
          {foodPercent > 0 && (
            <div className="alert-card" style={{ marginBottom: 'var(--space-4)' }}>
              You spent {foodPercent}% of your budget on food this month.
            </div>
          )}
          {topCategories.map((cat) => {
            const pct = Math.min(100, (cat.spent / cat.limit) * 100)
            return (
              <div key={cat.id} style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                  <span>{cat.icon} {cat.label}</span>
                  <span>{formatINR(cat.spent)} / {formatINR(cat.limit)}</span>
                </div>
                <div style={{ height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            )
          })}
          <button onClick={() => navigate('/analytics')} style={linkBtn}>View Insights →</button>
        </div>

        {/* Savings Coach */}
        <div className="cozy-card-warm">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>🌱 Savings Coach</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>
            Only {formatINR(Math.max(0, savingsGoal - (profile?.pocketMoney ?? 5000) + monthExpenses + savingsGoal))} more saved today and you'll maintain your {savingsStreak}-day savings streak {rewardEmoji}
          </p>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
            <StreakBadge label="Savings" days={savingsStreak} emoji={rewardEmoji} />
            <StreakBadge label="Meals" days={eatingStreak} emoji="🍛" />
            <StreakBadge label="Mood" days={moodStreak} emoji="💭" />
          </div>
        </div>

        {/* Mood Check */}
        <div className="cozy-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>💭 Daily Mood Check</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => logMood({ mood: m.id, energy: m.id === 'happy' || m.id === 'excited' ? 8 : 5, stress: m.id === 'stressed' || m.id === 'sad' ? 7 : 3 })}
                style={{
                  fontSize: '1.75rem',
                  background: todayMood?.mood === m.id ? 'var(--bg-tertiary)' : 'transparent',
                  border: todayMood?.mood === m.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2)',
                  cursor: 'pointer',
                }}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insight — glassmorphism */}
        <div className="ai-glass" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>✨ Daily AI Insight</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>
            {todaySpent > dailyLimit
              ? `You've exceeded your daily limit by ${formatINR(todaySpent - dailyLimit)}. Try the mess thali tomorrow — saves ₹40!`
              : `You're ${formatINR(budgetLeft)} under budget today. Room for a chai break ☕`}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/food')} style={actionBtn}>What to eat? 🍛</button>
            <button onClick={() => navigate('/chat')} style={actionBtn}>Ask Panda 💬</button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="cozy-card" style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3>Recent Transactions</h3>
          <button onClick={() => navigate('/transactions')} style={linkBtn}>View All →</button>
        </div>
        {transactions.slice(0, 5).map((tx) => {
          const cat = EXPENSE_CATEGORIES.find((c) => c.id === tx.category)
          return (
            <div key={tx.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--space-3) 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <p style={{ fontWeight: 'var(--fw-medium)' }}>{cat?.icon} {tx.merchant}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{tx.description}</p>
              </div>
              <p style={{ fontWeight: 'var(--fw-semibold)', color: tx.type === 'income' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HealthCard({ title, value, subtitle, icon, color }: {
  title: string; value: string; subtitle: string; icon: string; color: string
}) {
  return (
    <div className="stat-hud hover-lift">
      <div style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>{icon}</div>
      <p className="stat-hud__label">{title}</p>
      <p className="stat-hud__value" style={{ color }}>{value}</p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>{subtitle}</p>
    </div>
  )
}

function StreakBadge({ label, days, emoji }: { label: string; days: number; emoji: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem' }}>{emoji}</div>
      <p style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)' }}>{days}</p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

const linkBtn: React.CSSProperties = {
  marginTop: 'var(--space-3)',
  padding: 'var(--space-2) var(--space-3)',
  border: 'none',
  background: 'transparent',
  color: 'var(--color-primary-dark)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
}

const actionBtn: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-full)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-elevated)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
}
