import Link from 'next/link'

const SERVICES = [
  { href: '/hotel',      icon: '🏨', title: 'Hébergement',    desc: 'Réservez votre chambre ou suite',  color: '#4a7fa5' },
  { href: '/ristorante', icon: '🍽️', title: 'Restaurant',     desc: 'Réservez votre table',             color: '#4a9070' },
  { href: '/spa',        icon: '💆', title: 'Spa & Bien-être', desc: 'Soins, piscine et jacuzzi',        color: '#7a6fa5' },
  { href: '/padel',      icon: '🎾', title: 'Padel',           desc: 'Réservez un terrain',              color: '#a07a30' },
]

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .svc-card {
          display: block;
          background: #fff;
          border: 1px solid #e8e6e1;
          border-radius: 12px;
          padding: 28px 22px;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
          text-decoration: none;
          height: 100%;
          box-sizing: border-box;
        }
        .svc-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.06); border-color: #c0bdb8; }
        .svc-card .arr { color: #9a9690; transition: color 0.15s; }
        .svc-card:hover .arr { color: #1a1a1a; }
      `}</style>

      <nav style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e6e1', background: '#fff' }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#1a1a1a' }}>
          Réservations
        </div>
        <div style={{ fontSize: '12px', color: '#9a9690', letterSpacing: '0.04em' }}>EN LIGNE</div>
      </nav>

      <section style={{ padding: '72px 32px 56px', textAlign: 'center' }}>
        <h1 className="anim-fadeup" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, color: '#1a1a1a', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 14px' }}>
          Réservez en ligne
        </h1>
        <p className="anim-fadeup-2" style={{ fontSize: '16px', color: '#6b6760', lineHeight: 1.7, margin: '0 auto', maxWidth: '380px' }}>
          Choisissez une prestation et réservez en quelques instants.
        </p>
      </section>

      <section style={{ flex: 1, padding: '0 32px 80px', maxWidth: '860px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
          {SERVICES.map((s, i) => (
            <Link key={s.href} href={s.href} className={`svc-card anim-fadeup-${i + 2}`}>
              <div style={{ fontSize: '26px', marginBottom: '14px' }}>{s.icon}</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '19px', color: '#1a1a1a', marginBottom: '6px' }}>{s.title}</div>
              <p style={{ fontSize: '13px', color: '#8a8680', lineHeight: 1.5, margin: '0 0 16px' }}>{s.desc}</p>
              <div className="arr" style={{ fontSize: '13px' }}>Réserver →</div>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ padding: '20px 32px', borderTop: '1px solid #e8e6e1', background: '#fff', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontSize: '12px', color: '#b0aca6', margin: 0 }}>
          Réservations propulsées par{' '}
          <a href="https://nexlyhub.com" target="_blank" rel="noopener" style={{ color: '#8a8680' }}>
            Nexly Hub
          </a>
        </p>
      </footer>
    </main>
  )
}
