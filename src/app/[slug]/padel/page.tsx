'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, getTenantBySlug } from '@/lib/supabase'

const IS: any = { width:'100%', padding:'11px 14px', background:'#fff', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#1a1a1a', fontSize:'14px', outline:'none', boxSizing:'border-box' }
const LS: any = { display:'block', fontSize:'12px', fontWeight:500, color:'#6b6760', marginBottom:'6px' }
const STARTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30']
const DURATIONS = [{ label:'1h', value:60 }, { label:'1h30', value:90 }, { label:'2h', value:120 }]
const addMin = (t: string, m: number) => { const [h, mn] = t.split(':').map(Number); const tot = h*60+mn+m; return `${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}` }

export default function PadelBookingPage() {
  const { slug } = useParams() as { slug: string }
  const [tenant, setTenant] = useState<any>(null)
  const [courts, setCourts] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [booking, setBooking] = useState({ date: '', start_time: '10:00', duration: 90, players_count: 4 })
  const [client, setClient] = useState({ name: '', phone: '', email: '' })
  const [bookingRef, setBookingRef] = useState('')

  useEffect(() => {
    getTenantBySlug(slug).then(t => {
      if (!t) return
      setTenant(t)
      supabase.from('padel_courts').select('*').eq('tenant_id', t.id).eq('is_active', true).order('name').then(({ data }) => setCourts(data || []))
    })
  }, [slug])

  const endTime = booking.start_time ? addMin(booking.start_time, booking.duration) : ''
  const price = selectedCourt ? (booking.duration/60) * selectedCourt.price_per_hour : 0

  const handleSubmit = async () => {
    if (!tenant) return
    setSubmitting(true)
    const { data, error } = await supabase.rpc('booking_create_padel_booking', {
      p_tenant_id: tenant.id,
      p_court_id: selectedCourt.id, p_player_name: client.name,
      p_player_phone: client.phone || null, p_player_email: client.email || null,
      p_date: booking.date, p_start_time: booking.start_time, p_end_time: endTime,
      p_players_count: booking.players_count, p_price: price,
    })
    if (error) { alert('Erreur: ' + error.message); setSubmitting(false); return }
    setBookingRef(''); setSuccess(true)
    setSubmitting(false)
  }

  const Chip = ({ label, active, onClick }: any) => (
    <button onClick={onClick} style={{ padding:'9px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px', background: active ? '#1a1a1a' : '#fff', border:`1px solid ${active ? '#1a1a1a' : '#d8d5d0'}`, color: active ? '#fff' : '#6b6760', transition:'all 0.15s' }}>{label}</button>
  )

  if (!tenant) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafaf9' }}><span style={{ color:'#8a8680' }}>Chargement...</span></div>

  if (success) return (
    <main style={{ minHeight:'100vh', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ textAlign:'center', maxWidth:'400px' }}>
        <div style={{ width:'56px', height:'56px', background:'#1a1a1a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', margin:'0 auto 24px' }}>✓</div>
        <div style={{ fontFamily:'Georgia,serif', fontSize:'28px', marginBottom:'12px' }}>Terrain réservé</div>
        <div style={{ fontSize:'14px', color:'#6b6760', marginBottom:'28px' }}>{selectedCourt?.name} · {booking.date} · {booking.start_time}–{endTime} · €{price.toFixed(2)}</div>
        {bookingRef && <div style={{ background:'#fff', border:'1px solid #e8e6e1', borderRadius:'10px', padding:'16px', marginBottom:'24px' }}><div style={{ fontSize:'11px', color:'#9a9690', marginBottom:'6px', fontWeight:500 }}>RÉFÉRENCE</div><div style={{ fontFamily:'Georgia,serif', fontSize:'20px' }}>{bookingRef}</div></div>}
        <Link href={`/${slug}`} style={{ display:'inline-block', padding:'12px 28px', background:'#1a1a1a', color:'#fff', borderRadius:'8px', fontSize:'14px', textDecoration:'none' }}>← Retour</Link>
      </div>
    </main>
  )

  const btnStyle = (active: boolean) => ({ padding:'12px', background: active ? '#1a1a1a' : '#e8e6e1', color: active ? '#fff' : '#9a9690', border:'none', borderRadius:'8px', cursor: active ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:500, flex:1 as any })

  return (
    <main style={{ minHeight:'100vh', background:'#fafaf9' }}>
      <nav style={{ background:'#fff', borderBottom:'1px solid #e8e6e1', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:50 }}>
        <Link href={`/${slug}`} style={{ fontSize:'13px', color:'#8a8680', textDecoration:'none' }}>← {tenant.business_name}</Link>
        <span style={{ color:'#d8d5d0' }}>|</span>
        <span style={{ fontFamily:'Georgia,serif', fontSize:'15px', color:'#1a1a1a' }}>Padel</span>
      </nav>
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'40px 24px 80px' }}>

        {step === 1 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Choisissez votre terrain</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'28px' }}>
              {courts.map(c => (
                <div key={c.id} onClick={() => setSelectedCourt(c)} style={{ padding:'18px 20px', borderRadius:'10px', cursor:'pointer', background:'#fff', border:`1.5px solid ${selectedCourt?.id===c.id ? '#1a1a1a' : '#e8e6e1'}`, transition:'border-color 0.15s', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontFamily:'Georgia,serif', fontSize:'17px', marginBottom:'6px' }}>🎾 {c.name}</div>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <span style={{ fontSize:'11px', color:'#6b6760', background:'#f0ede8', padding:'2px 7px', borderRadius:'4px' }}>{c.type==='indoor'?'Couvert':'Découvert'}</span>
                      {c.surface && <span style={{ fontSize:'11px', color:'#6b6760', background:'#f0ede8', padding:'2px 7px', borderRadius:'4px' }}>{c.surface}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, marginLeft:'16px' }}>
                    <div style={{ fontFamily:'Georgia,serif', fontSize:'22px' }}>€{c.price_per_hour}</div>
                    <div style={{ fontSize:'11px', color:'#9a9690' }}>/ heure</div>
                  </div>
                </div>
              ))}
              {courts.length === 0 && <div style={{ color:'#9a9690', fontSize:'14px', textAlign:'center', padding:'24px' }}>Aucun terrain disponible</div>}
            </div>
            <button onClick={() => setStep(2)} disabled={!selectedCourt} style={btnStyle(!!selectedCourt)}>Continuer →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Date & Créneau</div>
            <div style={{ marginBottom:'18px' }}><label style={LS}>Date *</label><input style={IS} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]} onChange={e => setBooking(p=>({...p,date:e.target.value}))} /></div>
            <div style={{ marginBottom:'18px' }}>
              <label style={LS}>Durée</label>
              <div style={{ display:'flex', gap:'8px' }}>{DURATIONS.map(d => <Chip key={d.value} label={d.label} active={booking.duration===d.value} onClick={() => setBooking(p=>({...p,duration:d.value}))} />)}</div>
            </div>
            <div style={{ marginBottom:'18px' }}>
              <label style={LS}>Heure de début</label>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>{STARTS.map(t => <Chip key={t} label={t} active={booking.start_time===t} onClick={() => setBooking(p=>({...p,start_time:t}))} />)}</div>
            </div>
            <div style={{ marginBottom:'18px' }}>
              <label style={LS}>Joueurs</label>
              <div style={{ display:'flex', gap:'8px' }}>{[2,3,4].map(n => <Chip key={n} label={`${n} joueurs`} active={booking.players_count===n} onClick={() => setBooking(p=>({...p,players_count:n}))} />)}</div>
            </div>
            {booking.date && <div style={{ background:'#fff', border:'1px solid #e8e6e1', borderRadius:'10px', padding:'14px 18px', marginBottom:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'13px', color:'#6b6760' }}>{selectedCourt?.name} · {booking.start_time}–{endTime}</div>
              <div style={{ fontFamily:'Georgia,serif', fontSize:'20px' }}>€{price.toFixed(2)}</div>
            </div>}
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setStep(1)} style={{ padding:'12px 20px', background:'transparent', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#6b6760', cursor:'pointer', fontSize:'14px' }}>← Retour</button>
              <button onClick={() => setStep(3)} disabled={!booking.date} style={btnStyle(!!booking.date)}>Continuer →</button>
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
              <span style={{ color:'#8a8680' }}>Terrain</span><span style={{ fontWeight:500 }}>{selectedCourt?.name}</span>
              <span style={{ color:'#8a8680' }}>Date</span><span style={{ fontWeight:500 }}>{booking.date}</span>
              <span style={{ color:'#8a8680' }}>Créneau</span><span style={{ fontWeight:500 }}>{booking.start_time}–{endTime}</span>
              <span style={{ fontWeight:600 }}>Total</span><span style={{ fontFamily:'Georgia,serif', fontSize:'18px' }}>€{price.toFixed(2)}</span>
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
