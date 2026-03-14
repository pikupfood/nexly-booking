'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageLayout, StepIndicator, SectionTitle, NavButtons, SuccessPage } from '../hotel/page'

const inputStyle: any = { width: '100%', padding: '14px 16px', background: '#ffffff08', border: '1px solid #ffffff15', borderRadius: '10px', color: '#f0ece4', fontSize: '14px', fontFamily: "'Jost', sans-serif", fontWeight: 300, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }
const labelStyle: any = { display: 'block', fontSize: '11px', letterSpacing: '0.1em', color: '#ffffff40', marginBottom: '6px', textTransform: 'uppercase' }

const START_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30']
const DURATIONS = [{ label: '1h', value: 60 }, { label: '1h30', value: 90 }, { label: '2h', value: 120 }]

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
}

export default function PadelBookingPage() {
  const [courts, setCourts] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [booking, setBooking] = useState({ date: '', start_time: '10:00', duration: 90, players_count: 4, notes: '' })
  const [client, setClient] = useState({ name: '', phone: '', email: '' })

  useEffect(() => {
    supabase.from('padel_courts').select('*').eq('is_active', true).order('name').then(({ data }) => setCourts(data || []))
  }, [])

  const endTime = booking.start_time ? addMinutes(booking.start_time, booking.duration) : ''
  const hours = booking.duration / 60
  const price = selectedCourt ? hours * selectedCourt.price_per_hour : 0

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data } = await supabase.from('padel_bookings').insert([{
      court_id: selectedCourt.id,
      player_name: client.name,
      player_phone: client.phone || null,
      player_email: client.email || null,
      date: booking.date,
      start_time: booking.start_time,
      end_time: endTime,
      players_count: booking.players_count,
      price,
      notes: booking.notes || null,
      status: 'confirmed',
    }]).select().single()
    if (data) { setBookingRef(data.booking_number); setSuccess(true) }
    setSubmitting(false)
  }

  if (success) return <SuccessPage bookingRef={bookingRef} type="padel" info={`${selectedCourt?.name} · ${booking.date} · ${booking.start_time}-${endTime} · €${price.toFixed(2)}`} />

  return (
    <PageLayout title="Padel" subtitle="Réservation de terrain" back="/">
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
        <StepIndicator current={step} steps={['Terrain', 'Créneau', 'Coordonnées']} />

        {step === 1 && (
          <div className="anim-fadeup">
            <SectionTitle>Choisissez votre terrain</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {courts.map(c => (
                <div key={c.id} onClick={() => setSelectedCourt(c)} style={{
                  padding: '24px', borderRadius: '16px', cursor: 'pointer',
                  background: selectedCourt?.id === c.id ? '#c9a96e12' : '#111116',
                  border: `1px solid ${selectedCourt?.id === c.id ? '#c9a96e' : '#ffffff10'}`,
                  transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#f0ece4', marginBottom: '6px' }}>
                      🎾 {c.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#c9a96e80', background: '#c9a96e10', padding: '2px 8px', borderRadius: '20px' }}>
                        {c.type === 'indoor' ? '🏠 Couvert' : '☀️ Découvert'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#ffffff40', background: '#ffffff08', padding: '2px 8px', borderRadius: '20px' }}>
                        {c.surface}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '20px' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: '#c9a96e', fontWeight: 400 }}>€{c.price_per_hour}</div>
                    <div style={{ fontSize: '11px', color: '#ffffff30' }}>par heure</div>
                  </div>
                </div>
              ))}
            </div>
            <NavButtons onNext={() => setStep(2)} nextDisabled={!selectedCourt} />
          </div>
        )}

        {step === 2 && (
          <div className="anim-fadeup">
            <SectionTitle>Date & Créneau</SectionTitle>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Date *</label>
              <input style={inputStyle} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Durée</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {DURATIONS.map(d => (
                  <button key={d.value} onClick={() => setBooking(p => ({ ...p, duration: d.value }))} style={{
                    flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                    fontFamily: "'Jost', sans-serif", fontWeight: booking.duration === d.value ? 500 : 300,
                    background: booking.duration === d.value ? '#c9a96e20' : 'transparent',
                    border: `1px solid ${booking.duration === d.value ? '#c9a96e' : '#ffffff15'}`,
                    color: booking.duration === d.value ? '#c9a96e' : '#ffffff40',
                    transition: 'all 0.2s',
                  }}>{d.label}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Heure de début</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {START_SLOTS.map(t => (
                  <button key={t} onClick={() => setBooking(p => ({ ...p, start_time: t }))} style={{
                    padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                    fontFamily: "'Jost', sans-serif",
                    background: booking.start_time === t ? '#c9a96e20' : 'transparent',
                    border: `1px solid ${booking.start_time === t ? '#c9a96e' : '#ffffff12'}`,
                    color: booking.start_time === t ? '#c9a96e' : '#ffffff35',
                    transition: 'all 0.2s',
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Nombre de joueurs</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => setBooking(p => ({ ...p, players_count: n }))} style={{
                    flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px',
                    fontFamily: "'Cormorant Garamond', serif",
                    background: booking.players_count === n ? '#c9a96e20' : 'transparent',
                    border: `1px solid ${booking.players_count === n ? '#c9a96e' : '#ffffff12'}`,
                    color: booking.players_count === n ? '#c9a96e' : '#ffffff30',
                    transition: 'all 0.2s',
                  }}>{n} joueurs</button>
                ))}
              </div>
            </div>

            {booking.date && (
              <div style={{ background: '#c9a96e0a', border: '1px solid #c9a96e20', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: '#ffffff50' }}>
                  {selectedCourt?.name} · {booking.start_time}–{endTime} · {booking.players_count} joueurs
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#c9a96e', fontWeight: 400 }}>€{price.toFixed(2)}</div>
              </div>
            )}
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
            </div>

            <div style={{ background: '#c9a96e0a', border: '1px solid #c9a96e20', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#c9a96e80', marginBottom: '12px' }}>RÉCAPITULATIF</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#ffffff60' }}>
                <span>Terrain</span><span style={{ color: '#f0ece4' }}>{selectedCourt?.name}</span>
                <span>Date</span><span style={{ color: '#f0ece4' }}>{booking.date}</span>
                <span>Créneau</span><span style={{ color: '#f0ece4' }}>{booking.start_time}–{endTime}</span>
                <span>Joueurs</span><span style={{ color: '#f0ece4' }}>{booking.players_count}</span>
                <span style={{ color: '#c9a96e' }}>Total</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#c9a96e' }}>€{price.toFixed(2)}</span>
              </div>
            </div>
            <NavButtons onBack={() => setStep(2)} onNext={handleSubmit} nextLabel={submitting ? 'Envoi...' : 'Confirmer'} nextDisabled={!client.name || submitting} nextGold />
          </div>
        )}
      </div>
    </PageLayout>
  )
}
