import Link from 'next/link'

const SERVICES = [
  {
    href: '/hotel',
    icon: '🏨',
    title: 'Hôtel',
    subtitle: 'Séjours & Chambres',
    desc: 'Découvrez nos chambres et suites de prestige, du Standard au Penthouse.',
    color: '#8ba8c4',
    accent: '#8ba8c420',
  },
  {
    href: '/ristorante',
    icon: '🍽️',
    title: 'Restaurant',
    subtitle: 'Tables & Réservations',
    desc: 'Réservez votre table pour une expérience gastronomique inoubliable.',
    color: '#a8c4a0',
    accent: '#a8c4a020',
  },
  {
    href: '/spa',
    icon: '💆',
    title: 'Spa & Bien-être',
    subtitle: 'Massages · Piscine · Jacuzzi',
    desc: 'Soins exclusifs, piscine panoramique et jacuzzi privatif pour votre bien-être.',
    color: '#c4b8d4',
    accent: '#c4b8d420',
  },
  {
    href: '/padel',
    icon: '🎾',
    title: 'Padel',
    subtitle: 'Terrains & Créneaux',
    desc: 'Réservez l'un de nos 3 terrains couverts et découverts à votre convenance.',
    color: '#c9a96e',
    accent: '#c9a96e20',
  },
]

export default function HomePage() {
  return (
    <main>
      {/* Decorative background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #c9a96e08, transparent), radial-gradient(ellipse 40% 40% at 80% 80%, #8ba8c408, transparent)',
      }} />

      {/* Nav */}
      <nav className="anim-fadein" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #ffffff08',
        backdropFilter: 'blur(12px)',
        background: 'rgba(12,12,14,0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #c9a96e, #a07840)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '600', color: 'white',
          }}>N</div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 400, letterSpacing: '0.15em', color: '#f0ece4' }}>
            NEXLY
          </span>
        </div>
        <div style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#ffffff50' }}>
          RÉSERVATIONS EN LIGNE
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
      }}>
        {/* Ornament */}
        <div className="anim-fadein" style={{ marginBottom: '32px', opacity: 0.4 }}>
          <svg width="120" height="2" viewBox="0 0 120 2"><line x1="0" y1="1" x2="52" y2="1" stroke="#c9a96e" strokeWidth="1"/><circle cx="60" cy="1" r="2" fill="#c9a96e"/><line x1="68" y1="1" x2="120" y2="1" stroke="#c9a96e" strokeWidth="1"/></svg>
        </div>

        <div className="anim-fadeup" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: 300,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: '#f0ece4',
          marginBottom: '8px',
        }}>
          Bienvenue
        </div>
        <div className="anim-fadeup-2" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: 300,
          fontStyle: 'italic',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: '#c9a96e',
          marginBottom: '32px',
        }}>
          chez Nexly
        </div>

        <p className="anim-fadeup-3" style={{
          fontSize: '15px',
          fontWeight: 300,
          letterSpacing: '0.06em',
          color: '#ffffff60',
          maxWidth: '420px',
          lineHeight: 1.8,
          marginBottom: '56px',
        }}>
          Réservez en ligne votre chambre, votre table, un soin ou un terrain de padel — en quelques instants.
        </p>

        <div className="anim-fadeup-4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {SERVICES.map(s => (
            <Link key={s.href} href={s.href} className="gold-btn" style={{
              padding: '12px 24px',
              background: 'transparent',
              border: `1px solid ${s.color}60`,
              borderRadius: '40px',
              fontSize: '13px',
              letterSpacing: '0.08em',
              color: s.color,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>{s.icon}</span> {s.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '0 48px 120px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Section header */}
        <div className="anim-fadeup" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#c9a96e80', marginBottom: '12px' }}>NOS SERVICES</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: '#f0ece4' }}>
            Que souhaitez-vous réserver ?
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {SERVICES.map((s, i) => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
              <div className={`service-card anim-fadeup-${i + 2}`} style={{
                background: '#111116',
                border: `1px solid ${s.color}25`,
                borderRadius: '20px',
                padding: '40px 32px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
              }}>
                {/* BG accent */}
                <div style={{
                  position: 'absolute', top: -40, right: -40,
                  width: '140px', height: '140px', borderRadius: '50%',
                  background: s.accent,
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }} />

                <div style={{ fontSize: '36px', marginBottom: '20px' }}>{s.icon}</div>

                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '26px', fontWeight: 400,
                  color: '#f0ece4', marginBottom: '4px',
                }}>{s.title}</div>

                <div style={{
                  fontSize: '11px', letterSpacing: '0.12em',
                  color: s.color, marginBottom: '16px',
                  textTransform: 'uppercase',
                }}>{s.subtitle}</div>

                <p style={{
                  fontSize: '14px', fontWeight: 300,
                  color: '#ffffff50', lineHeight: 1.7,
                  marginBottom: '28px',
                }}>{s.desc}</p>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  fontSize: '12px', letterSpacing: '0.1em',
                  color: s.color, textTransform: 'uppercase',
                }}>
                  Réserver <span style={{ fontSize: '16px' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid #ffffff08',
        padding: '32px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', letterSpacing: '0.15em', color: '#c9a96e' }}>NEXLY</span>
          <span style={{ color: '#ffffff20', fontSize: '12px' }}>·</span>
          <span style={{ fontSize: '12px', color: '#ffffff30' }}>Portail de réservations</span>
        </div>
        <div style={{ fontSize: '12px', color: '#ffffff20' }}>© {new Date().getFullYear()} Nexly Hub SAS</div>
      </footer>
    </main>
  )
}
