'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageWrapper, Steps, SectionH, NavBtns, ConfirmBox, Row, SuccessPage } from '../hotel/page'

const IS: any = { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d8d5d0', borderRadius: '8px', color: '#1a1a1a', fontSize: '14px', fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' }
const LS: any = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b6760', marginBottom: '6px' }
const STARTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30']
const DURATIONS = [{ label: '1h', value: 60 }, { label: '1h30', value: 90 }, { label: '2h', value: 120 }]

function addMin(t: string, m: number) {
  const [h, mn] = t.split(':').map(Number)
  const tot = h * 60 + mn + m
  return `${String(Math.floor(tot / 60)).padStart(2,'0')}:${String(tot % 60).padStart(2,'0')}`
}

export default function PadelPage() {
  const [courts, setCourts] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [booking, setBooking] = useState({ date: '', start_time: '10:00', duration: 90, players_count: 4 })
  const [client, setClient] = useState({ name: '', phone: '', email: '' })

  useEffect(() => { supabase.from('padel_courts').select('*').eq('is_active', true).order('name').then(({ data }) => setCourts(data || [])) }, [])

  const endTime = booking.start_time ? addMin(booking.start_time, booking.duration) : ''
  const price = selectedCourt ? (booking.duration / 60) * selectedCourt.price_per_hour : 0

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data } = await supabase.from('padel_bookings').insert([{ court_id: selectedCourt.id, player_name: client.name, player_phone: client.phone || null, player_email: client.email || null, date: booking.date, start_time: booking.start_time, end_time: endTime, players_count: booking.players_count, price, status: 'confirmed' }]).select().single()
    if (data) { setBookingRef(data.booking_number || ''); setSuccess(true) }
    setSubmitting(false)
  }

  if (success) return <SuccessPage bookingRef={bookingRef} info={`${selectedCourt?.name} · ${booking.date} · ${booking.start_time}–${endTime} · €${price.toFixed(2)}`} />

  const Chip = ({ label, active, onClick }: any) => (
    <button onClick={onClick} style={{ padding: '9px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', system-ui, sans-serif", background: active ? '#1a1a1a' : '#fff', border: `1px solid ${active ? '#1a1a1a' : '#d8d5d0'}`, color: active ? '#fff' : '#6b6760', transition: 'all 0.15s' }}>{label}</button>
  )

  return (
    <PageWrapper title="Padel" subtitle="Réservation de terrain" back="/">
      <Steps current={step} steps={['Terrain', 'Créneau', 'Coordonnées']} />

      {step === 1 && (
        <div className="anim-fadeup">
          <SectionH>Choisissez votre terrain</SectionH>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {courts.map(c => (
              <div key={c.id} onClick={() => setSelectedCourt(c)} style={{ padding: '18px 20px', borderRadius: '10px', cursor: 'pointer', background: '#fff', border: `1.5px solid ${selectedCourt?.id === c.id ? '#1a1a1a' : '#e8e6e1'}`, transition: 'border-color 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '17px', color: '#1a1a1a', marginBottom: '6px' }}>🎾 {c.name}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#6b6760', background: '#f0ede8', padding: '2px 7px', borderRadius: '4px' }}>{c.type === 'indoor' ? 'Couvert' : 'Découvert'}</span>
                    {c.surface && <span style={{ fontSize: '11px', color: '#6b6760', background: '#f0ede8', padding: '2px 7px', borderRadius: '4px' }}>{c.surface}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '22px', color: '#1a1a1a' }}>€{c.price_per_hour}</div>
                  <div style={{ fontSize: '11px', color: '#9a9690' }}>/ heure</div>
                </div>
              </div>
            ))}
          </div>
          <NavBtns onNext={() => setStep(2)} nextDisabled={!selectedCourt} />
        </div>
      )}

      {step === 2 && (
        <div className="anim-fadeup">
          <SectionH>Date & Créneau</SectionH>
          <div style={{ marginBottom: '18px' }}>
            <label style={LS}>Date *</label>
            <input style={IS} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]} onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={LS}>Durée</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {DURATIONS.map(d => <Chip key={d.value} label={d.label} active={booking.duration === d.value} onClick={() => setBooking(p => ({ ...p, duration: d.value }))} />)}
            </div>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={LS}>Heure de début</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {STARTS.map(t => <Chip key={t} label={t} active={booking.start_time === t} onClick={() => setBooking(p => ({ ...p, start_time: t }))} />)}
            </div>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={LS}>Nombre de joueurs</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[2, 3, 4].map(n => <Chip key={n} label={`${n} joueurs`} active={booking.players_count === n} onClick={() => setBooking(p => ({ ...p, players_count: n }))} />)}
            </div>
          </div>
          {booking.date && (
            <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', color: '#6b6760' }}>{selectedCourt?.name} · {booking.start_time}–{endTime}</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#1a1a1a' }}>€{price.toFixed(2)}</div>
            </div>
          )}
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
          </div>
          <ConfirmBox>
            <Row label="Terrain" value={selectedCourt?.name} />
            <Row label="Date" value={booking.date} />
            <Row label="Créneau" value={`${booking.start_time}–${endTime}`} />
            <Row label="Joueurs" value={`${booking.players_count}`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ fontWeight: 500, color: '#1a1a1a' }}>Total</span>
              <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#1a1a1a' }}>€{price.toFixed(2)}</span>
            </div>
          </ConfirmBox>
          <NavBtns onBack={() => setStep(2)} onNext={handleSubmit} nextLabel={submitting ? 'Envoi...' : 'Confirmer'} nextDisabled={!client.name || submitting} />
        </div>
      )}
    </PageWrapper>
  )
}
