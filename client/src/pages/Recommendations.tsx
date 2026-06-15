import { CAMPUS_DEALS, CAMPUS_RESOURCES } from '../data/indianMockData'

export default function Recommendations() {
  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-2)' }}>
        Deals & Campus 🎓
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
        Student discounts & campus resources for Indian colleges
      </p>

      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-6)' }}>
          💰 Student Deals (India)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
          {CAMPUS_DEALS.map((deal) => (
            <div key={deal.name} className="cozy-card">
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>{deal.icon}</div>
              <span style={{
                fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
              }}>
                {deal.category}
              </span>
              <h3 style={{ fontWeight: 'var(--fw-semibold)', margin: 'var(--space-2) 0' }}>{deal.name}</h3>
              <p style={{ color: 'var(--color-success)', fontWeight: 'var(--fw-bold)' }}>Save {deal.savings}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-6)' }}>
          🏫 Campus Resources
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {CAMPUS_RESOURCES.map((resource) => (
            <div key={resource.name} className="cozy-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>{resource.icon}</div>
              <h4 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-1)' }}>{resource.name}</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-dark)', marginBottom: 'var(--space-1)' }}>
                {resource.type}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{resource.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
