import './PocketPanda.css'

interface PocketPandaProps {
  message: string
  compact?: boolean
}

export default function PocketPanda({ message, compact }: PocketPandaProps) {
  return (
    <div className={`pocket-panda ${compact ? 'pocket-panda--compact' : ''}`}>
      <div className="pocket-panda__avatar" role="img" aria-label="Pocket Panda mascot">
        🐼
      </div>
      <div className="pocket-panda__bubble">
        <strong style={{ color: 'var(--text-primary)' }}>Pocket Panda says:</strong>
        <p style={{ margin: 'var(--space-1) 0 0' }}>{message}</p>
      </div>
    </div>
  )
}
