import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail } from '../utils/validation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required')
      return
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await login(trimmedEmail, trimmedPassword)
      navigate('/dashboard')
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
    <div className="auth-screen">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-2)', color: 'var(--color-primary)' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Sign in to your Budgety bud account
          </p>
        </div>

        {error && (
          <div className="alert-card alert-card-warning" style={{ marginBottom: 'var(--space-4)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>
              Email
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>
              Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 'var(--fw-semibold)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}