import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 'var(--space-8)',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: 'var(--text-5xl)',
        fontWeight: 'var(--fw-bold)',
        color: 'var(--color-primary)',
        marginBottom: 'var(--space-4)',
      }}>
        404
      </h1>
      <p style={{
        fontSize: 'var(--text-2xl)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-2)',
      }}>
        Page not found
      </p>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-8)',
      }}>
        The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: 'var(--color-primary)',
          color: 'white',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--fw-semibold)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        Go home
      </button>
    </div>
  )
}
