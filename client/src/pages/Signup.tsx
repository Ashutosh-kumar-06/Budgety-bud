import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail, validatePassword, PASSWORD_REQUIREMENTS_HINT } from '../utils/validation'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signup } = useAuth()

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedConfirm = confirmPassword.trim()

    if (!trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      setError('All fields are required')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    const passwordError = validatePassword(trimmedPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('Passwords do not match')
      return
    }

    // Update state with trimmed values
    setEmail(trimmedEmail)
    setPassword(trimmedPassword)
    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Name is required')
      return
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    setLoading(true)

    try {
      await signup({ email, password, name: trimmedName })
      navigate('/onboarding')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      const message = axiosErr?.response?.data?.error
        || (err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToStep1 = () => {
    setError('')
    setStep(1)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)', color: 'var(--color-primary)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-2)', color: 'var(--color-primary)' }}>
            Create account
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Step {step} of 2
          </p>
        </div>

        {error && (
          <div className="alert-card alert-card-warning" style={{ marginBottom: 'var(--space-4)' }}>
            ⚠️ {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--fw-medium)',
                color: 'var(--text-primary)',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-primary)',
                }}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--fw-medium)',
                color: 'var(--text-primary)',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-primary)',
                }}
              />
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {PASSWORD_REQUIREMENTS_HINT}
              </p>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--fw-medium)',
                color: 'var(--text-primary)',
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-primary)',
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit}>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--fw-medium)',
                color: 'var(--text-primary)',
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-primary)',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>
          </form>
        )}

        <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 'var(--fw-semibold)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}