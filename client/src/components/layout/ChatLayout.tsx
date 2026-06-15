import { NavLink } from 'react-router-dom'
import '../chat/Chat.css'

interface ChatLayoutProps {
  children: React.ReactNode
}

const quickNav = [
  { to: '/chat', label: 'Chat' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/budget', label: 'Budget' },
  { to: '/habits', label: 'Wellness' },
]

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="chat-layout">
      <div className="chat-layout__main">
        <nav className="chat-layout__nav">
          <span style={{ fontWeight: 'var(--fw-bold)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
            🐼 PocketBuddy
          </span>
          <div className="chat-layout__nav-links">
            {quickNav.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `chat-layout__nav-link ${isActive ? 'chat-layout__nav-link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
        {children}
      </div>
    </div>
  )
}
