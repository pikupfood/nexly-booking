'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, getTenantBySlug } from '@/lib/supabase'

const IS: any = { width:'100%', padding:'11px 14px', background:'#fff', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#1a1a1a', fontSize:'14px', outline:'none', boxSizing:'border-box' }
const LS: any = { display:'block', fontSize:'12px', fontWeight:500, color:'#6b6760', marginBottom:'6px' }

export default function HotelBookingPage() {
  const { slug } = useParams() as { slug: string }
  const [tenant, setTenant] = useState<any>(null)
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedType, setSelectedType] = useState<any>(null)
  const [dates, setDates] = useState({ check_in: '', check_out: '' })
  const [guests, setGuests] = useState({ adults: 1, children: 0 })
  const [client, setClient] = useState({ first_name: '', last_name: '', email: '', phone: '', requests: '' })
  const [bookingRef, setBookingRef] = useState('')

  useEffect(() => {
    getTenantBySlug(slug).then(t => {
      if (!t) return
      setTenant(t)
      supabase.from('room_types').select('*').eq('tenant_id', t.id).eq('is_active', true).order('base_price').then(({ data }) => setRoomTypes(data || []))
    })
  }, [slug])

  const nights = dates.check_in && dates.check_out
    ? Math.round((new Date(dates.check_out).getTime() - new Date(dates.check_in).getTime()) / 86400000) : 0
  const total = selectedType ? nights * selectedType.base_price : 0

  const handleSubmit = async () => {
    if (!tenant) return
    setSubmitting(true)
    const { data: resNumber, error } = await supabase.rpc('booking_create_hotel_reservation', {
      p_tenant_id: tenant.id,
      p_first_name: client.first_name, p_last_name: client.last_name,
      p_email: client.email, p_phone: client.phone || '',
      p_room_type_id: selectedType.id,
      p_check_in: dates.check_in, p_check_out: dates.check_out,
      p_adults: guests.adults, p_children: guests.children,
      p_total_price: total, p_special_requests: client.requests || null,
    })
    if (error) { alert('Erreur: ' + error.message); setSubmitting(false); return }
    setBookingRef(resNumber || ''); setSuccess(true)
    setSubmitting(false)
  }

  if (!tenant) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafaf9' }}><span style={{ color:'#8a8680' }}>Chargement...</span></div>

  if (success) return (
    <main style={{ minHeight:'100vh', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ textAlign:'center', maxWidth:'400px' }}>
        <div style={{ width:'56px', height:'56px', background:'#1a1a1a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', margin:'0 auto 24px' }}>✓</div>
        <div style={{ fontFamily:'Georgia,serif', fontSize:'28px', color:'#1a1a1a', marginBottom:'12px' }}>Réservation confirmée</div>
        <div style={{ fontSize:'14px', color:'#6b6760', marginBottom:'28px' }}>{selectedType?.name} · {nights} nuit{nights>1?'s':''} · {dates.check_in} → {dates.check_out}</div>
        {bookingRef && <div style={{ background:'#fff', border:'1px solid #e8e6e1', borderRadius:'10px', padding:'16px', marginBottom:'24px' }}>
          <div style={{ fontSize:'11px', color:'#9a9690', marginBottom:'6px', fontWeight:500 }}>RÉFÉRENCE</div>
          <div style={{ fontFamily:'Georgia,serif', fontSize:'20px', color:'#1a1a1a' }}>{bookingRef}</div>
        </div>}
        <div style={{ fontSize:'13px', color:'#8a8680', marginBottom:'24px' }}>Vous recevrez une confirmation par email.</div>
        <Link href={`/${slug}`} style={{ display:'inline-block', padding:'12px 28px', background:'#1a1a1a', color:'#fff', borderRadius:'8px', fontSize:'14px', textDecoration:'none' }}>← Retour à l'accueil</Link>
        <div style={{ marginTop:'32px', fontSize:'11px', color:'#c0bdb8' }}>Propulsé par <a href="https://nexlyhub.com" target="_blank" rel="noopener" style={{ color:'#9a9690' }}>Nexly Hub</a></div>
      </div>
    </main>
  )

  const STEPS = ['Chambre', 'Dates', 'Coordonnées']
  const btnStyle = (active: boolean) => ({ padding:'12px', background: active ? '#1a1a1a' : '#e8e6e1', color: active ? '#fff' : '#9a9690', border:'none', borderRadius:'8px', cursor: active ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:500, flex:1 as any })

  return (
    <main style={{ minHeight:'100vh', background:'#fafaf9' }}>
      <nav style={{ background:'#fff', borderBottom:'1px solid #e8e6e1', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:50 }}>
        <Link href={`/${slug}`} style={{ fontSize:'13px', color:'#8a8680', textDecoration:'none' }}>← {tenant.business_name}</Link>
        <span style={{ color:'#d8d5d0' }}>|</span>
        <span style={{ fontFamily:'Georgia,serif', fontSize:'15px', color:'#1a1a1a' }}>Hébergement</span>
      </nav>
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'40px 24px 80px' }}>
        {/* Steps */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:'36px' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', flex:1 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                <div style={{ width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:500, background: step > i+1 ? '#1a1a1a' : 'transparent', color: step > i+1 ? '#fff' : step === i+1 ? '#1a1a1a' : '#c0bdb8', border:`1.5px solid ${step >= i+1 ? '#1a1a1a' : '#d8d5d0'}` }}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <div style={{ fontSize:'11px', color: step === i+1 ? '#1a1a1a' : '#9a9690', marginTop:'4px', fontWeight: step === i+1 ? 500 : 400 }}>{s}</div>
              </div>
              {i < STEPS.length-1 && <div style={{ flex:1, height:'1px', background: step > i+1 ? '#1a1a1a' : '#e8e6e1', marginBottom:'18px' }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Choisissez votre chambre</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'28px' }}>
              {roomTypes.map(rt => (
                <div key={rt.id} onClick={() => setSelectedType(rt)} style={{ padding:'18px 20px', borderRadius:'10px', cursor:'pointer', background:'#fff', border:`1.5px solid ${selectedType?.id === rt.id ? '#1a1a1a' : '#e8e6e1'}`, transition:'border-color 0.15s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:'17px', color:'#1a1a1a', marginBottom:'4px' }}>{rt.name}</div>
                      <div style={{ fontSize:'12px', color:'#8a8680' }}>max {rt.max_occupancy} pers.{rt.size_sqm ? ` · ${rt.size_sqm}m²` : ''}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, marginLeft:'16px' }}>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', color:'#1a1a1a' }}>€{rt.base_price}</div>
                      <div style={{ fontSize:'11px', color:'#9a9690' }}>/ nuit</div>
                    </div>
                  </div>
                </div>
              ))}
              {roomTypes.length === 0 && <div style={{ color:'#9a9690', fontSize:'14px', textAlign:'center', padding:'24px' }}>Aucune chambre disponible</div>}
            </div>
            <button onClick={() => setStep(2)} disabled={!selectedType} style={btnStyle(!!selectedType)}>Continuer →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Dates de séjour</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div><label style={LS}>Arrivée</label><input style={IS} type="date" value={dates.check_in} min={new Date().toISOString().split('T')[0]} onChange={e => setDates(p => ({ ...p, check_in: e.target.value }))} /></div>
              <div><label style={LS}>Départ</label><input style={IS} type="date" value={dates.check_out} min={dates.check_in || new Date().toISOString().split('T')[0]} onChange={e => setDates(p => ({ ...p, check_out: e.target.value }))} /></div>
              <div><label style={LS}>Adultes</label><input style={IS} type="number" min="1" max="6" value={guests.adults} onChange={e => setGuests(p => ({ ...p, adults: parseInt(e.target.value)||1 }))} /></div>
              <div><label style={LS}>Enfants</label><input style={IS} type="number" min="0" max="6" value={guests.children} onChange={e => setGuests(p => ({ ...p, children: parseInt(e.target.value)||0 }))} /></div>
            </div>
            {nights > 0 && <div style={{ background:'#fff', border:'1px solid #e8e6e1', borderRadius:'10px', padding:'14px 18px', marginBottom:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'13px', color:'#6b6760' }}>{selectedType?.name} · {nights} nuit{nights>1?'s':''}</div>
              <div style={{ fontFamily:'Georgia,serif', fontSize:'20px', color:'#1a1a1a' }}>€{total.toFixed(2)}</div>
            </div>}
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setStep(1)} style={{ padding:'12px 20px', background:'transparent', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#6b6760', cursor:'pointer', fontSize:'14px' }}>← Retour</button>
              <button onClick={() => setStep(3)} disabled={!dates.check_in || !dates.check_out || nights <= 0} style={btnStyle(!!dates.check_in && !!dates.check_out && nights > 0)}>Continuer →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'24px' }}>Vos coordonnées</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div><label style={LS}>Prénom *</label><input style={IS} value={client.first_name} onChange={e => setClient(p => ({ ...p, first_name: e.target.value }))} placeholder="Jean" /></div>
              <div><label style={LS}>Nom *</label><input style={IS} value={client.last_name} onChange={e => setClient(p => ({ ...p, last_name: e.target.value }))} placeholder="Dupont" /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={LS}>Email *</label><input style={IS} type="email" value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label style={LS}>Téléphone</label><input style={IS} value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={LS}>Demandes spéciales</label>
              <textarea style={{ ...IS, height:'75px', resize:'vertical' as any }} value={client.requests} onChange={e => setClient(p => ({ ...p, requests: e.target.value }))} placeholder="Heure d'arrivée, préférences..." />
            </div>
            <div style={{ background:'#f5f5f3', borderRadius:'10px', padding:'16px 18px', marginBottom:'20px', fontSize:'13px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'6px 16px' }}>
                <span style={{ color:'#8a8680' }}>Chambre</span><span style={{ fontWeight:500 }}>{selectedType?.name}</span>
                <span style={{ color:'#8a8680' }}>Arrivée</span><span style={{ fontWeight:500 }}>{dates.check_in}</span>
                <span style={{ color:'#8a8680' }}>Départ</span><span style={{ fontWeight:500 }}>{dates.check_out}</span>
                <span style={{ fontWeight:600 }}>Total</span><span style={{ fontFamily:'Georgia,serif', fontSize:'18px' }}>€{total.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setStep(2)} style={{ padding:'12px 20px', background:'transparent', border:'1px solid #d8d5d0', borderRadius:'8px', color:'#6b6760', cursor:'pointer', fontSize:'14px' }}>← Retour</button>
              <button onClick={handleSubmit} disabled={!client.first_name || !client.last_name || !client.email || submitting} style={btnStyle(!!client.first_name && !!client.last_name && !!client.email && !submitting)}>
                {submitting ? 'Envoi...' : 'Confirmer →'}
              </button>
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
