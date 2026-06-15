import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppData } from '../hooks/useAppData'
import {
  generateResponse,
  generateWelcomeMessage,
  generateDailyCheckIn,
  generateContextualInsight,
  type CoachContext,
  type CoachChatMessage,
} from '../services/aiCoachEngine'
import ChatBubble from '../components/chat/ChatBubble'
import { chatService } from '../services/chatService'
import '../components/chat/Chat.css'

const QUICK_CHIPS = [
  'I feel stressed',
  'Can I afford pizza?',
  'How did I spend today?',
  'I hung out with friends',
  "Can't sleep",
]

export default function Chat() {
  const {
    profile,
    aiPersona,
    chatMessages,
    setChatMessages,
    coachMeta,
    updateCoachMeta,
    budgetLeft,
    todaySpent,
    savingsGoal,
    foodPercent,
    moodScore,
    alerts,
    moodEntries,
    habitLogs,
  } = useAppData()

  const dailyLimit = profile?.dailySpendingLimit ?? 116

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const buildContext = useCallback((): CoachContext => ({
    profile,
    persona: aiPersona,
    budgetLeft,
    todaySpent,
    dailyLimit,
    savingsGoal,
    foodPercent,
    moodScore,
    alerts,
    moodEntries,
    habitLogs,
    messageCount: coachMeta.messageCount,
    lateNightSessions: coachMeta.lateNightSessions,
    lastCheckInDate: coachMeta.lastCheckInDate,
  }), [profile, aiPersona, budgetLeft, todaySpent, dailyLimit, savingsGoal, foodPercent, moodScore, alerts, moodEntries, habitLogs, coachMeta])

  // Initialize chat: welcome + daily check-in + contextual insight
  useEffect(() => {
    if (initialized) return
    const ctx = buildContext()
    const msgs: CoachChatMessage[] = []

    if (chatMessages.length === 0) {
      msgs.push(generateWelcomeMessage(ctx))
      const insight = generateContextualInsight(ctx)
      if (insight) msgs.push(insight)
    }

    const checkIn = generateDailyCheckIn(ctx)
    if (checkIn) {
      msgs.push(checkIn)
      updateCoachMeta({ lastCheckInDate: new Date().toISOString().split('T')[0] })
    }

    if (msgs.length > 0) {
      setChatMessages((prev) => [...prev, ...msgs])
    }
    setInitialized(true)
  }, [initialized, chatMessages.length, buildContext, setChatMessages, updateCoachMeta])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, loading])

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const hour = new Date().getHours()
    const isLateNight = hour >= 23 || hour < 4

    const userMsg: CoachChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    updateCoachMeta({
      messageCount: coachMeta.messageCount + 1,
      lateNightSessions: isLateNight ? coachMeta.lateNightSessions + 1 : coachMeta.lateNightSessions,
    })

    // Detect food/hungry intent
    let location: { lat: number; lng: number } | undefined
    if (/starv|hungry|food|pizza|eat|restaurant/i.test(content)) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        location = { lat: position.coords.latitude, lng: position.coords.longitude }
      } catch (err) {
        console.warn('Geolocation failed or denied', err)
      }
    }

    try {
      const response = await chatService.sendMessage(content, undefined, location) as any;
      const assistantMsg: CoachChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.assistantMessage?.content || response.data?.assistantMessage?.content || 'Sorry, I am having trouble connecting.',
        type: 'text',
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, assistantMsg])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg: CoachChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Oops, something went wrong hitting the backend AI.',
        type: 'text',
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, errorMsg])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const personaLabel = aiPersona === 'sweet_supportive' ? 'Sweet & Supportive' : 'Tough Love'

  return (
    <div className="chat-page chat-page--fullscreen">
      <header className="chat-header">
        <div className="chat-header__avatar">🐼</div>
        <div className="chat-header__info">
          <h2>Pocket Panda</h2>
          <div className="chat-header__status">Online · AI Buddy</div>
          <div className="chat-header__ai-badge">{personaLabel} mode · Not a human therapist</div>
        </div>
      </header>

      <div className="chat-messages">
        {chatMessages.length > 0 && (
          <div className="chat-date-divider">Today</div>
        )}

        {chatMessages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="chat-typing">
            <span className="chat-bubble-row__mini-avatar">🐼</span>
            <div className="chat-typing__dots">
              <span className="chat-typing__dot" />
              <span className="chat-typing__dot" />
              <span className="chat-typing__dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatMessages.length <= 2 && (
        <div className="chat-quick-chips">
          {QUICK_CHIPS.map((chip) => (
            <button key={chip} className="chat-quick-chip" onClick={() => handleSend(chip)}>
              {chip}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input-bar__field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Pocket Panda..."
          disabled={loading}
          rows={1}
        />
        <button
          className="chat-input-bar__send"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
