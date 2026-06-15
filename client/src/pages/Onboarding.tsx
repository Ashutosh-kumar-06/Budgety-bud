import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { INDIAN_COLLEGES } from '../data/indianMockData'
import { useAppData } from '../hooks/useAppData'
import { formatINR } from '../utils/currency'
import { PERSONA_OPTIONS, type AIPersona } from '../services/aiCoachEngine'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    college: '',
    pocketMoney: '',
    savingsGoal: '',
    aiPersona: 'sweet_supportive' as AIPersona,
  })
  const navigate = useNavigate()
  const { setProfile, setAiPersona } = useAppData()

  const pocketMoney = parseInt(formData.pocketMoney) || 0
  const savingsGoal = parseInt(formData.savingsGoal) || 0
  const monthlyBudget = Math.max(0, pocketMoney - savingsGoal)
  const dailyLimit = monthlyBudget > 0 ? Math.round(monthlyBudget / 30) : 0

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const canProceed = () => {
    if (step === 1) return formData.name.trim() && formData.age && formData.college
    if (step === 2) return pocketMoney >= 1000
    if (step === 3) return savingsGoal > 0 && savingsGoal < pocketMoney
    if (step === 4) return !!formData.aiPersona
    return true
  }

  const handleFinish = () => {
    setAiPersona(formData.aiPersona)
    setProfile({
      name: formData.name.trim(),
      age: parseInt(formData.age),
      college: formData.college,
      pocketMoney,
      monthlySavingsGoal: savingsGoal,
      monthlyBudget,
      dailySpendingLimit: dailyLimit,
      onboarded: true,
      aiPersona: formData.aiPersona,
    })
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        padding: 'var(--space-8)',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
          </div>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--fw-bold)',
            marginTop: 'var(--space-2)',
            color: 'var(--text-primary)',
          }}>
            Welcome to Budgety bud!
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Your professional finance & wellness buddy
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
        }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: 'var(--radius-full)',
                background: s <= step ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                transition: 'background var(--transition-normal)',
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Tell us about yourself
            </h2>
            <Field label="Your Name" required>
              <input
                type="text"
                placeholder="e.g., Priya Sharma"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Age" required>
              <input
                type="number"
                placeholder="20"
                min="17"
                max="30"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="College / University" required>
              <select
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select your college...</option>
                {INDIAN_COLLEGES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
              Monthly Pocket Money
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              How much do you receive from parents or earn monthly?
            </p>
            <Field label="Pocket Money (₹/month)" required>
              <input
                type="number"
                placeholder="5000"
                min="1000"
                step="500"
                value={formData.pocketMoney}
                onChange={(e) => handleInputChange('pocketMoney', e.target.value)}
                style={inputStyle}
              />
            </Field>
            {pocketMoney > 0 && (
              <div className="alert-card" style={{ marginTop: 'var(--space-4)' }}>
                💡 Typical Indian student pocket money: ₹3,000 – ₹8,000/month
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
              How much do you want to save monthly?
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Pocket Money = {formatINR(pocketMoney)} — set a realistic savings goal 🌱
            </p>
            <Field label="Monthly Savings Goal (₹)" required>
              <input
                type="number"
                placeholder="1500"
                min="100"
                max={pocketMoney - 500}
                step="100"
                value={formData.savingsGoal}
                onChange={(e) => handleInputChange('savingsGoal', e.target.value)}
                style={inputStyle}
              />
            </Field>
            <div style={{
              display: 'flex',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-3)',
              flexWrap: 'wrap',
            }}>
              {[500, 1000, 1500, 2000].filter((v) => v < pocketMoney).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleInputChange('savingsGoal', String(amt))}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    border: savingsGoal === amt ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    background: savingsGoal === amt ? 'rgba(123, 158, 135, 0.15)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {formatINR(amt)}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
              Choose your AI buddy's tone
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Pocket Panda adapts to how you like to be supported. You can change this anytime in Settings.
            </p>
            {PERSONA_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleInputChange('aiPersona', opt.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: formData.aiPersona === opt.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                  background: formData.aiPersona === opt.id ? 'rgba(61, 90, 128, 0.08)' : 'var(--bg-primary)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1.5rem', marginRight: 'var(--space-2)' }}>{opt.emoji}</span>
                <strong style={{ display: 'block', marginBottom: 'var(--space-1)' }}>{opt.label}</strong>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{opt.desc}</span>
              </button>
            ))}
            <div className="alert-card alert-card-info" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              Pocket Panda is an AI, not a human therapist. It will periodically remind you of this.
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Your AI-Generated Budget Plan ✨
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <SummaryCard label="Monthly Pocket Money" value={formatINR(pocketMoney)} icon="💰" />
              <SummaryCard label="Savings Goal" value={formatINR(savingsGoal)} icon="🌱" highlight />
              <SummaryCard label="Monthly Budget" value={formatINR(monthlyBudget)} icon="📊" />
              <SummaryCard label="Daily Spending Limit" value={formatINR(dailyLimit)} icon="📅" />
            </div>
            <div className="ai-glass" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>
                Hey {formData.name}! I'll chat with you in <strong>{PERSONA_OPTIONS.find((p) => p.id === formData.aiPersona)?.label}</strong> mode.
                Stay within {formatINR(dailyLimit)}/day and save {formatINR(savingsGoal)} every month. Let's start in chat! 🐼
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={btnSecondary}>
              Back
            </button>
          )}
          <button
            onClick={() => (step < 5 ? setStep(step + 1) : handleFinish())}
            disabled={!canProceed()}
            style={{
              ...btnPrimary,
              opacity: canProceed() ? 1 : 0.5,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
            }}
          >
            {step === 5 ? 'Start chatting 🐼' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <label style={{
        display: 'block',
        marginBottom: 'var(--space-2)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--fw-medium)',
        color: 'var(--text-primary)',
      }}>
        {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function SummaryCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-md)',
      background: highlight ? 'rgba(123, 158, 135, 0.12)' : 'var(--bg-primary)',
      border: `1px solid ${highlight ? 'var(--color-primary)' : 'var(--border-color)'}`,
    }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
        {icon} {label}
      </span>
      <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  fontSize: 'var(--text-base)',
  color: 'var(--text-primary)',
  background: 'var(--bg-primary)',
}

const btnPrimary: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: 'var(--color-primary)',
  color: 'white',
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--fw-semibold)',
  transition: 'all var(--transition-fast)',
}

const btnSecondary: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--fw-semibold)',
  cursor: 'pointer',
}
