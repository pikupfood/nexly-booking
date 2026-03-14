'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageWrapper, Steps, SectionH, NavBtns, ConfirmBox, Row, SuccessPage } from '../hotel/page'
import { TENANT_ID } from '@/lib/supabase'

const IS: any = { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d8d5d0', borderRadius: '8px', color: '#1a1a1a', fontSize: '14px', fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' }
const LS: any = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b6760', marginBottom: '6px' }

const SERVICES = ['Déjeuner', 'Dîner', 'Brunch']
const TIMES = ['12:00','12:30','13:00','13:30','19:00','19:30','20:00','20:30','21:00','21:30']
const LOC: Record<string,string> = { sala: 'Salle', terrazza: 'Terrasse', privato: 'Privé', bar: 'Bar' }

export default function RistorantePage() {
  const [tables, setTables] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [booking, setBooking] = useState({ date: '', time: '20:00', guests_count: 2, service: 'Dîner', notes: '' })
  const [client, setClient] = useState({ name: '', phone: '', email: '' })
  const [selectedTable, setSelectedTable] = useState<any>(null)

  useEffect(() => { supabase.from('restaurant_tables').select('*').eq('status', 'free').eq('tenant_id', TENANT_ID).order('table_number').then(({ data }) => setTables(data || [])) }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data } = await supabase.from('table_reservations').insert([{ guest_name: client.name, guest_phone: client.phone || null, guest_email: client.email || null, table_id: selectedTable?.id || null, date: booking.date, time: booking.time, guests_count: booking.guests_count, notes: `${booking.service}${booking.notes ? ' — ' + booking.notes : ''}`, status: 'confirmed', tenant_id: TENANT_ID }]).select().single()
    if (data) { setBookingRef(data.reservation_number); setSuccess(true) }
    setSubmitting(false)
  }

  if (success) return <SuccessPage bookingRef={bookingRef} info={`${booking.service} · ${booking.date} à ${booking.time} · ${booking.guests_count} personnes`} />

  const Chip = ({ label, active, onClick }: any) => (
    <button onClick={onClick} style={{ padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', system-ui, sans-serif", background: active ? '#1a1a1a' : '#fff', border: `1px solid ${active ? '#1a1a1a' : '#d8d5d0'}`, color: active ? '#fff' : '#6b6760', transition: 'all 0.15s' }}>{label}</button>
  )

  return (
    <PageWrapper title="Restaurant" subtitle="Réservation de table" back="/">
      <Steps current={step} steps={['Détails', 'Table', 'Coordonnées']} />

      {step === 1 && (
        <div className="anim-fadeup">
          <SectionH>Votre réservation</SectionH>
          <div style={{ marginBottom: '18px' }}>
            <label style={LS}>Type de repas</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SERVICES.map(s => <Chip key={s} label={s} active={booking.service === s} onClick={() => setBooking(p => ({ ...p, service: s }))} />)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div><label style={LS}>Date *</label><input style={IS} type="date" value={booking.date} min={new Date().toISOString().split('T')[0]} onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} /></div>
            <div><label style={LS}>Personnes</label><input style={IS} type="number" min="1" max="20" value={booking.guests_count} onChange={e => setBooking(p => ({ ...p, guests_count: parseInt(e.target.value) || 1 }))} /></div>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={LS}>Heure</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {TIMES.map(t => <Chip key={t} label={t} active={booking.time === t} onClick={() => setBooking(p => ({ ...p, time: t }))} />)}
            </div>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <label style={LS}>Demandes particulières</label>
            <textarea style={{ ...IS, height: '75px', resize: 'vertical' }} value={booking.notes} onChange={e => setBooking(p => ({ ...p, notes: e.target.value }))} placeholder="Allergie, occasion spéciale..." />
          </div>
          <NavBtns onNext={() => setStep(2)} nextDisabled={!booking.date} />
        </div>
      )}

      {step === 2 && (
        <div className="anim-fadeup">
          <SectionH>Choix de la table</SectionH>
          <p style={{ fontSize: '13px', color: '#8a8680', marginBottom: '18px', marginTop: '-12px' }}>Optionnel — nous vous attribuerons une table si aucune préférence</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginBottom: '8px' }}>
            <div onClick={() => setSelectedTable(null)} style={{ padding: '14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: '#fff', border: `1.5px solid ${!selectedTable ? '#1a1a1a' : '#e8e6e1'}`, transition: 'border-color 0.15s' }}>
              <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>Sans préférence</div>
            </div>
            {tables.filter(t => t.capacity >= booking.guests_count).map(t => (
              <div key={t.id} onClick={() => setSelectedTable(t)} style={{ padding: '14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: '#fff', border: `1.5px solid ${selectedTable?.id === t.id ? '#1a1a1a' : '#e8e6e1'}`, transition: 'border-color 0.15s' }}>
                <div style={{ fontSize: '11px', color: '#8a8680', marginBottom: '4px' }}>{LOC[t.location]}</div>
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '18px', color: '#1a1a1a' }}>Table {t.table_number}</div>
                <div style={{ fontSize: '11px', color: '#9a9690', marginTop: '2px' }}>{t.capacity} pers.</div>
              </div>
            ))}
          </div>
          <NavBtns onBack={() => setStep(1)} onNext={() => setStep(3)} />
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
            <Row label="Repas" value={booking.service} />
            <Row label="Date" value={`${booking.date} à ${booking.time}`} />
            <Row label="Personnes" value={`${booking.guests_count}`} />
            <Row label="Table" value={selectedTable ? `Table ${selectedTable.table_number}` : 'Attribution automatique'} />
          </ConfirmBox>
          <NavBtns onBack={() => setStep(2)} onNext={handleSubmit} nextLabel={submitting ? 'Envoi...' : 'Confirmer'} nextDisabled={!client.name || submitting} />
        </div>
      )}
    </PageWrapper>
  )
}
