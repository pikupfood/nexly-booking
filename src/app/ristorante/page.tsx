'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageLayout, StepIndicator, SectionTitle, NavButtons, SuccessPage } from '../hotel/page'

const inputStyle: any = { width: '100%', padding: '14px 16px', background: '#ffffff08', border: '1px solid #ffffff15', borderRadius: '10px', color: '#f0ece4', fontSize: '14px', fontFamily: "'Jost', sans-serif", fontWeight: 300, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }
const labelStyle: any = { display: 'block', fontSize: '11px', letterSpacing: '0.1em', color: '#ffffff40', marginBottom: '6px', textTransform: 'uppercase' }

const SERVICES = ['Déjeuner', 'Dîner', 'Brunch', 'Cocktail']
const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']

export default function RistoranteBookingPage() {
  const [tables, setTables] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const [booking, setBooking] = useState({ date: '', time: '20:00', guests_count: 2, service: 'Dîner', notes: '' })
  const [client, setClient] = useState({ name: '', phone: '', email: '' })
  const [selectedTable, setSelectedTable] = useState<any>(null)

  useEffect(() => {
    supabase.from('restaurant_tables').select('*').eq('status', 'free').order('table_number').then(({ data }) => setTables(data || []))
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data } = await supabase.from('table_reservations').insert([{
      guest_name: client.name,
      guest_phone: client.phone || null,
      guest_email: client.email || null,
      table_id: selectedTable?.id || null,
      date: booking.date,
      time: booking.time,
      guests_count: booking.guests_count,
      notes: `${booking.service}${booking.notes ? ' — ' + booking.notes : ''}`,
      status: 'confirmed',
    }]).select().single()

    if (data) { setBookingRef(data.reservation_number); setSuccess(true) }
    setSubmitting(false)
  }

  if (success) return <SuccessPage ref={bookingRef} type="restaurant" info={`${booking.service} · ${booking.date} à ${booking.time} · ${booking.guests_count} personnes`} />

  const LOC_LABEL: Record<string, string> = { sala: '🏠 Salle', terrazza: '🌿 Terrasse', privato: '🔒 Privé', bar: '🍸 Bar' }
  const availableTables = tables.filter(t => t.capacity >= booking.guests_count)

  return (
    <PageLayout title="Restaurant" subtitle="Réservation de table" back="/">
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
        <StepIndicator current={step} steps={['Détails', 'Table', 'Coordonnées']} />

        {step === 1 && (
          <div className="anim-fadeup">
            <SectionTitle>Votre réservation</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Type de repas</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SERVICES.map(s => (
                    <button key={s} onClick={() => setBooking(p => ({ ...p, service: s }))} style={{
                      padding: '10px 18px', borderRadius: '40px', cursor: 'pointer', fontSize: '13px',
                      fontFamily: "'Jost', sans-serif",
                      background: booking.service === s ? '#a8c4a020' : 'transparent',
                      border: `1px solid ${booking.service === s ? '#a8c4a0' : '#ffffff15'}`,
                      color: booking.service === s ? '#a8c4a0' : '#ffffff40',
                      transition: 'all 0.2s',
                    }}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Date *</label>
                <input style={inputStyle} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Nombre de personnes</label>
                <input style={inputStyle} type="number" min="1" max="20" value={booking.guests_count}
                  onChange={e => setBooking(p => ({ ...p, guests_count: parseInt(e.target.value) || 1 }))} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Heure souhaitée</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {TIME_SLOTS.map(t => (
                    <button key={t} onClick={() => setBooking(p => ({ ...p, time: t }))} style={{
                      padding: '10px 16px', borderRadius: '40px', cursor: 'pointer', fontSize: '13px',
                      fontFamily: "'Jost', sans-serif",
                      background: booking.time === t ? '#a8c4a020' : 'transparent',
                      border: `1px solid ${booking.time === t ? '#a8c4a0' : '#ffffff15'}`,
                      color: booking.time === t ? '#a8c4a0' : '#ffffff40',
                      transition: 'all 0.2s',
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Demandes particulières</label>
                <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} value={booking.notes}
                  onChange={e => setBooking(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Allergie, occasion spéciale, chaise haute..." />
              </div>
            </div>
            <NavButtons onNext={() => setStep(2)} nextDisabled={!booking.date} />
          </div>
        )}

        {step === 2 && (
          <div className="anim-fadeup">
            <SectionTitle>Choix de la table</SectionTitle>
            <div style={{ fontSize: '13px', color: '#ffffff40', marginBottom: '20px' }}>
              Tables disponibles pour {booking.guests_count} personne{booking.guests_count > 1 ? 's' : ''} — optionnel
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div onClick={() => setSelectedTable(null)} style={{
                padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                background: !selectedTable ? '#a8c4a015' : '#111116',
                border: `1px solid ${!selectedTable ? '#a8c4a0' : '#ffffff12'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '11px', color: '#ffffff40', marginBottom: '4px' }}>Au choix</div>
                <div style={{ fontSize: '14px', color: '#f0ece4' }}>Pas de préférence</div>
              </div>
              {availableTables.map(t => (
                <div key={t.id} onClick={() => setSelectedTable(t)} style={{
                  padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                  background: selectedTable?.id === t.id ? '#a8c4a015' : '#111116',
                  border: `1px solid ${selectedTable?.id === t.id ? '#a8c4a0' : '#ffffff12'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '11px', color: '#ffffff40', marginBottom: '4px' }}>{LOC_LABEL[t.location]}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#f0ece4' }}>Table {t.table_number}</div>
                  <div style={{ fontSize: '11px', color: '#ffffff30', marginTop: '2px' }}>{t.capacity} personnes</div>
                </div>
              ))}
            </div>
            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Continuer →" />
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

            <div style={{ background: '#a8c4a00a', border: '1px solid #a8c4a020', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#a8c4a080', marginBottom: '12px' }}>RÉCAPITULATIF</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#ffffff60' }}>
                <span>Repas</span><span style={{ color: '#f0ece4' }}>{booking.service}</span>
                <span>Date</span><span style={{ color: '#f0ece4' }}>{booking.date} à {booking.time}</span>
                <span>Personnes</span><span style={{ color: '#f0ece4' }}>{booking.guests_count}</span>
                <span>Table</span><span style={{ color: '#f0ece4' }}>{selectedTable ? `Table ${selectedTable.table_number}` : 'Au choix'}</span>
              </div>
            </div>

            <NavButtons onBack={() => setStep(2)} onNext={handleSubmit}
              nextLabel={submitting ? 'Envoi...' : 'Confirmer'}
              nextDisabled={!client.name || submitting} nextGold />
          </div>
        )}
      </div>
    </PageLayout>
  )
}
