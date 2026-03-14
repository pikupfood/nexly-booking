import { getTenantBySlug } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const MODULE_CFG: Record<string, { icon: string; title: string; desc: string; color: string }> = {
  hotel:      { icon: '🏨', title: 'Hébergement',    desc: 'Réservez votre chambre ou suite',  color: '#4a7fa5' },
  restaurant: { icon: '🍽️', title: 'Restaurant',     desc: 'Réservez votre table',             color: '#4a9070' },
  spa:        { icon: '💆', title: 'Spa & Bien-être', desc: 'Soins, piscine et jacuzzi',        color: '#7a6fa5' },
  padel:      { icon: '🎾', title: 'Padel',           desc: 'Réservez un terrain',              color: '#a07a30' },
}

export default async function TenantHomePage({ params }: { params: { slug: string } }) {
  const tenant = await getTenantBySlug(params.slug)
  if (!tenant) notFound()

  const accent = tenant.primary_color || '#1a1a1a'

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .svc-card { display:block; background:#fff; border:1px solid #e8e6e1; border-radius:12px; padding:28px 22px; cursor:pointer; transition:border-color 0.15s, box-shadow 0.15s, transform 0.15s; text-decoration:none; }
        .svc-card:hover { transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,0.06); }
      `}</style>

      {/* Nav */}
      <nav style={{ padding:'20px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #e8e6e1', background:'#fff' }}>
        <div style={{ fontFamily:"Georgia, serif", fontSize:'20px', color:'#1a1a1a', fontWeight:400 }}>
          {tenant.business_name}
        </div>
        <div style={{ fontSize:'12px', color:'#9a9690', letterSpacing:'0.04em' }}>RÉSERVATIONS EN LIGNE</div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'64px 32px 48px', textAlign:'center' }}>
        <h1 style={{ fontFamily:"Georgia, serif", fontSize:'clamp(28px,5vw,48px)', fontWeight:400, color:'#1a1a1a', lineHeight:1.15, letterSpacing:'-0.02em', margin:'0 0 14px' }}>
          Réservez en ligne
        </h1>
        <p style={{ fontSize:'16px', color:'#6b6760', lineHeight:1.7, margin:'0 auto', maxWidth:'380px' }}>
          {tenant.welcome_message || 'Choisissez une prestation et réservez en quelques instants.'}
        </p>
      </section>

      {/* Services */}
      <section style={{ flex:1, padding:'0 32px 80px', maxWidth:'860px', margin:'0 auto', width:'100%', boxSizing:'border-box' as const }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px,1fr))', gap:'14px' }}>
          {tenant.modules.map((mod: string) => {
            const cfg = MODULE_CFG[mod]
            if (!cfg) return null
            return (
              <Link key={mod} href={`/${params.slug}/${mod === 'restaurant' ? 'ristorante' : mod}`} className="svc-card">
                <div style={{ fontSize:'26px', marginBottom:'14px' }}>{cfg.icon}</div>
                <div style={{ fontFamily:"Georgia, serif", fontSize:'19px', color:'#1a1a1a', marginBottom:'6px' }}>{cfg.title}</div>
                <p style={{ fontSize:'13px', color:'#8a8680', lineHeight:1.5, margin:'0 0 16px' }}>{cfg.desc}</p>
                <div style={{ fontSize:'13px', color: accent }}>Réserver →</div>
              </Link>
            )
          })}
        </div>
        {tenant.modules.length === 0 && (
          <div style={{ textAlign:'center', color:'#9a9690', fontSize:'14px', padding:'48px 0' }}>
            Aucun service disponible pour le moment.
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ padding:'20px 32px', borderTop:'1px solid #e8e6e1', background:'#fff', display:'flex', justifyContent:'center' }}>
        <p style={{ fontSize:'12px', color:'#b0aca6', margin:0 }}>
          Réservations propulsées par{' '}
          <a href="https://nexlyhub.com" target="_blank" rel="noopener" style={{ color:'#8a8680' }}>Nexly Hub</a>
        </p>
      </footer>
    </main>
  )
}
