'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ── Shared styles ────────────────────────────────────────────────────────────
const IS: any = { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d8d5d0', borderRadius: '8px', color: '#1a1a1a', fontSize: '14px', fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }
const LS: any = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b6760', marginBottom: '6px' }

// ── Sub-components (exported for reuse) ──────────────────────────────────────

export function PageWrapper({ children, title, subtitle, back }: any) {
  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <nav style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e8e6e1', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href={back} style={{ fontSize: '13px', color: '#8a8680' }}>← Retour</Link>
        <span style={{ color: '#d8d5d0' }}>|</span>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '16px', color: '#1a1a1a' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '11px', color: '#9a9690', marginTop: '1px' }}>{subtitle}</div>}
        </div>
      </nav>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {children}
      </div>
      <footer style={{ padding: '16px 32px', borderTop: '1px solid #e8e6e1', background: '#fff', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontSize: '11px', color: '#b0aca6', margin: 0 }}>
          Réservations propulsées par <a href="https://nexlyhub.com" target="_blank" rel="noopener" style={{ color: '#8a8680' }}>Nexly Hub</a>
        </p>
      </footer>
    </main>
  )
}

export function Steps({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: 0 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, background: current > i + 1 ? '#1a1a1a' : current === i + 1 ? '#fff' : '#fff', color: current > i + 1 ? '#fff' : current === i + 1 ? '#1a1a1a' : '#c0bdb8', border: `1.5px solid ${current >= i + 1 ? '#1a1a1a' : '#d8d5d0'}`, transition: 'all 0.2s' }}>
              {current > i + 1 ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: '11px', color: current === i + 1 ? '#1a1a1a' : '#9a9690', marginTop: '5px', fontWeight: current === i + 1 ? 500 : 400 }}>{s}</div>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: '1px', background: current > i + 1 ? '#1a1a1a' : '#e8e6e1', marginBottom: '18px' }} />}
        </div>
      ))}
    </div>
  )
}

export function SectionH({ children }: any) {
  return <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '22px', color: '#1a1a1a', marginBottom: '24px' }}>{children}</div>
}

export function Divider() {
  return <div style={{ height: '1px', background: '#e8e6e1', margin: '24px 0' }} />
}

export function NavBtns({ onBack, onNext, nextLabel, nextDisabled }: any) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
      {onBack && <button className="btn-secondary" onClick={onBack}>← Retour</button>}
      {onNext && <button className="btn-primary" onClick={onNext} disabled={nextDisabled} style={{ flex: 1 }}>
        {nextLabel || 'Continuer →'}
      </button>}
    </div>
  )
}

export function ConfirmBox({ color = '#4a7fa5', children }: any) {
  return (
    <div style={{ background: '#f5f5f3', border: '1px solid #e0ddd8', borderRadius: '10px', padding: '18px 20px', marginBottom: '24px' }}>
      {children}
    </div>
  )
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #edeae6', fontSize: '14px' }}>
      <span style={{ color: '#8a8680' }}>{label}</span>
      <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export function SuccessPage({ bookingRef, info }: any) {
  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="anim-fadeup" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <div style={{ width: '56px', height: '56px', background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 24px' }}>✓</div>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '28px', color: '#1a1a1a', marginBottom: '12px' }}>Réservation confirmée</div>
        <div style={{ fontSize: '14px', color: '#6b6760', lineHeight: 1.6, marginBottom: '28px' }}>{info}</div>
        {bookingRef && (
          <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: '10px', padding: '16px', marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', color: '#9a9690', marginBottom: '6px', fontWeight: 500 }}>RÉFÉRENCE</div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#1a1a1a', letterSpacing: '0.05em' }}>{bookingRef}</div>
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#8a8680', marginBottom: '28px' }}>Vous recevrez une confirmation prochainement.</div>
        <Link href="/" className="btn-primary" style={{ display: 'inline-block', padding: '12px 28px', background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '14px' }}>
          Retour à l'accueil
        </Link>
        <div style={{ marginTop: '40px', fontSize: '11px', color: '#c0bdb8' }}>
          Propulsé par <a href="https://nexlyhub.com" target="_blank" rel="noopener" style={{ color: '#9a9690' }}>Nexly Hub</a>
        </div>
      </div>
    </main>
  )
}

// ── Hotel booking ─────────────────────────────────────────────────────────────

export default function HotelBookingPage() {
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedType, setSelectedType] = useState<any>(null)
  const [dates, setDates] = useState({ check_in: '', check_out: '' })
  const [guests, setGuests] = useState({ adults: 1, children: 0 })
  const [client, setClient] = useState({ first_name: '', last_name: '', email: '', phone: '', requests: '' })
  const [bookingRef, setBookingRef] = useState('')

  useEffect(() => {
    supabase.from('room_types').select('*').eq('is_active', true).order('base_price').then(({ data }) => { setRoomTypes(data || []); setLoading(false) })
  }, [])

  const nights = dates.check_in && dates.check_out ? Math.round((new Date(dates.check_out).getTime() - new Date(dates.check_in).getTime()) / 86400000) : 0
  const total = selectedType ? nights * selectedType.base_price : 0

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data: guest } = await supabase.from('guests').insert([{ first_name: client.first_name, last_name: client.last_name, email: client.email, phone: client.phone }]).select().single()
    if (!guest) { setSubmitting(false); return }
    const { data: res } = await supabase.from('reservations').insert([{ guest_id: guest.id, room_type_id: selectedType.id, check_in: dates.check_in, check_out: dates.check_out, adults: guests.adults, children: guests.children, total_price: total, special_requests: client.requests || null, channel: 'direct', status: 'confirmed' }]).select().single()
    if (res) { setBookingRef(res.reservation_number); setSuccess(true) }
    setSubmitting(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}><span style={{ color: '#8a8680', fontSize: '14px' }}>Chargement...</span></div>
  if (success) return <SuccessPage bookingRef={bookingRef} info={`${selectedType?.name} · ${nights} nuit${nights > 1 ? 's' : ''} · ${dates.check_in} → ${dates.check_out}`} />

  return (
    <PageWrapper title="Hébergement" subtitle="Réservation de chambre" back="/">
      <Steps current={step} steps={['Chambre', 'Dates', 'Vos données']} />

      {step === 1 && (
        <div className="anim-fadeup">
          <SectionH>Choisissez votre chambre</SectionH>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roomTypes.map(rt => (
              <div key={rt.id} onClick={() => setSelectedType(rt)} style={{ padding: '18px 20px', borderRadius: '10px', cursor: 'pointer', background: '#fff', border: `1.5px solid ${selectedType?.id === rt.id ? '#1a1a1a' : '#e8e6e1'}`, transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '17px', color: '#1a1a1a', marginBottom: '4px' }}>{rt.name}</div>
                    <div style={{ fontSize: '12px', color: '#8a8680' }}>{rt.size_sqm && `${rt.size_sqm}m² · `}max {rt.max_occupancy} pers.</div>
                    {rt.amenities?.length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {rt.amenities.slice(0, 4).map((a: string) => (
                          <span key={a} style={{ fontSize: '11px', color: '#6b6760', background: '#f0ede8', padding: '2px 7px', borderRadius: '4px' }}>{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                    <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '22px', color: '#1a1a1a' }}>€{rt.base_price}</div>
                    <div style={{ fontSize: '11px', color: '#9a9690' }}>/ nuit</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <NavBtns onNext={() => setStep(2)} nextDisabled={!selectedType} />
        </div>
      )}

      {step === 2 && (
        <div className="anim-fadeup">
          <SectionH>Dates de séjour</SectionH>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div><label style={LS}>Arrivée</label><input style={IS} type="date" value={dates.check_in} min={new Date().toISOString().split('T')[0]} onChange={e => setDates(p => ({ ...p, check_in: e.target.value }))} /></div>
            <div><label style={LS}>Départ</label><input style={IS} type="date" value={dates.check_out} min={dates.check_in || new Date().toISOString().split('T')[0]} onChange={e => setDates(p => ({ ...p, check_out: e.target.value }))} /></div>
            <div><label style={LS}>Adultes</label><input style={IS} type="number" min="1" max="6" value={guests.adults} onChange={e => setGuests(p => ({ ...p, adults: parseInt(e.target.value) || 1 }))} /></div>
            <div><label style={LS}>Enfants</label><input style={IS} type="number" min="0" max="6" value={guests.children} onChange={e => setGuests(p => ({ ...p, children: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          {nights > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: '10px', padding: '14px 18px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6b6760' }}>{selectedType?.name} · {nights} nuit{nights > 1 ? 's' : ''}</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#1a1a1a' }}>€{total.toFixed(2)}</div>
            </div>
          )}
          <NavBtns onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!dates.check_in || !dates.check_out || nights <= 0} />
        </div>
      )}

      {step === 3 && (
        <div className="anim-fadeup">
          <SectionH>Vos coordonnées</SectionH>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div><label style={LS}>Prénom *</label><input style={IS} value={client.first_name} onChange={e => setClient(p => ({ ...p, first_name: e.target.value }))} placeholder="Jean" /></div>
            <div><label style={LS}>Nom *</label><input style={IS} value={client.last_name} onChange={e => setClient(p => ({ ...p, last_name: e.target.value }))} placeholder="Dupont" /></div>
            <div><label style={LS}>Email *</label><input style={IS} type="email" value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label style={LS}>Téléphone</label><input style={IS} value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={LS}>Demandes spéciales</label>
            <textarea style={{ ...IS, height: '80px', resize: 'vertical' }} value={client.requests} onChange={e => setClient(p => ({ ...p, requests: e.target.value }))} placeholder="Heure d'arrivée, préférences..." />
          </div>
          <ConfirmBox>
            <Row label="Chambre" value={selectedType?.name} />
            <Row label="Arrivée" value={dates.check_in} />
            <Row label="Départ" value={dates.check_out} />
            <Row label="Nuits" value={`${nights}`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ fontWeight: 500, color: '#1a1a1a' }}>Total</span>
              <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#1a1a1a' }}>€{total.toFixed(2)}</span>
            </div>
          </ConfirmBox>
          <NavBtns onBack={() => setStep(2)} onNext={handleSubmit} nextLabel={submitting ? 'Envoi en cours...' : 'Confirmer la réservation'} nextDisabled={!client.first_name || !client.last_name || !client.email || submitting} />
        </div>
      )}
    </PageWrapper>
  )
}
