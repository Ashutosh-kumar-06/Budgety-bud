import { useNavigate } from 'react-router-dom'
import { formatINR } from '../../utils/currency'
import type { CoachChatMessage } from '../../services/aiCoachEngine'

interface ChatBubbleProps {
  message: CoachChatMessage
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function InsightCard({ message }: { message: CoachChatMessage }) {
  const navigate = useNavigate()
  const { meta } = message

  return (
    <div className="chat-insight-card">
      <div className="chat-insight-card__title">
        {message.type === 'insight_wellness' ? '💚 Wellness' : '💰 Budget Snapshot'}
      </div>
      {meta?.todaySpent !== undefined && (
        <div className="chat-insight-card__stat">
          <span>Spent today</span>
          <strong>{formatINR(meta.todaySpent)}</strong>
        </div>
      )}
      {meta?.budgetLeft !== undefined && (
        <div className="chat-insight-card__stat">
          <span>Left today</span>
          <strong style={{ color: 'var(--color-success)' }}>{formatINR(meta.budgetLeft)}</strong>
        </div>
      )}
      {meta?.dailyLimit !== undefined && (
        <div className="chat-insight-card__stat">
          <span>Daily limit</span>
          <strong>{formatINR(meta.dailyLimit)}</strong>
        </div>
      )}
      {meta?.foodPercent !== undefined && (
        <div className="chat-insight-card__stat">
          <span>Food spending</span>
          <strong style={{ color: 'var(--color-warning)' }}>{meta.foodPercent}%</strong>
        </div>
      )}
      {meta?.actionLabel && meta?.actionPath && (
        <button
          className="chat-insight-card__action"
          onClick={() => navigate(meta.actionPath!)}
        >
          {meta.actionLabel} →
        </button>
      )}
    </div>
  )
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  if (message.type === 'insight_budget' || message.type === 'insight_wellness') {
    if (!message.content && message.meta) {
      return (
        <div className="chat-bubble-row chat-bubble-row--assistant">
          <span className="chat-bubble-row__mini-avatar">🐼</span>
          <InsightCard message={message} />
        </div>
      )
    }
  }

  const bubbleClass = [
    'chat-bubble',
    isUser ? 'chat-bubble--user' : 'chat-bubble--assistant',
    message.type === 'crisis' ? 'chat-bubble--crisis' : '',
    message.type === 'transparency' ? 'chat-bubble--transparency' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={`chat-bubble-row chat-bubble-row--${isUser ? 'user' : 'assistant'}`}>
      {!isUser && <span className="chat-bubble-row__mini-avatar">🐼</span>}
      <div>
        <div className={bubbleClass}>{message.content}</div>
        <div className="chat-bubble__time" style={{ textAlign: isUser ? 'right' : 'left' }}>
          {formatTime(message.timestamp)}
        </div>
        {(message.type === 'insight_budget' || message.type === 'insight_wellness') && message.meta && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <InsightCard message={message} />
          </div>
        )}
      </div>
    </div>
  )
}
