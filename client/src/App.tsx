import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AppDataProvider } from './context/AppDataContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Analytics from './pages/Analytics'
import Chat from './pages/Chat'
import Habits from './pages/Habits'
import Recommendations from './pages/Recommendations'
import FoodCompanion from './pages/FoodCompanion'
import MenuScanner from './pages/MenuScanner'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import ChatLayout from './components/layout/ChatLayout'

function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ChatLayout>{children}</ChatLayout>
    </ProtectedRoute>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
                <Route path="/transactions" element={<AppShell><Transactions /></AppShell>} />
                <Route path="/budget" element={<AppShell><Budget /></AppShell>} />
                <Route path="/analytics" element={<AppShell><Analytics /></AppShell>} />
                <Route path="/chat" element={<ChatShell><Chat /></ChatShell>} />
                <Route path="/habits" element={<AppShell><Habits /></AppShell>} />
                <Route path="/food" element={<AppShell><FoodCompanion /></AppShell>} />
                <Route path="/menu-scanner" element={<AppShell><MenuScanner /></AppShell>} />
                <Route path="/recommendations" element={<AppShell><Recommendations /></AppShell>} />
                <Route path="/settings" element={<AppShell><Settings /></AppShell>} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ToastProvider>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
