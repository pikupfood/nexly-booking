import { getTenantBySlug } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const MODULE_CFG: Record<string, { icon: string; title: string; desc: string; cta: string; color: string; gradient: string }> = {
  hotel:      { icon:'🏨', title:'Hébergement',    desc:'Chambres et suites — réservez votre séjour en quelques instants', cta:'Réserver une chambre', color:'#1e3a5f', gradient:'linear-gradient(135deg,#1e3a5f,#2d6a9f)' },
  restaurant: { icon:'🍽️', title:'Restaurant',     desc:'Une expérience gastronomique — réservez votre table',           cta:'Réserver une table',  color:'#2d4a2d', gradient:'linear-gradient(135deg,#2d4a2d,#3d7a3d)' },
  spa:        { icon:'💆', title:'Spa & Bien-être', desc:'Massages, soins et balnéo — prenez soin de vous',               cta:'Prendre rendez-vous', color:'#3d2d5f', gradient:'linear-gradient(135deg,#3d2d5f,#6b4fa0)' },
  padel:      { icon:'🎾', title:'Padel',           desc:'Courts couverts et en plein air — réservez votre terrain',      cta:'Réserver un terrain', color:'#4a3000', gradient:'linear-gradient(135deg,#4a3000,#8b6000)' },
}

export default async function TenantHomePage({ params }: { params: { slug: string } }) {
  const tenant = await getTenantBySlug(params.slug)
  if (!tenant) notFound()

  const accent = tenant.primary_color || '#1a1a1a'

  return (
    <main style={{ minHeight:'100vh', background:'#faf9f7', fontFamily:'"Cormorant Garamond","Georgia",serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; }
        .svc-card { display:block; text-decoration:none; cursor:pointer; transition:all 0.25s; }
        .svc-card:hover .card-inner { transform:translateY(-4px); box-shadow:0 20px 60px rgba(0,0,0,0.12); }
        .svc-card:hover .cta-btn { opacity:1; transform:translateY(0); }
        .cta-btn { opacity:0; transform:translateY(6px); transition:all 0.2s; }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header style={{ padding:'28px 48px', borderBottom:'1px solid #ebe9e4', background:'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:'26px', fontWeight:'400', color:'#1a1a1a', letterSpacing:'0.02em', lineHeight:1.1 }}>
            {tenant.business_name}
          </div>
          {tenant.city && <div style={{ fontSize:'11px', color:'#9a9690', letterSpacing:'0.12em', marginTop:'2px', fontFamily:'"DM Sans",sans-serif' }}>{tenant.city?.toUpperCase()}</div>}
        </div>
        <div style={{ fontSize:'11px', color:'#9a9690', letterSpacing:'0.1em', fontFamily:'"DM Sans",sans-serif' }}>RÉSERVATIONS EN LIGNE</div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 48px 64px', textAlign:'center', maxWidth:'700px', margin:'0 auto' }}>
        <div style={{ fontSize:'11px', color:'#9a9690', letterSpacing:'0.2em', marginBottom:'20px', fontFamily:'"DM Sans",sans-serif' }}>
          BIENVENUE
        </div>
        <h1 style={{ fontSize:'clamp(36px,5vw,58px)', fontWeight:'300', color:'#1a1a1a', lineHeight:1.15, letterSpacing:'-0.01em', margin:'0 0 18px', fontStyle:'italic' }}>
          {tenant.welcome_message || `Vivez une expérience unique à ${tenant.business_name}`}
        </h1>
        <div style={{ width:'40px', height:'1px', background:'#c8c4be', margin:'0 auto 20px' }} />
        <p style={{ fontSize:'16px', color:'#6b6760', lineHeight:1.8, margin:0, fontFamily:'"DM Sans",sans-serif', fontWeight:'300' }}>
          Choisissez une prestation et réservez en quelques instants, directement en ligne.
        </p>
      </section>

      {/* ── SERVICE CARDS ────────────────────────────────────────────── */}
      <section style={{ padding:'0 48px 80px', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'20px' }}>
          {(tenant.modules||[]).map((mod: string) => {
            const cfg = MODULE_CFG[mod]
            if (!cfg) return null
            const href = `/${params.slug}/${mod === 'restaurant' ? 'ristorante' : mod}`
            return (
              <Link key={mod} href={href} className="svc-card">
                <div className="card-inner" style={{ background:'white', border:'1px solid #ebe9e4', borderRadius:'4px', overflow:'hidden', transition:'all 0.25s', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  {/* Card visual */}
                  <div style={{ height:'160px', background:cfg.gradient, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' as const }}>
                    <span style={{ fontSize:'48px', filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>{cfg.icon}</span>
                  </div>
                  {/* Card content */}
                  <div style={{ padding:'24px 22px 20px' }}>
                    <div style={{ fontSize:'20px', fontWeight:'400', color:'#1a1a1a', marginBottom:'8px', letterSpacing:'0.01em' }}>
                      {cfg.title}
                    </div>
                    <p style={{ fontSize:'13px', color:'#8a8680', lineHeight:1.6, margin:'0 0 18px', fontFamily:'"DM Sans",sans-serif', fontWeight:'300' }}>
                      {cfg.desc}
                    </p>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span className="cta-btn" style={{ fontSize:'12px', color:cfg.color, fontFamily:'"DM Sans",sans-serif', fontWeight:'500', letterSpacing:'0.04em' }}>
                        {cfg.cta} →
                      </span>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', border:`1px solid ${cfg.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:'12px', color:cfg.color }}>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        {tenant.modules?.length === 0 && (
          <div style={{ textAlign:'center', color:'#9a9690', fontSize:'14px', padding:'48px 0', fontFamily:'"DM Sans",sans-serif' }}>
            Aucun service disponible pour le moment.
          </div>
        )}
      </section>

      {/* ── INFO BAR ─────────────────────────────────────────────────── */}
      {(tenant.phone || tenant.address || tenant.email) && (
        <footer style={{ borderTop:'1px solid #ebe9e4', padding:'28px 48px', background:'white', display:'flex', justifyContent:'center', gap:'40px', flexWrap:'wrap' }}>
          {tenant.address && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#8a8680', fontFamily:'"DM Sans",sans-serif' }}>
              <span>📍</span> {tenant.address}
            </div>
          )}
          {tenant.phone && (
            <a href={`tel:${tenant.phone}`} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#8a8680', fontFamily:'"DM Sans",sans-serif', textDecoration:'none' }}>
              <span>📞</span> {tenant.phone}
            </a>
          )}
          {tenant.email && (
            <a href={`mailto:${tenant.email}`} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#8a8680', fontFamily:'"DM Sans",sans-serif', textDecoration:'none' }}>
              <span>✉️</span> {tenant.email}
            </a>
          )}
        </footer>
      )}

      {/* ── POWERED BY ──────────────────────────────────────────────── */}
      <div style={{ textAlign:'center', padding:'16px', fontSize:'10px', color:'#c8c4be', letterSpacing:'0.1em', fontFamily:'"DM Sans",sans-serif' }}>
        PROPULSÉ PAR NEXLY HUB
      </div>
    </main>
  )
}
