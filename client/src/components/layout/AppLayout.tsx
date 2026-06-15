import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { useAppData } from '../../context/AppDataContext'
import { formatINR } from '../../utils/currency'
import './AppLayout.css'

interface AppLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { section: 'AI Coach', items: [
    { to: '/chat', label: 'Chat', icon: '💬' },
  ]},
  { section: 'Home', items: [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  ]},
  { section: 'Finance', items: [
    { to: '/transactions', label: 'Transactions', icon: '💸' },
    { to: '/budget', label: 'Budget', icon: '📊' },
    { to: '/analytics', label: 'Insights', icon: '📈' },
  ]},
  { section: 'Food & Wellness', items: [
    { to: '/food', label: 'What to Eat?', icon: '🍛' },
    { to: '/menu-scanner', label: 'Menu Scanner', icon: '📋' },
    { to: '/habits', label: 'Wellness', icon: '🌿' },
  ]},
  { section: 'AI & More', items: [
    { to: '/recommendations', label: 'Deals & Campus', icon: '🎓' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ]},
]

export default function AppLayout({ children }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const { profile, budgetLeft, savingsStreak, rewardEmoji } = useAppData()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
            Budgety bud
          </h2>
          <span>Finance & wellness for students</span>
          <div className="app-sidebar__level">
            {rewardEmoji} {savingsStreak}-day savings streak
          </div>
        </div>

        <nav className="app-sidebar__nav">
          {navItems.map((group) => (
            <div key={group.section}>
              <div className="app-sidebar__section">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
                  }
                >
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          <div className="app-sidebar__xp">
            Budget left today: <strong>{formatINR(budgetLeft)}</strong>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="app-topbar__greeting">
              Hello, {profile?.name ?? 'Student'} 👋
            </div>
            <div className="app-topbar__subtitle">
              {profile?.college ?? 'Your college'}
            </div>
          </div>
          <div className="app-topbar__actions">
            <button
              className="app-topbar__theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className="app-topbar__theme-btn"
              onClick={() => navigate('/settings')}
              aria-label="Settings"
            >
              ⚙️
            </button>
            <button
              className="app-topbar__theme-btn"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </header>
        <main className="app-content page-transition">{children}</main>
      </div>
    </div>
  )
}