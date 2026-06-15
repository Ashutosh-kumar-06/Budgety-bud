import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useAppData } from '../hooks/useAppData'
import { formatINR } from '../utils/currency'
import { useNavigate } from 'react-router-dom'
import { PERSONA_OPTIONS } from '../services/aiCoachEngine'
import { authService } from '../services/authService'
import { validatePassword, PASSWORD_REQUIREMENTS_HINT } from '../utils/validation'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { profile, banks, aiPersona, setAiPersona } = useAppData()
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-2)' }}>
        Settings ⚙️
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
        Manage your profile & preferences
      </p>

      <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-4)' }}>Profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Row label="Name" value={profile?.name ?? '—'} />
          <Row label="College" value={profile?.college ?? '—'} />
          <Row label="Age" value={profile?.age ? String(profile.age) : '—'} />
          <Row label="Pocket Money" value={formatINR(profile?.pocketMoney ?? 0)} />
          <Row label="Savings Goal" value={formatINR(profile?.monthlySavingsGoal ?? 0)} />
          <Row label="Daily Limit" value={formatINR(profile?.dailySpendingLimit ?? 0)} />
        </div>
        <button onClick={() => navigate('/onboarding')} style={{
          marginTop: 'var(--space-4)', padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
          background: 'transparent', cursor: 'pointer', fontSize: 'var(--text-sm)',
        }}>
          Re-run Onboarding
        </button>
      </div>

      <ChangePasswordCard />

      <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-4)' }}>AI Coach Personality</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          How should Pocket Panda talk to you?
        </p>
        {PERSONA_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setAiPersona(opt.id)}
            style={{
              width: '100%', textAlign: 'left', padding: 'var(--space-3)',
              marginBottom: 'var(--space-2)', borderRadius: 'var(--radius-md)',
              border: aiPersona === opt.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
              background: aiPersona === opt.id ? 'rgba(61, 90, 128, 0.08)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {opt.emoji} <strong>{opt.label}</strong>
            <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{opt.desc}</span>
          </button>
        ))}
        <div className="alert-card alert-card-info" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
          Pocket Panda is an AI companion — not a human or licensed therapist. Crisis support numbers are shared when needed.
        </div>
      </div>

      <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
        {banks.map((bank) => (
          <div key={bank.id} style={{
            display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0',
            borderBottom: '1px solid var(--border-subtle)', fontSize: 'var(--text-sm)',
          }}>
            <span>{bank.logo} {bank.bankName}</span>
            <span style={{ fontWeight: 'var(--fw-semibold)' }}>{formatINR(bank.balance)}</span>
          </div>
        ))}
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
          Demo data — SBI, HDFC, Paytm Payments Bank
        </p>
      </div>

      <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-4)' }}>Appearance</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 'var(--fw-medium)' }}>
              {theme === 'dark' ? '🌙 Dark Cozy' : '☀️ Light Cozy'}
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Off-white & slate blue · Charcoal night mode
            </p>
          </div>
          <button onClick={toggleTheme} style={{
            padding: 'var(--space-2) var(--space-6)', borderRadius: 'var(--radius-md)',
            border: 'none', background: 'var(--color-primary)', color: 'white',
            fontWeight: 'var(--fw-semibold)', cursor: 'pointer',
          }}>
            Toggle
          </button>
        </div>
      </div>

      <div className="cozy-card">
        <h3 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-4)' }}>Notifications</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Gentle reminders only — no aggressive notifications 🌿
        </p>
        {['Budget alerts', 'Wellness reminders', 'Savings streak tips'].map((item) => (
          <label key={item} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', cursor: 'pointer',
          }}>
            <input type="checkbox" defaultChecked />
            {item}
          </label>
        ))}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 'var(--fw-medium)' }}>{value}</span>
    </div>
  )
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match')
      return
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from the current password')
      return
    }

    setLoading(true)
    try {
      const result = await authService.changePassword({ currentPassword, newPassword })
      setSuccess(result.message || 'Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      const message = axiosErr?.response?.data?.error
        || (err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cozy-card" style={{ marginBottom: 'var(--space-6)' }}>
      <h3 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-4)' }}>Account Security</h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
        Update your password to keep your account secure
      </p>

      {error && (
        <div className="alert-card alert-card-warning" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="alert-card" style={{ marginBottom: 'var(--space-4)' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)' }}>
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)' }}>
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={inputStyle}
          />
          <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {PASSWORD_REQUIREMENTS_HINT}
          </p>
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)' }}>
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)',
}