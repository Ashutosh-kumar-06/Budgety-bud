import { useRef, useState } from 'react'
import { formatINR } from '../utils/currency'
import PocketPanda from '../components/mascot/PocketPanda'
import { menuScannerService, type MenuScanData } from '../services/menuScannerService'

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const maybeAxios = err as { response?: { data?: { message?: string } } }
    if (maybeAxios.response?.data?.message) {
      return maybeAxios.response.data.message
    }
  }
  if (err instanceof Error) return err.message
  return 'Failed to scan menu. Please try again.'
}

export default function MenuScanner() {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [results, setResults] = useState<MenuScanData | null>(null)
  const [budget, setBudget] = useState(100)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setScanned(false)
    setError(null)

    try {
      const data = await menuScannerService.scanMenu(file, budget)
      setResults(data)
      setScanned(true)
    } catch (err) {
      setError(getErrorMessage(err))
      setResults(null)
      setScanned(false)
    } finally {
      setScanning(false)
      // allow re-selecting the same file again
      e.target.value = ''
    }
  }

  const categories = [
    { key: 'bestValue' as const, label: 'Best Value', icon: '⭐', desc: 'Great nutrition per rupee' },
    { key: 'healthiest' as const, label: 'Healthiest', icon: '🥗', desc: 'Light & nutritious' },
    { key: 'cheapest' as const, label: 'Cheapest', icon: '💸', desc: 'Easiest on your wallet' },
    { key: 'comfort' as const, label: 'Comfort Choice', icon: '🍜', desc: 'Soul-soothing food' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-2)' }}>
        Menu Scanner 📋
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
        Upload a canteen or restaurant menu — AI analyzes prices & recommends the best picks
      </p>

      <PocketPanda message="Snap a photo of your canteen menu or try our demo scan below! 📸" compact />

      <div className="cozy-card" style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
        <div style={{
          border: '2px dashed var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-10)',
          marginBottom: 'var(--space-4)',
          background: 'var(--bg-primary)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>📷</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Upload restaurant or canteen menu image
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={handleUpload}
            disabled={scanning}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--color-primary)',
              color: 'white',
              fontWeight: 'var(--fw-semibold)',
              cursor: scanning ? 'wait' : 'pointer',
            }}
          >
            {scanning ? '🔍 Scanning menu with OCR...' : '📤 Upload Menu'}
          </button>
        </div>

        <div style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)' }}>
            Your budget: {formatINR(budget)}
          </label>
          <input
            type="range"
            min="30"
            max="200"
            step="10"
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value))}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          />
        </div>
      </div>

      {scanning && (
        <div className="alert-card alert-card-info" style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
          🔄 Extracting items from menu... Analyzing prices, mood fit & budget...
        </div>
      )}

      {error && !scanning && (
        <div className="alert-card alert-card-warning" style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {scanned && results && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>🎯 AI Recommendations</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            Extracted {results.items.length} items from campus canteen menu
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {categories.map((cat) => {
              const item = results.recommendations[cat.key]
              return (
                <div key={cat.key} className="cozy-card-warm">
                  <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>{cat.icon}</div>
                  <h4 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-1)' }}>{cat.label}</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                    {cat.desc}
                  </p>
                  <p style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)' }}>{item.name}</p>
                  <p style={{ color: 'var(--color-primary-dark)', fontWeight: 'var(--fw-semibold)' }}>
                    {formatINR(item.price)}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="cozy-card" style={{ marginTop: 'var(--space-6)' }}>
            <h4 style={{ marginBottom: 'var(--space-3)' }}>📋 Full Extracted Menu</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {results.items.map((item) => (
                <div key={item.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-sm)',
                }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 'var(--fw-semibold)' }}>{formatINR(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cozy-card" style={{ marginTop: 'var(--space-6)' }}>
            <h4 style={{ marginBottom: 'var(--space-3)' }}>📊 Price Analysis</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-5)',
            }}>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Items Found</p>
                <p style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)' }}>{results.priceAnalysis.totalItems}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Average Price</p>
                <p style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)' }}>{formatINR(results.priceAnalysis.averagePrice)}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Lowest Price</p>
                <p style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)' }}>{formatINR(results.priceAnalysis.minPrice)}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Highest Price</p>
                <p style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)' }}>{formatINR(results.priceAnalysis.maxPrice)}</p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              <div>
                <h5 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-2)' }}>💸 Cheapest Items</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {results.cheapestItems.map((item) => (
                    <div key={item.name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-sm)',
                    }}>
                      <span>{item.name}</span>
                      <span style={{ fontWeight: 'var(--fw-semibold)' }}>{formatINR(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-2)' }}>💰 Most Expensive Items</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {results.mostExpensiveItems.map((item) => (
                    <div key={item.name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-sm)',
                    }}>
                      <span>{item.name}</span>
                      <span style={{ fontWeight: 'var(--fw-semibold)' }}>{formatINR(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}