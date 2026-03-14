'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const inputStyle: any = {
  width: '100%', padding: '14px 16px',
  background: '#ffffff08',
  border: '1px solid #ffffff15',
  borderRadius: '10px',
  color: '#f0ece4',
  fontSize: '14px',
  fontFamily: "'Jost', sans-serif",
  fontWeight: 300,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}
const labelStyle: any = {
  display: 'block', fontSize: '11px', letterSpacing: '0.1em',
  color: '#ffffff40', marginBottom: '6px', textTransform: 'uppercase',
}

export default function HotelBookingPage() {
  const router = useRouter()
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
    supabase.from('room_types').select('*').eq('is_active', true).order('base_price').then(({ data }) => {
      setRoomTypes(data || [])
      setLoading(false)
    })
  }, [])

  const nights = dates.check_in && dates.check_out
    ? Math.round((new Date(dates.check_out).getTime() - new Date(dates.check_in).getTime()) / 86400000)
    : 0
  const total = selectedType ? nights * selectedType.base_price : 0

  const handleSubmit = async () => {
    setSubmitting(true)
    // Crea guest
    const { data: guest } = await supabase.from('guests').insert([{
      first_name: client.first_name, last_name: client.last_name,
      email: client.email, phone: client.phone,
    }]).select().single()

    if (!guest) { setSubmitting(false); return }

    // Crea prenotazione
    const { data: res } = await supabase.from('reservations').insert([{
      guest_id: guest.id,
      room_type_id: selectedType.id,
      check_in: dates.check_in,
      check_out: dates.check_out,
      adults: guests.adults,
      children: guests.children,
      total_price: total,
      special_requests: client.requests || null,
      channel: 'direct',
      status: 'confirmed',
    }]).select().single()

    if (res) {
      setBookingRef(res.reservation_number)
      setSuccess(true)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c0c0e' }}>
      <div style={{ color: '#c9a96e', fontSize: '14px', letterSpacing: '0.1em' }}>Chargement...</div>
    </div>
  )

  if (success) return <SuccessPage ref={bookingRef} type="hotel" info={`${selectedType?.name} · ${nights} nuit${nights > 1 ? 's' : ''} · ${dates.check_in} → ${dates.check_out}`} />

  return (
    <PageLayout title="Hôtel" subtitle="Réservation de chambre" back="/">
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Steps */}
        <StepIndicator current={step} steps={['Chambre', 'Dates', 'Vos données']} />

        {/* Step 1: Room type */}
        {step === 1 && (
          <div className="anim-fadeup">
            <SectionTitle>Choisissez votre chambre</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {roomTypes.map(rt => (
                <div key={rt.id} onClick={() => setSelectedType(rt)} style={{
                  padding: '24px', borderRadius: '16px', cursor: 'pointer',
                  background: selectedType?.id === rt.id ? '#c9a96e12' : '#111116',
                  border: `1px solid ${selectedType?.id === rt.id ? '#c9a96e' : '#ffffff12'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#f0ece4', marginBottom: '4px' }}>{rt.name}</div>
                      <div style={{ fontSize: '12px', color: '#ffffff40', letterSpacing: '0.06em' }}>{rt.size_sqm}m² · max {rt.max_occupancy} personnes</div>
                      {rt.amenities?.length > 0 && (
                        <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {rt.amenities.slice(0, 4).map((a: string) => (
                            <span key={a} style={{ fontSize: '11px', color: '#c9a96e80', background: '#c9a96e10', padding: '2px 8px', borderRadius: '20px' }}>{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '20px' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: '#c9a96e', fontWeight: 400 }}>€{rt.base_price}</div>
                      <div style={{ fontSize: '11px', color: '#ffffff30' }}>par nuit</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <NavButtons onNext={() => setStep(2)} nextDisabled={!selectedType} />
          </div>
        )}

        {/* Step 2: Dates */}
        {step === 2 && (
          <div className="anim-fadeup">
            <SectionTitle>Dates de séjour</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Arrivée *</label>
                <input style={inputStyle} type="date" value={dates.check_in} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDates(p => ({ ...p, check_in: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Départ *</label>
                <input style={inputStyle} type="date" value={dates.check_out} min={dates.check_in || new Date().toISOString().split('T')[0]}
                  onChange={e => setDates(p => ({ ...p, check_out: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Adultes</label>
                <input style={inputStyle} type="number" min="1" max="4" value={guests.adults}
                  onChange={e => setGuests(p => ({ ...p, adults: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <label style={labelStyle}>Enfants</label>
                <input style={inputStyle} type="number" min="0" max="4" value={guests.children}
                  onChange={e => setGuests(p => ({ ...p, children: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            {nights > 0 && (
              <PricePreview nights={nights} price={selectedType?.base_price} total={total} label={selectedType?.name} />
            )}
            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!dates.check_in || !dates.check_out || nights <= 0} />
          </div>
        )}

        {/* Step 3: Client data */}
        {step === 3 && (
          <div className="anim-fadeup">
            <SectionTitle>Vos coordonnées</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Prénom *</label>
                <input style={inputStyle} value={client.first_name} onChange={e => setClient(p => ({ ...p, first_name: e.target.value }))} placeholder="Jean" />
              </div>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input style={inputStyle} value={client.last_name} onChange={e => setClient(p => ({ ...p, last_name: e.target.value }))} placeholder="Dupont" />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} placeholder="jean@email.com" />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input style={inputStyle} value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} placeholder="+33 6 12 34 56 78" />
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Demandes spéciales</label>
              <textarea style={{ ...inputStyle, height: '90px', resize: 'vertical' }} value={client.requests}
                onChange={e => setClient(p => ({ ...p, requests: e.target.value }))}
                placeholder="Vue mer, lit supplémentaire, heure d'arrivée..." />
            </div>

            {/* Recap */}
            <div style={{ background: '#c9a96e0a', border: '1px solid #c9a96e25', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#c9a96e80', marginBottom: '12px' }}>RÉCAPITULATIF</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#ffffff60' }}>
                <span>Chambre</span><span style={{ color: '#f0ece4' }}>{selectedType?.name}</span>
                <span>Arrivée</span><span style={{ color: '#f0ece4' }}>{dates.check_in}</span>
                <span>Départ</span><span style={{ color: '#f0ece4' }}>{dates.check_out}</span>
                <span>Nuits</span><span style={{ color: '#f0ece4' }}>{nights}</span>
                <span style={{ fontWeight: 500, color: '#c9a96e' }}>Total</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#c9a96e', fontWeight: 400 }}>€{total.toFixed(2)}</span>
              </div>
            </div>

            <NavButtons onBack={() => setStep(2)}
              onNext={handleSubmit}
              nextLabel={submitting ? 'Envoi...' : 'Confirmer la réservation'}
              nextDisabled={!client.first_name || !client.last_name || !client.email || submitting}
              nextGold
            />
          </div>
        )}
      </div>
    </PageLayout>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

export function PageLayout({ children, title, subtitle, back }: any) {
  return (
    <main style={{ minHeight: '100vh', background: '#0c0c0e', paddingTop: '80px' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #c9a96e06, transparent)' }} />
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '20px 48px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #ffffff08', backdropFilter: 'blur(12px)', background: 'rgba(12,12,14,0.8)' }}>
        <Link href={back} style={{ fontSize: '13px', color: '#ffffff40', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', letterSpacing: '0.15em', color: '#c9a96e' }}>NEXLY</span>
        </Link>
        <span style={{ color: '#ffffff15' }}>|</span>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: '#f0ece4', letterSpacing: '0.05em' }}>{title}</div>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#ffffff30', textTransform: 'uppercase' }}>{subtitle}</div>
        </div>
      </nav>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </main>
  )
}

export function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '48px', paddingTop: '40px' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, background: current > i + 1 ? '#c9a96e' : current === i + 1 ? 'transparent' : 'transparent', color: current > i + 1 ? '#0c0c0e' : current === i + 1 ? '#c9a96e' : '#ffffff25', border: `1.5px solid ${current >= i + 1 ? '#c9a96e' : '#ffffff15'}`, transition: 'all 0.3s' }}>
              {current > i + 1 ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: current === i + 1 ? '#c9a96e' : '#ffffff25', marginTop: '6px', textTransform: 'uppercase' }}>{s}</div>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: '1px', background: current > i + 1 ? '#c9a96e50' : '#ffffff10', marginBottom: '20px' }} />}
        </div>
      ))}
    </div>
  )
}

export function SectionTitle({ children }: any) {
  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: '#f0ece4', marginBottom: '28px' }}>
      {children}
    </div>
  )
}

export function PricePreview({ nights, price, total, label }: any) {
  return (
    <div style={{ background: '#c9a96e0a', border: '1px solid #c9a96e20', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '13px', color: '#ffffff50' }}>{label} · {nights} nuit{nights > 1 ? 's' : ''} × €{price}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#c9a96e', fontWeight: 400 }}>€{total?.toFixed(2)}</div>
    </div>
  )
}

export function NavButtons({ onBack, onNext, nextDisabled, nextLabel, nextGold, submitting }: any) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
      {onBack && (
        <button onClick={onBack} style={{ padding: '14px 24px', background: 'transparent', border: '1px solid #ffffff15', borderRadius: '10px', color: '#ffffff40', cursor: 'pointer', fontSize: '13px', fontFamily: "'Jost', sans-serif", letterSpacing: '0.06em' }}>
          ← Retour
        </button>
      )}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className={nextDisabled ? '' : 'gold-btn'} style={{
          flex: 1, padding: '14px 24px',
          background: nextGold && !nextDisabled ? 'linear-gradient(135deg, #c9a96e, #a07840)' : nextDisabled ? '#ffffff08' : '#ffffff10',
          border: `1px solid ${nextGold && !nextDisabled ? 'transparent' : '#ffffff15'}`,
          borderRadius: '10px',
          color: nextDisabled ? '#ffffff25' : nextGold ? '#0c0c0e' : '#f0ece4',
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
          fontSize: '13px', fontFamily: "'Jost', sans-serif",
          fontWeight: nextGold ? 500 : 300,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {nextLabel || 'Continuer →'}
        </button>
      )}
    </div>
  )
}

export function SuccessPage({ ref: bookingRef, type, info }: any) {
  return (
    <main style={{ minHeight: '100vh', background: '#0c0c0e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="anim-fadeup" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>✨</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#f0ece4', marginBottom: '8px' }}>
          Réservation confirmée
        </div>
        <div style={{ fontSize: '14px', color: '#ffffff40', marginBottom: '32px', lineHeight: 1.7 }}>{info}</div>
        {bookingRef && (
          <div style={{ background: '#c9a96e10', border: '1px solid #c9a96e30', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#c9a96e60', marginBottom: '8px' }}>N° DE RÉSERVATION</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#c9a96e', letterSpacing: '0.1em' }}>{bookingRef}</div>
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#ffffff30', marginBottom: '32px', lineHeight: 1.8 }}>
          Vous recevrez une confirmation par email.<br/>Notre équipe vous attend avec plaisir.
        </div>
        <Link href="/" className="gold-btn" style={{
          display: 'inline-block', padding: '14px 32px',
          background: 'linear-gradient(135deg, #c9a96e, #a07840)',
          borderRadius: '10px', color: '#0c0c0e',
          fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Retour à l'accueil
        </Link>
      </div>
    </main>
  )
}
