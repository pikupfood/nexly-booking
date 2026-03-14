'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, getTenantBySlug } from '@/lib/supabase'

const IS: any = { width:'100%', padding:'11px 14px', background:'#fff', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#1a1a1a', fontSize:'14px', outline:'none', boxSizing:'border-box' }
const LS: any = { display:'block', fontSize:'12px', fontWeight:500, color:'#6b6760', marginBottom:'6px' }
const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']
const CAT: Record<string,string> = { massaggio:'Massages', piscina:'Piscine', jacuzzi:'Jacuzzi', viso:'Visage', corpo:'Corps', altro:'Autres' }

export default function SpaBookingPage() {
  const { slug } = useParams() as { slug: string }
  const [tenant, setTenant] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [activeCat, setActiveCat] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [booking, setBooking] = useState({ date: '', time: '10:00', staff_id: '' })
  const [client, setClient] = useState({ name: '', phone: '', email: '', notes: '' })
  const [bookingRef, setBookingRef] = useState('')

  useEffect(() => {
    getTenantBySlug(slug).then(t => {
      if (!t) return
      setTenant(t)
      Promise.all([
        supabase.from('spa_services').select('*').eq('tenant_id', t.id).eq('is_active', true).order('sort_order'),
        supabase.from('spa_staff').select('*').eq('tenant_id', t.id).eq('is_active', true),
      ]).then(([s, st]) => {
        setServices(s.data || [])
        setStaff(st.data || [])
        if (s.data?.[0]) setActiveCat(s.data[0].category)
      })
    })
  }, [slug])

  const handleSubmit = async () => {
    if (!tenant) return
    setSubmitting(true)
    const { data } = await supabase.from('spa_appointments').insert([{
      guest_name: client.name, guest_phone: client.phone || null, guest_email: client.email || null,
      service_id: selected.id, staff_id: booking.staff_id || null,
      date: booking.date, time: booking.time, price: selected.price,
      notes: client.notes || null, status: 'confirmed', tenant_id: tenant.id,
    }]).select().single()
    if (data) { setBookingRef(data.appointment_number || ''); setSuccess(true) }
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
        <div style={{ fontFamily:'Georgia,serif', fontSize:'28px', marginBottom:'12px' }}>Soin confirmé</div>
        <div style={{ fontSize:'14px', color:'#6b6760', marginBottom:'28px' }}>{selected?.name} · {booking.date} à {booking.time}</div>
        {bookingRef && <div style={{ background:'#fff', border:'1px solid #e8e6e1', borderRadius:'10px', padding:'16px', marginBottom:'24px' }}><div style={{ fontSize:'11px', color:'#9a9690', marginBottom:'6px', fontWeight:500 }}>RÉFÉRENCE</div><div style={{ fontFamily:'Georgia,serif', fontSize:'20px' }}>{bookingRef}</div></div>}
        <Link href={`/${slug}`} style={{ display:'inline-block', padding:'12px 28px', background:'#1a1a1a', color:'#fff', borderRadius:'8px', fontSize:'14px', textDecoration:'none' }}>← Retour</Link>
      </div>
    </main>
  )

  const btnStyle = (active: boolean) => ({ padding:'12px', background: active ? '#1a1a1a' : '#e8e6e1', color: active ? '#fff' : '#9a9690', border:'none', borderRadius:'8px', cursor: active ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:500, flex:1 as any })
  const categories = [...new Set(services.map(s => s.category))]
  const catServices = services.filter(s => s.category === activeCat)

  return (
    <main style={{ minHeight:'100vh', background:'#fafaf9' }}>
      <nav style={{ background:'#fff', borderBottom:'1px solid #e8e6e1', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:50 }}>
        <Link href={`/${slug}`} style={{ fontSize:'13px', color:'#8a8680', textDecoration:'none' }}>← {tenant.business_name}</Link>
        <span style={{ color:'#d8d5d0' }}>|</span>
        <span style={{ fontFamily:'Georgia,serif', fontSize:'15px', color:'#1a1a1a' }}>Spa & Bien-être</span>
      </nav>
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'40px 24px 80px' }}>

        {step === 1 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Choisissez votre soin</div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
              {categories.map(c => <Chip key={c} label={CAT[c]||c} active={activeCat===c} onClick={() => setActiveCat(c)} />)}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'28px' }}>
              {catServices.map(svc => (
                <div key={svc.id} onClick={() => setSelected(svc)} style={{ padding:'18px 20px', borderRadius:'10px', cursor:'pointer', background:'#fff', border:`1.5px solid ${selected?.id===svc.id ? '#1a1a1a' : '#e8e6e1'}`, transition:'border-color 0.15s', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div><div style={{ fontFamily:'Georgia,serif', fontSize:'17px', marginBottom:'4px' }}>{svc.name}</div>{svc.description && <div style={{ fontSize:'12px', color:'#8a8680', marginBottom:'4px' }}>{svc.description}</div>}<div style={{ fontSize:'12px', color:'#6b6760' }}>⏱ {svc.duration_minutes} min</div></div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', flexShrink:0, marginLeft:'16px' }}>€{svc.price}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!selected} style={btnStyle(!!selected)}>Continuer →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Date & Heure</div>
            <div style={{ marginBottom:'18px' }}><label style={LS}>Date *</label><input style={IS} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]} onChange={e => setBooking(p=>({...p,date:e.target.value}))} /></div>
            <div style={{ marginBottom:'18px' }}>
              <label style={LS}>Créneau horaire</label>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>{TIMES.map(t => <Chip key={t} label={t} active={booking.time===t} onClick={() => setBooking(p=>({...p,time:t}))} />)}</div>
            </div>
            {staff.length > 0 && <div style={{ marginBottom:'18px' }}>
              <label style={LS}>Thérapeute (optionnel)</label>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[{ id:'', name:'Sans préférence' }, ...staff].map(s => <Chip key={s.id} label={s.name} active={booking.staff_id===s.id} onClick={() => setBooking(p=>({...p,staff_id:s.id}))} />)}
              </div>
            </div>}
            <div style={{ background:'#fff', border:'1px solid #e8e6e1', borderRadius:'10px', padding:'14px 18px', marginBottom:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'13px', color:'#6b6760' }}>{selected?.name} · {selected?.duration_minutes} min</div>
              <div style={{ fontFamily:'Georgia,serif', fontSize:'20px' }}>€{selected?.price}</div>
            </div>
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
              <div><label style={LS}>Informations utiles</label><textarea style={{ ...IS, height:'75px', resize:'vertical' as any }} value={client.notes} onChange={e => setClient(p=>({...p,notes:e.target.value}))} placeholder="Allergies, préférences..." /></div>
            </div>
            <div style={{ background:'#f5f5f3', borderRadius:'10px', padding:'16px 18px', marginBottom:'20px', fontSize:'13px', display:'grid', gridTemplateColumns:'auto 1fr', gap:'6px 16px' }}>
              <span style={{ color:'#8a8680' }}>Soin</span><span style={{ fontWeight:500 }}>{selected?.name}</span>
              <span style={{ color:'#8a8680' }}>Date</span><span style={{ fontWeight:500 }}>{booking.date} à {booking.time}</span>
              <span style={{ color:'#8a8680' }}>Durée</span><span style={{ fontWeight:500 }}>{selected?.duration_minutes} minutes</span>
              <span style={{ fontWeight:600 }}>Tarif</span><span style={{ fontFamily:'Georgia,serif', fontSize:'18px' }}>€{selected?.price}</span>
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
