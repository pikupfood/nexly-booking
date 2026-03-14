'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageWrapper, Steps, SectionH, NavBtns, ConfirmBox, Row, SuccessPage } from '../hotel/page'
import { TENANT_ID } from '@/lib/supabase'

const IS: any = { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d8d5d0', borderRadius: '8px', color: '#1a1a1a', fontSize: '14px', fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' }
const LS: any = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b6760', marginBottom: '6px' }
const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']
const CAT: Record<string,string> = { massaggio: 'Massages', piscina: 'Piscine', jacuzzi: 'Jacuzzi', viso: 'Visage', corpo: 'Corps', altro: 'Autres' }

export default function SpaPage() {
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [activeCat, setActiveCat] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [booking, setBooking] = useState({ date: '', time: '10:00', staff_id: '' })
  const [client, setClient] = useState({ name: '', phone: '', email: '', notes: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('spa_services').select('*').eq('is_active', true).eq('tenant_id', TENANT_ID).order('sort_order'),
      supabase.from('spa_staff').select('*').eq('is_active', true).eq('tenant_id', TENANT_ID),
    ]).then(([s, st]) => {
      setServices(s.data || [])
      setStaff(st.data || [])
      if (s.data?.[0]) setActiveCat(s.data[0].category)
    })
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data } = await supabase.from('spa_appointments').insert([{ guest_name: client.name, guest_phone: client.phone || null, guest_email: client.email || null, service_id: selected.id, staff_id: booking.staff_id || null, date: booking.date, time: booking.time, price: selected.price, notes: client.notes || null, status: 'confirmed', tenant_id: TENANT_ID }]).select().single()
    if (data) { setBookingRef(data.appointment_number || ''); setSuccess(true) }
    setSubmitting(false)
  }

  if (success) return <SuccessPage bookingRef={bookingRef} info={`${selected?.name} · ${booking.date} à ${booking.time}`} />

  const Chip = ({ label, active, onClick }: any) => (
    <button onClick={onClick} style={{ padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', system-ui, sans-serif", background: active ? '#1a1a1a' : '#fff', border: `1px solid ${active ? '#1a1a1a' : '#d8d5d0'}`, color: active ? '#fff' : '#6b6760', transition: 'all 0.15s' }}>{label}</button>
  )

  const categories = [...new Set(services.map(s => s.category))]
  const catServices = services.filter(s => s.category === activeCat)

  return (
    <PageWrapper title="Spa & Bien-être" subtitle="Réservation de soin" back="/">
      <Steps current={step} steps={['Soin', 'Date & Heure', 'Coordonnées']} />

      {step === 1 && (
        <div className="anim-fadeup">
          <SectionH>Choisissez votre soin</SectionH>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {categories.map(c => <Chip key={c} label={CAT[c] || c} active={activeCat === c} onClick={() => setActiveCat(c)} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {catServices.map(svc => (
              <div key={svc.id} onClick={() => setSelected(svc)} style={{ padding: '18px 20px', borderRadius: '10px', cursor: 'pointer', background: '#fff', border: `1.5px solid ${selected?.id === svc.id ? '#1a1a1a' : '#e8e6e1'}`, transition: 'border-color 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '17px', color: '#1a1a1a', marginBottom: '4px' }}>{svc.name}</div>
                  {svc.description && <div style={{ fontSize: '12px', color: '#8a8680', marginBottom: '4px' }}>{svc.description}</div>}
                  <div style={{ fontSize: '12px', color: '#6b6760' }}>⏱ {svc.duration_minutes} min</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '22px', color: '#1a1a1a' }}>€{svc.price}</div>
                </div>
              </div>
            ))}
          </div>
          <NavBtns onNext={() => setStep(2)} nextDisabled={!selected} />
        </div>
      )}

      {step === 2 && (
        <div className="anim-fadeup">
          <SectionH>Date & Heure</SectionH>
          <div style={{ marginBottom: '18px' }}>
            <label style={LS}>Date *</label>
            <input style={IS} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]} onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={LS}>Créneau horaire</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {TIMES.map(t => (
                <button key={t} onClick={() => setBooking(p => ({ ...p, time: t }))} style={{ padding: '9px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', system-ui, sans-serif", background: booking.time === t ? '#1a1a1a' : '#fff', border: `1px solid ${booking.time === t ? '#1a1a1a' : '#d8d5d0'}`, color: booking.time === t ? '#fff' : '#6b6760', transition: 'all 0.15s' }}>{t}</button>
              ))}
            </div>
          </div>
          {staff.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <label style={LS}>Thérapeute (optionnel)</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[{ id: '', name: 'Sans préférence' }, ...staff].map(s => (
                  <button key={s.id} onClick={() => setBooking(p => ({ ...p, staff_id: s.id }))} style={{ padding: '9px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', system-ui, sans-serif", background: booking.staff_id === s.id ? '#1a1a1a' : '#fff', border: `1px solid ${booking.staff_id === s.id ? '#1a1a1a' : '#d8d5d0'}`, color: booking.staff_id === s.id ? '#fff' : '#6b6760', transition: 'all 0.15s' }}>{s.name}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', color: '#6b6760' }}>{selected?.name} · {selected?.duration_minutes} min</div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#1a1a1a' }}>€{selected?.price}</div>
          </div>
          <NavBtns onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!booking.date} />
        </div>
      )}

      {step === 3 && (
        <div className="anim-fadeup">
          <SectionH>Vos coordonnées</SectionH>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div><label style={LS}>Nom & Prénom *</label><input style={IS} value={client.name} onChange={e => setClient(p => ({ ...p, name: e.target.value }))} placeholder="Jean Dupont" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div><label style={LS}>Email</label><input style={IS} type="email" value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label style={LS}>Téléphone</label><input style={IS} value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div><label style={LS}>Informations utiles</label><textarea style={{ ...IS, height: '75px', resize: 'vertical' }} value={client.notes} onChange={e => setClient(p => ({ ...p, notes: e.target.value }))} placeholder="Allergies, préférences..." /></div>
          </div>
          <ConfirmBox>
            <Row label="Soin" value={selected?.name} />
            <Row label="Date" value={`${booking.date} à ${booking.time}`} />
            <Row label="Durée" value={`${selected?.duration_minutes} minutes`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ fontWeight: 500, color: '#1a1a1a' }}>Tarif</span>
              <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#1a1a1a' }}>€{selected?.price}</span>
            </div>
          </ConfirmBox>
          <NavBtns onBack={() => setStep(2)} onNext={handleSubmit} nextLabel={submitting ? 'Envoi...' : 'Confirmer'} nextDisabled={!client.name || submitting} />
        </div>
      )}
    </PageWrapper>
  )
}
