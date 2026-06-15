import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { EXPENSE_CATEGORIES } from '../data/indianMockData'
import { formatINR } from '../utils/currency'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('month')
  const { transactions, profile } = useAppData()

  const monthStart = new Date()
  monthStart.setDate(1)

  const filtered = transactions.filter((t) => {
    if (t.type !== 'expense') return false
    if (timeRange === 'week') return Date.now() - new Date(t.date).getTime() < 7 * 86400000
    if (timeRange === 'year') return new Date(t.date).getFullYear() === new Date().getFullYear()
    return new Date(t.date) >= monthStart
  })

  const totalSpending = filtered.reduce((s, t) => s + t.amount, 0)

  const categories = EXPENSE_CATEGORIES.map((cat) => {
    const amount = filtered.filter((t) => t.category === cat.id).reduce((s, t) => s + t.amount, 0)
    return { name: cat.label, amount, color: cat.color, icon: cat.icon }
  }).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount)

  const foodPercent = totalSpending > 0
    ? Math.round((categories.find((c) => c.name.includes('Food'))?.amount ?? 0) / totalSpending * 100)
    : 0

  const dailyAvg = totalSpending / (timeRange === 'week' ? 7 : timeRange === 'year' ? 365 : 30)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayStr = d.toISOString().split('T')[0]
    const amount = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(dayStr))
      .reduce((s, t) => s + t.amount, 0)
    return { date: d.toLocaleDateString('en-IN', { weekday: 'short' }), amount }
  })

  const maxDay = Math.max(...last7Days.map((d) => d.amount), 1)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)' }}>Spending Insights 📈</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Smart finance analytics for campus life</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                border: timeRange === range ? 'none' : '1px solid var(--border-color)',
                background: timeRange === range ? 'var(--color-primary)' : 'var(--bg-secondary)',
                color: timeRange === range ? 'white' : 'var(--text-primary)',
                fontWeight: 'var(--fw-semibold)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {foodPercent >= 40 && (
        <div className="alert-card" style={{ marginBottom: 'var(--space-4)' }}>
          🍛 You spent {foodPercent}% of your budget on food this month. Try the mess thali to save ₹30/day!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <StatCard label="Total Spending" value={formatINR(totalSpending)} />
        <StatCard label="Daily Average" value={formatINR(Math.round(dailyAvg))} />
        <StatCard label="Top Category" value={categories[0]?.name ?? '—'} />
        <StatCard label="Monthly Budget" value={formatINR(profile?.monthlyBudget ?? 3500)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
        <div className="cozy-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Last 7 Days</h3>
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
            {last7Days.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{
                  width: '100%',
                  height: `${(day.amount / maxDay) * 140}px`,
                  minHeight: '4px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--gradient-primary)',
                }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{day.date}</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)' }}>{formatINR(day.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cozy-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>By Category</h3>
          {categories.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No spending data yet</p>
          ) : (
            categories.map((cat) => {
              const pct = (cat.amount / totalSpending) * 100
              return (
                <div key={cat.name} style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                    <span>{cat.icon} {cat.name}</span>
                    <span>{formatINR(cat.amount)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="cozy-card" style={{ padding: 'var(--space-4)' }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--color-primary-dark)' }}>{value}</p>
    </div>
  )
}
