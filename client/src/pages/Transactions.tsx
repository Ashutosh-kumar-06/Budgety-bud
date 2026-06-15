import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { EXPENSE_CATEGORIES, type ExpenseCategoryId } from '../data/indianMockData'
import { formatINR } from '../utils/currency'
import { categorizeExpense } from '../data/indianMockData'

export default function Transactions() {
  const { transactions, addTransaction } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (!amount) return

    const category = categorizeExpense(formData.description, formData.merchant) as ExpenseCategoryId

    addTransaction({
      type: formData.type,
      amount,
      category,
      merchant: formData.merchant || 'Unknown',
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      autoCategorized: true,
    })

    setShowForm(false)
    setFormData({ amount: '', description: '', merchant: '', date: new Date().toISOString().split('T')[0], type: 'expense' })
  }

  const last24h = transactions
    .filter((t) => t.type === 'expense' && Date.now() - new Date(t.date).getTime() < 86400000)
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)' }}>Transactions 💸</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Auto-categorized for Indian campus spending
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {last24h > 0 && (
        <div className="alert-card alert-card-warning" style={{ marginBottom: 'var(--space-4)' }}>
          💸 You spent {formatINR(last24h)} in the last 24 hours.
        </div>
      )}

      {showForm && (
        <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <Field label="Amount (₹)">
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="65" required style={inputStyle} />
              </Field>
              <Field label="Type">
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' })} style={inputStyle}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </Field>
              <Field label="Merchant">
                <input type="text" value={formData.merchant} onChange={(e) => setFormData({ ...formData, merchant: e.target.value })} placeholder="Campus Canteen, Swiggy..." style={inputStyle} />
              </Field>
              <Field label="Date">
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={inputStyle} />
              </Field>
            </div>
            <Field label="Description">
              <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Masala Dosa + Chai" style={inputStyle} />
            </Field>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 'var(--space-2) 0 var(--space-4)' }}>
              🤖 AI will auto-categorize based on merchant & description
            </p>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Add Transaction</button>
          </form>
        </div>
      )}

      <div className="cozy-card" style={{ padding: 0, overflow: 'hidden' }}>
        {transactions.length === 0 ? (
          <p style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No transactions yet. Add your first canteen expense!
          </p>
        ) : (
          transactions.map((tx, i) => {
            const cat = EXPENSE_CATEGORIES.find((c) => c.id === tx.category)
            return (
              <div key={tx.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                borderBottom: i < transactions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat?.icon ?? '📦'}</span>
                  <div>
                    <p style={{ fontWeight: 'var(--fw-semibold)' }}>{tx.merchant}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {tx.description} · {cat?.label}
                      {tx.autoCategorized && ' · 🤖 auto'}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'var(--fw-bold)', color: tx.type === 'income' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {new Date(tx.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)',
}

const btnPrimary: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-md)', border: 'none',
  background: 'var(--color-primary)', color: 'white', fontWeight: 'var(--fw-semibold)', cursor: 'pointer',
}
