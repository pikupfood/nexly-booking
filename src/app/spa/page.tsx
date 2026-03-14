'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageLayout, StepIndicator, SectionTitle, NavButtons, SuccessPage } from '../hotel/page'

const inputStyle: any = { width: '100%', padding: '14px 16px', background: '#ffffff08', border: '1px solid #ffffff15', borderRadius: '10px', color: '#f0ece4', fontSize: '14px', fontFamily: "'Jost', sans-serif", fontWeight: 300, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }
const labelStyle: any = { display: 'block', fontSize: '11px', letterSpacing: '0.1em', color: '#ffffff40', marginBottom: '6px', textTransform: 'uppercase' }

const CAT_CFG: Record<string, { label: string; icon: string; color: string }> = {
  massaggio: { label: 'Massages',   icon: '💆', color: '#c4b8d4' },
  piscina:   { label: 'Piscine',    icon: '🏊', color: '#8ba8c4' },
  jacuzzi:   { label: 'Jacuzzi',    icon: '🛁', color: '#7ec8d4' },
  viso:      { label: 'Visage',     icon: '✨', color: '#d4b8c4' },
  corpo:     { label: 'Corps',      icon: '🧖', color: '#d4c4b0' },
  altro:     { label: 'Autres',     icon: '⭐', color: '#b0b0b0' },
}

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']

export default function SpaBookingPage() {
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [activeCat, setActiveCat] = useState('massaggio')

  const [selected, setSelected] = useState<any>(null)
  const [booking, setBooking] = useState({ date: '', time: '10:00', staff_id: '' })
  const [client, setClient] = useState({ name: '', phone: '', email: '', notes: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('spa_services').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('spa_staff').select('*').eq('is_active', true),
    ]).then(([svc, stf]) => {
      setServices(svc.data || [])
      setStaff(stf.data || [])
    })
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    const nameParts = client.name.split(' ')
    const { data } = await supabase.from('spa_appointments').insert([{
      guest_name: client.name,
      guest_phone: client.phone || null,
      guest_email: client.email || null,
      service_id: selected.id,
      staff_id: booking.staff_id || null,
      date: booking.date,
      time: booking.time,
      price: selected.price,
      notes: client.notes || null,
      status: 'confirmed',
    }]).select().single()
    if (data) { setBookingRef(data.appointment_number); setSuccess(true) }
    setSubmitting(false)
  }

  if (success) return <SuccessPage ref={bookingRef} type="spa" info={`${selected?.name} · ${booking.date} à ${booking.time}`} />

  const categories = [...new Set(services.map(s => s.category))]
  const catServices = services.filter(s => s.category === activeCat)

  return (
    <PageLayout title="Spa & Bien-être" subtitle="Réservation de soin" back="/">
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
        <StepIndicator current={step} steps={['Soin', 'Date & Heure', 'Coordonnées']} />

        {step === 1 && (
          <div className="anim-fadeup">
            <SectionTitle>Choisissez votre soin</SectionTitle>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {categories.map(cat => {
                const cfg = CAT_CFG[cat] || CAT_CFG.altro
                return (
                  <button key={cat} onClick={() => setActiveCat(cat)} style={{
                    padding: '8px 16px', borderRadius: '40px', cursor: 'pointer', fontSize: '12px',
                    fontFamily: "'Jost', sans-serif", letterSpacing: '0.06em',
                    background: activeCat === cat ? cfg.color + '20' : 'transparent',
                    border: `1px solid ${activeCat === cat ? cfg.color : '#ffffff15'}`,
                    color: activeCat === cat ? cfg.color : '#ffffff40',
                    transition: 'all 0.2s',
                  }}>{cfg.icon} {cfg.label}</button>
                )
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {catServices.map(svc => {
                const cfg = CAT_CFG[svc.category] || CAT_CFG.altro
                return (
                  <div key={svc.id} onClick={() => setSelected(svc)} style={{
                    padding: '22px 24px', borderRadius: '14px', cursor: 'pointer',
                    background: selected?.id === svc.id ? cfg.color + '10' : '#111116',
                    border: `1px solid ${selected?.id === svc.id ? cfg.color : '#ffffff10'}`,
                    transition: 'all 0.2s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#f0ece4', marginBottom: '4px' }}>{svc.name}</div>
                      {svc.description && <div style={{ fontSize: '12px', color: '#ffffff40', marginBottom: '6px' }}>{svc.description}</div>}
                      <div style={{ fontSize: '11px', color: cfg.color, letterSpacing: '0.06em' }}>⏱ {svc.duration_minutes} minutes</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '20px' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: cfg.color, fontWeight: 400 }}>€{svc.price}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <NavButtons onNext={() => setStep(2)} nextDisabled={!selected} />
          </div>
        )}

        {step === 2 && (
          <div className="anim-fadeup">
            <SectionTitle>Date & Heure</SectionTitle>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Date *</label>
              <input style={inputStyle} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Créneau horaire</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setBooking(p => ({ ...p, time: t }))} style={{
                    padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                    fontFamily: "'Jost', sans-serif",
                    background: booking.time === t ? '#c4b8d420' : 'transparent',
                    border: `1px solid ${booking.time === t ? '#c4b8d4' : '#ffffff15'}`,
                    color: booking.time === t ? '#c4b8d4' : '#ffffff40',
                    transition: 'all 0.2s',
                  }}>{t}</button>
                ))}
              </div>
            </div>
            {staff.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Thérapeute (optionnel)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => setBooking(p => ({ ...p, staff_id: '' }))} style={{
                    padding: '10px 18px', borderRadius: '40px', cursor: 'pointer', fontSize: '13px', fontFamily: "'Jost', sans-serif",
                    background: !booking.staff_id ? '#c4b8d420' : 'transparent', border: `1px solid ${!booking.staff_id ? '#c4b8d4' : '#ffffff15'}`, color: !booking.staff_id ? '#c4b8d4' : '#ffffff40', transition: 'all 0.2s',
                  }}>Au choix</button>
                  {staff.map(s => (
                    <button key={s.id} onClick={() => setBooking(p => ({ ...p, staff_id: s.id }))} style={{
                      padding: '10px 18px', borderRadius: '40px', cursor: 'pointer', fontSize: '13px', fontFamily: "'Jost', sans-serif",
                      background: booking.staff_id === s.id ? '#c4b8d420' : 'transparent', border: `1px solid ${booking.staff_id === s.id ? '#c4b8d4' : '#ffffff15'}`, color: booking.staff_id === s.id ? '#c4b8d4' : '#ffffff40', transition: 'all 0.2s',
                    }}>{s.name}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: '#c4b8d40a', border: '1px solid #c4b8d420', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: '#ffffff50' }}>{selected?.name} · {selected?.duration_minutes} min</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#c4b8d4', fontWeight: 400 }}>€{selected?.price}</div>
            </div>

            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!booking.date} />
          </div>
        )}

        {step === 3 && (
          <div className="anim-fadeup">
            <SectionTitle>Vos coordonnées</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Nom & Prénom *</label>
                <input style={inputStyle} value={client.name} onChange={e => setClient(p => ({ ...p, name: e.target.value }))} placeholder="Jean Dupont" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input style={inputStyle} value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Informations utiles (allergies, préférences...)</label>
                <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} value={client.notes}
                  onChange={e => setClient(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <div style={{ background: '#c4b8d40a', border: '1px solid #c4b8d420', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#c4b8d480', marginBottom: '12px' }}>RÉCAPITULATIF</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#ffffff60' }}>
                <span>Soin</span><span style={{ color: '#f0ece4' }}>{selected?.name}</span>
                <span>Date</span><span style={{ color: '#f0ece4' }}>{booking.date} à {booking.time}</span>
                <span>Durée</span><span style={{ color: '#f0ece4' }}>{selected?.duration_minutes} minutes</span>
                <span style={{ color: '#c4b8d4' }}>Tarif</span><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#c4b8d4' }}>€{selected?.price}</span>
              </div>
            </div>
            <NavButtons onBack={() => setStep(2)} onNext={handleSubmit} nextLabel={submitting ? 'Envoi...' : 'Confirmer'} nextDisabled={!client.name || submitting} nextGold />
          </div>
        )}
      </div>
    </PageLayout>
  )
}
