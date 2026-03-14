'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, getTenantBySlug } from '@/lib/supabase'

const IS: any = { width:'100%', padding:'11px 14px', background:'#fff', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#1a1a1a', fontSize:'14px', outline:'none', boxSizing:'border-box' }
const LS: any = { display:'block', fontSize:'12px', fontWeight:500, color:'#6b6760', marginBottom:'6px' }
const TIMES = ['12:00','12:30','13:00','13:30','19:00','19:30','20:00','20:30','21:00','21:30']
const SERVICES = ['Déjeuner','Dîner','Brunch']

export default function RistoranteBookingPage() {
  const { slug } = useParams() as { slug: string }
  const [tenant, setTenant] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [booking, setBooking] = useState({ date: '', time: '20:00', guests_count: 2, service: 'Dîner', notes: '' })
  const [client, setClient] = useState({ name: '', phone: '', email: '' })
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [bookingRef, setBookingRef] = useState('')

  useEffect(() => {
    getTenantBySlug(slug).then(t => {
      if (!t) return
      setTenant(t)
      supabase.from('restaurant_tables').select('*').eq('tenant_id', t.id).eq('status', 'free').order('table_number').then(({ data }) => setTables(data || []))
    })
  }, [slug])

  const handleSubmit = async () => {
    if (!tenant) return
    setSubmitting(true)
    const { data } = await supabase.from('table_reservations').insert([{
      guest_name: client.name, guest_phone: client.phone || null, guest_email: client.email || null,
      table_id: selectedTable?.id || null, date: booking.date, time: booking.time,
      guests_count: booking.guests_count, notes: `${booking.service}${booking.notes ? ' — '+booking.notes : ''}`,
      status: 'confirmed', tenant_id: tenant.id,
    }]).select().single()
    if (data) { setBookingRef(data.reservation_number || ''); setSuccess(true) }
    setSubmitting(false)
  }

  const Chip = ({ label, active, onClick }: any) => (
    <button onClick={onClick} style={{ padding:'8px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px', background: active ? '#1a1a1a' : '#fff', border:`1px solid ${active ? '#1a1a1a' : '#d8d5d0'}`, color: active ? '#fff' : '#6b6760', transition:'all 0.15s' }}>{label}</button>
  )

  if (!tenant) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafaf9' }}><span style={{ color:'#8a8680' }}>Chargement...</span></div>

  if (success) return (
    <main style={{ minHeight:'100vh', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ textAlign:'center', maxWidth:'400px' }}>
        <div style={{ width:'56px', height:'56px', background:'#1a1a1a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', margin:'0 auto 24px' }}>✓</div>
        <div style={{ fontFamily:'Georgia,serif', fontSize:'28px', color:'#1a1a1a', marginBottom:'12px' }}>Table réservée</div>
        <div style={{ fontSize:'14px', color:'#6b6760', marginBottom:'28px' }}>{booking.service} · {booking.date} à {booking.time} · {booking.guests_count} personnes</div>
        {bookingRef && <div style={{ background:'#fff', border:'1px solid #e8e6e1', borderRadius:'10px', padding:'16px', marginBottom:'24px' }}><div style={{ fontSize:'11px', color:'#9a9690', marginBottom:'6px', fontWeight:500 }}>RÉFÉRENCE</div><div style={{ fontFamily:'Georgia,serif', fontSize:'20px' }}>{bookingRef}</div></div>}
        <Link href={`/${slug}`} style={{ display:'inline-block', padding:'12px 28px', background:'#1a1a1a', color:'#fff', borderRadius:'8px', fontSize:'14px', textDecoration:'none' }}>← Retour</Link>
      </div>
    </main>
  )

  const btnStyle = (active: boolean) => ({ padding:'12px', background: active ? '#1a1a1a' : '#e8e6e1', color: active ? '#fff' : '#9a9690', border:'none', borderRadius:'8px', cursor: active ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:500, flex:1 as any })
  const LOC: Record<string,string> = { sala:'Salle', terrazza:'Terrasse', privato:'Privé', bar:'Bar' }

  return (
    <main style={{ minHeight:'100vh', background:'#fafaf9' }}>
      <nav style={{ background:'#fff', borderBottom:'1px solid #e8e6e1', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:50 }}>
        <Link href={`/${slug}`} style={{ fontSize:'13px', color:'#8a8680', textDecoration:'none' }}>← {tenant.business_name}</Link>
        <span style={{ color:'#d8d5d0' }}>|</span>
        <span style={{ fontFamily:'Georgia,serif', fontSize:'15px', color:'#1a1a1a' }}>Restaurant</span>
      </nav>
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'40px 24px 80px' }}>

        {step === 1 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Votre réservation</div>
            <div style={{ marginBottom:'18px' }}>
              <label style={LS}>Type de repas</label>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>{SERVICES.map(s => <Chip key={s} label={s} active={booking.service===s} onClick={() => setBooking(p=>({...p,service:s}))} />)}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'18px' }}>
              <div><label style={LS}>Date *</label><input style={IS} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]} onChange={e => setBooking(p=>({...p,date:e.target.value}))} /></div>
              <div><label style={LS}>Personnes</label><input style={IS} type="number" min="1" max="20" value={booking.guests_count} onChange={e => setBooking(p=>({...p,guests_count:parseInt(e.target.value)||1}))} /></div>
            </div>
            <div style={{ marginBottom:'18px' }}>
              <label style={LS}>Heure</label>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>{TIMES.map(t => <Chip key={t} label={t} active={booking.time===t} onClick={() => setBooking(p=>({...p,time:t}))} />)}</div>
            </div>
            <div style={{ marginBottom:'20px' }}><label style={LS}>Demandes particulières</label><textarea style={{ ...IS, height:'75px', resize:'vertical' as any }} value={booking.notes} onChange={e => setBooking(p=>({...p,notes:e.target.value}))} placeholder="Allergie, occasion spéciale..." /></div>
            <button onClick={() => setStep(2)} disabled={!booking.date} style={btnStyle(!!booking.date)}>Continuer →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'8px' }}>Choix de la table</div>
            <p style={{ fontSize:'13px', color:'#8a8680', marginBottom:'18px' }}>Optionnel — laissez-nous attribuer si aucune préférence</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:'10px', marginBottom:'24px' }}>
              <div onClick={() => setSelectedTable(null)} style={{ padding:'14px', borderRadius:'10px', cursor:'pointer', textAlign:'center', background:'#fff', border:`1.5px solid ${!selectedTable ? '#1a1a1a' : '#e8e6e1'}`, transition:'border-color 0.15s' }}>
                <div style={{ fontSize:'13px', fontWeight:500 }}>Sans préférence</div>
              </div>
              {tables.filter(t => t.capacity >= booking.guests_count).map(t => (
                <div key={t.id} onClick={() => setSelectedTable(t)} style={{ padding:'14px', borderRadius:'10px', cursor:'pointer', textAlign:'center', background:'#fff', border:`1.5px solid ${selectedTable?.id===t.id ? '#1a1a1a' : '#e8e6e1'}`, transition:'border-color 0.15s' }}>
                  <div style={{ fontSize:'11px', color:'#8a8680', marginBottom:'4px' }}>{LOC[t.location]}</div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:'18px' }}>Table {t.table_number}</div>
                  <div style={{ fontSize:'11px', color:'#9a9690' }}>{t.capacity} pers.</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setStep(1)} style={{ padding:'12px 20px', background:'transparent', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#6b6760', cursor:'pointer', fontSize:'14px' }}>← Retour</button>
              <button onClick={() => setStep(3)} style={btnStyle(true)}>Continuer →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Vos coordonnées</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'20px' }}>
              <div><label style={LS}>Nom & Prénom *</label><input style={IS} value={client.name} onChange={e => setClient(p=>({...p,name:e.target.value}))} placeholder="Jean Dupont" /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div><label style={LS}>Email</label><input style={IS} type="email" value={client.email} onChange={e => setClient(p=>({...p,email:e.target.value}))} /></div>
                <div><label style={LS}>Téléphone</label><input style={IS} value={client.phone} onChange={e => setClient(p=>({...p,phone:e.target.value}))} /></div>
              </div>
            </div>
            <div style={{ background:'#f5f5f3', borderRadius:'10px', padding:'16px 18px', marginBottom:'20px', fontSize:'13px', display:'grid', gridTemplateColumns:'auto 1fr', gap:'6px 16px' }}>
              <span style={{ color:'#8a8680' }}>Repas</span><span style={{ fontWeight:500 }}>{booking.service}</span>
              <span style={{ color:'#8a8680' }}>Date</span><span style={{ fontWeight:500 }}>{booking.date} à {booking.time}</span>
              <span style={{ color:'#8a8680' }}>Personnes</span><span style={{ fontWeight:500 }}>{booking.guests_count}</span>
              <span style={{ color:'#8a8680' }}>Table</span><span style={{ fontWeight:500 }}>{selectedTable ? `Table ${selectedTable.table_number}` : 'Attribution auto'}</span>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setStep(2)} style={{ padding:'12px 20px', background:'transparent', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#6b6760', cursor:'pointer', fontSize:'14px' }}>← Retour</button>
              <button onClick={handleSubmit} disabled={!client.name || submitting} style={btnStyle(!!client.name && !submitting)}>{submitting ? 'Envoi...' : 'Confirmer →'}</button>
            </div>
          </div>
        )}
      </div>
      <footer style={{ padding:'20px 32px', borderTop:'1px solid #e8e6e1', background:'#fff', display:'flex', justifyContent:'center' }}>
        <p style={{ fontSize:'11px', color:'#b0aca6', margin:0 }}>Propulsé par <a href="https://nexlyhub.com" target="_blank" rel="noopener" style={{ color:'#8a8680' }}>Nexly Hub</a></p>
      </footer>
    </main>
  )
}
