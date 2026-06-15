import { useAppData } from '../hooks/useAppData'
import { EXPENSE_CATEGORIES } from '../data/indianMockData'
import { formatINR } from '../utils/currency'

export default function Budget() {
  const { profile, transactions, todaySpent, budgetLeft } = useAppData()

  const monthlyBudget = profile?.monthlyBudget ?? 3500
  const dailyLimit = profile?.dailySpendingLimit ?? 116
  const savingsGoal = profile?.monthlySavingsGoal ?? 1500
  const pocketMoney = profile?.pocketMoney ?? 5000

  const monthStart = new Date()
  monthStart.setDate(1)

  const categoryBudgets = EXPENSE_CATEGORIES.map((cat) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === cat.id && new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0)
    const share = cat.id === 'food' ? 0.35 : cat.id === 'transport' ? 0.15 : cat.id === 'entertainment' ? 0.1 : 0.05
    const limit = Math.round(monthlyBudget * share)
    return { ...cat, spent, limit: Math.max(limit, 50) }
  }).filter((c) => c.limit > 0)

  const totalSpent = categoryBudgets.reduce((s, c) => s + c.spent, 0)

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-2)' }}>
        Smart Budget 📊
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
        AI-generated from your pocket money & savings goal
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <StatCard label="Pocket Money" value={formatINR(pocketMoney)} />
        <StatCard label="Monthly Budget" value={formatINR(monthlyBudget)} />
        <StatCard label="Savings Goal" value={formatINR(savingsGoal)} highlight />
        <StatCard label="Daily Limit" value={formatINR(dailyLimit)} />
      </div>

      {todaySpent > dailyLimit && (
        <div className="alert-card alert-card-warning" style={{ marginBottom: 'var(--space-4)' }}>
          ⚠️ Daily limit exceeded by {formatINR(todaySpent - dailyLimit)}. Panda suggests skipping the evening snack today!
        </div>
      )}

      <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Today's Spending</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: '12px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (todaySpent / dailyLimit) * 100)}%`,
                background: todaySpent > dailyLimit ? 'var(--color-error)' : 'var(--color-primary)',
                borderRadius: 'var(--radius-full)',
              }} />
            </div>
          </div>
          <span style={{ fontWeight: 'var(--fw-bold)', whiteSpace: 'nowrap' }}>
            {formatINR(todaySpent)} / {formatINR(dailyLimit)}
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          {formatINR(budgetLeft)} remaining today
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {categoryBudgets.map((budget) => {
          const pct = Math.min(100, (budget.spent / budget.limit) * 100)
          const over = budget.spent > budget.limit
          return (
            <div key={budget.id} className="cozy-card" style={{ borderColor: over ? 'var(--color-error)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: '1.25rem' }}>{budget.icon}</span>
                <h4 style={{ fontWeight: 'var(--fw-semibold)' }}>{budget.label}</h4>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                <span>{formatINR(budget.spent)} / {formatINR(budget.limit)}</span>
                <span style={{ color: over ? 'var(--color-error)' : 'var(--color-success)' }}>{pct.toFixed(0)}%</span>
              </div>
              <div style={{ height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--color-error)' : budget.color, borderRadius: 'var(--radius-full)' }} />
              </div>
              {over && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 'var(--space-2)' }}>
                  Over by {formatINR(budget.spent - budget.limit)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="cozy-card-warm" style={{ marginTop: 'var(--space-6)' }}>
        <h4>Monthly Summary</h4>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Total spent: {formatINR(totalSpent)} of {formatINR(monthlyBudget)} budget ·
          On track to save {formatINR(Math.max(0, savingsGoal - Math.max(0, totalSpent - monthlyBudget)))} this month 🌱
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="cozy-card" style={{ padding: 'var(--space-4)', background: highlight ? 'rgba(123, 158, 135, 0.1)' : undefined }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)' }}>{value}</p>
    </div>
  )
}
