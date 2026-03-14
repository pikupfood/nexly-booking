'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getTenantBySlug } from '@/lib/supabase'
import Link from 'next/link'

export default function HotelBooking() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [tenant, setTenant] = useState<any>(null)
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState<any>(null)
  const [dates, setDates] = useState({ check_in: '', check_out: '' })
  const [guests, setGuests] = useState({ adults: 2, children: 0 })
  const [client, setClient] = useState({ first_name: '', last_name: '', email: '', phone: '', requests: '' })
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<'select' | 'details' | 'payment'>('select')
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'onsite'>('online')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!slug) return
    getTenantBySlug(slug).then(t => {
      if (!t) return
      setTenant(t)
      supabase.from('room_types').select('*').eq('tenant_id', t.id).eq('is_active', true).order('base_price')
        .then(({ data }) => setRoomTypes(data || []))
    })
  }, [slug])

  const nights = () => {
    if (!dates.check_in || !dates.check_out) return 0
    return Math.round((new Date(dates.check_out).getTime() - new Date(dates.check_in).getTime()) / 864e5)
  }

  const total = selectedType ? nights() * Number(selectedType.base_price) : 0
  const totalCents = Math.round(total * 100)

  const handleOnlinePayment = async () => {
    if (!tenant || !selectedType) return
    setSubmitting(true)

    // Prima crea la prenotazione nel DB con status 'pending'
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

    // Poi redirect a Stripe Checkout
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        module: 'hotel',
        amount: totalCents,
        description: `${selectedType.name} · ${nights()} nuit${nights() > 1 ? 's' : ''} · ${dates.check_in} → ${dates.check_out}`,
        tenantId: tenant.id,
        tenantName: tenant.business_name,
        metadata: {
          reservation_number: resNumber,
          room_type: selectedType.name,
          check_in: dates.check_in,
          check_out: dates.check_out,
          guest_name: `${client.first_name} ${client.last_name}`,
          guest_email: client.email,
        },
        successPath: 'conferma',
        cancelPath: 'hotel',
      })
    })

    const { url, error: stripeErr } = await res.json()
    if (stripeErr || !url) { alert('Erreur paiement: ' + (stripeErr || 'Unknown')); setSubmitting(false); return }
    window.location.href = url
  }

  const handleOnSiteBooking = async () => {
    if (!tenant || !selectedType) return
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
    router.push(`/${slug}/conferma?status=success`)
    setSubmitting(false)
  }

  if (!tenant) return <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#8a8680' }}>Chargement...</div></div>

  const IS: any = { width: '100%', padding: '10px 14px', background: 'white', border: '1px solid #e8e6e1', borderRadius: '8px', color: '#1a1a1a', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' }
  const LS: any = { display: 'block', fontSize: '12px', color: '#8a8680', marginBottom: '5px', fontFamily: 'system-ui' }
  const BG = tenant.primary_color || '#1a1a1a'

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: 'Garamond, Georgia, serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #e8e6e1', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <Link href={`/${slug}`} style={{ fontSize: '14px', color: '#1a1a1a', textDecoration: 'none', fontFamily: 'system-ui' }}>
          ← {tenant.business_name}
        </Link>
        <h1 style={{ fontSize: '16px', fontWeight: '400', letterSpacing: '0.1em', color: '#1a1a1a', margin: 0 }}>RÉSERVATION HÔTEL</h1>
        <div style={{ width: '80px' }} />
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Step 1: Selezione camera + date */}
        {step === 'select' && (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#1a1a1a', marginBottom: '8px' }}>Choisissez votre chambre</h2>
            <p style={{ fontSize: '14px', color: '#8a8680', marginBottom: '28px', fontFamily: 'system-ui' }}>Sélectionnez les dates et le type de chambre</p>

            {/* Date picker */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={LS}>Arrivée *</label>
                <input type="date" style={IS} value={dates.check_in} min={today} onChange={e => {
                  setDates(d => ({ ...d, check_in: e.target.value, check_out: d.check_out < e.target.value ? '' : d.check_out }))
                }} />
              </div>
              <div>
                <label style={LS}>Départ *</label>
                <input type="date" style={IS} value={dates.check_out} min={dates.check_in || today}
                  onChange={e => setDates(d => ({ ...d, check_out: e.target.value }))} />
              </div>
            </div>

            {/* Ospiti */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              <div>
                <label style={LS}>Adultes</label>
                <select style={IS} value={guests.adults} onChange={e => setGuests(g => ({ ...g, adults: parseInt(e.target.value) }))}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} adulte{n>1?'s':''}</option>)}
                </select>
              </div>
              <div>
                <label style={LS}>Enfants</label>
                <select style={IS} value={guests.children} onChange={e => setGuests(g => ({ ...g, children: parseInt(e.target.value) }))}>
                  {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} enfant{n>1?'s':''}</option>)}
                </select>
              </div>
            </div>

            {/* Tipi camera */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roomTypes.map(rt => (
                <div key={rt.id} onClick={() => setSelectedType(rt)}
                  style={{ background: 'white', border: `2px solid ${selectedType?.id === rt.id ? BG : '#e8e6e1'}`, borderRadius: '12px', padding: '20px 24px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>{rt.name}</div>
                      <div style={{ fontSize: '13px', color: '#8a8680', fontFamily: 'system-ui' }}>
                        {rt.bed_type === 'double' ? '🛏️ Double' : rt.bed_type === 'twin' ? '🛏️🛏️ Twin' : rt.bed_type}
                        {rt.max_occupancy && ` · max ${rt.max_occupancy} pers.`}
                        {rt.size_sqm && ` · ${rt.size_sqm}m²`}
                        {rt.breakfast_included && <span style={{ marginLeft: '8px', color: '#059669' }}>🍳 Petit-déj inclus</span>}
                      </div>
                      {rt.description && <div style={{ fontSize: '13px', color: '#6b6760', marginTop: '6px', fontFamily: 'system-ui', lineHeight: '1.4' }}>{rt.description}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                      <div style={{ fontSize: '22px', fontWeight: '500', color: BG }}>€{Number(rt.base_price).toFixed(0)}</div>
                      <div style={{ fontSize: '12px', color: '#8a8680', fontFamily: 'system-ui' }}>/ nuit</div>
                      {dates.check_in && dates.check_out && nights() > 0 && (
                        <div style={{ fontSize: '13px', color: '#1a1a1a', marginTop: '4px', fontFamily: 'system-ui', fontWeight: '600' }}>
                          €{(Number(rt.base_price) * nights()).toFixed(0)} total
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedType?.id === rt.id && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${BG}30`, fontSize: '12px', color: BG, fontFamily: 'system-ui' }}>
                      ✓ Sélectionné
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedType && dates.check_in && dates.check_out && nights() > 0 && (
              <div style={{ marginTop: '24px', background: 'white', border: '1px solid #e8e6e1', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '500' }}>{selectedType.name} · {nights()} nuit{nights()>1?'s':''}</div>
                  <div style={{ fontSize: '12px', color: '#8a8680', fontFamily: 'system-ui', marginTop: '2px' }}>{dates.check_in} → {dates.check_out}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>€{total.toFixed(2)}</div>
                  <button onClick={() => setStep('details')} style={{ marginTop: '8px', padding: '10px 24px', background: BG, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'system-ui', fontWeight: '500' }}>
                    Continuer →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Détails client */}
        {step === 'details' && (
          <>
            <button onClick={() => setStep('select')} style={{ background: 'none', border: 'none', color: '#8a8680', cursor: 'pointer', fontSize: '13px', fontFamily: 'system-ui', marginBottom: '20px', padding: 0 }}>
              ← Modifier la sélection
            </button>
            <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#1a1a1a', marginBottom: '8px' }}>Vos coordonnées</h2>

            {/* Riepilogo */}
            <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', fontSize: '13px', fontFamily: 'system-ui', color: '#6b6760' }}>
              {selectedType?.name} · {nights()} nuit{nights()>1?'s':''} · {dates.check_in} → {dates.check_out} · <strong style={{ color: '#1a1a1a' }}>€{total.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={LS}>Prénom *</label>
                <input style={IS} value={client.first_name} onChange={e => setClient(c => ({...c, first_name: e.target.value}))} placeholder="Marie" />
              </div>
              <div>
                <label style={LS}>Nom *</label>
                <input style={IS} value={client.last_name} onChange={e => setClient(c => ({...c, last_name: e.target.value}))} placeholder="Dupont" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={LS}>Email *</label>
                <input type="email" style={IS} value={client.email} onChange={e => setClient(c => ({...c, email: e.target.value}))} placeholder="marie@email.com" />
              </div>
              <div>
                <label style={LS}>Téléphone</label>
                <input style={IS} value={client.phone} onChange={e => setClient(c => ({...c, phone: e.target.value}))} placeholder="+33 6 00 00 00 00" />
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={LS}>Demandes spéciales</label>
              <textarea style={{ ...IS, height: '80px', resize: 'none' }} value={client.requests} onChange={e => setClient(c => ({...c, requests: e.target.value}))} placeholder="Chambre haute, lit bébé..." />
            </div>

            <button onClick={() => setStep('payment')} disabled={!client.first_name || !client.last_name || !client.email}
              style={{ width: '100%', padding: '14px', background: client.first_name && client.last_name && client.email ? BG : '#d0cdc8', color: 'white', border: 'none', borderRadius: '10px', cursor: client.first_name && client.last_name && client.email ? 'pointer' : 'not-allowed', fontSize: '15px', fontFamily: 'system-ui', fontWeight: '500', letterSpacing: '0.02em' }}>
              Choisir le mode de paiement →
            </button>
          </>
        )}

        {/* Step 3: Paiement */}
        {step === 'payment' && (
          <>
            <button onClick={() => setStep('details')} style={{ background: 'none', border: 'none', color: '#8a8680', cursor: 'pointer', fontSize: '13px', fontFamily: 'system-ui', marginBottom: '20px', padding: 0 }}>
              ← Modifier les coordonnées
            </button>
            <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#1a1a1a', marginBottom: '8px' }}>Mode de paiement</h2>

            {/* Riepilogo finale */}
            <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontFamily: 'system-ui', marginBottom: '8px', color: '#1a1a1a' }}>
                <strong>{selectedType?.name}</strong> · {nights()} nuit{nights()>1?'s':''}
              </div>
              <div style={{ fontSize: '13px', color: '#8a8680', fontFamily: 'system-ui', marginBottom: '2px' }}>
                {dates.check_in} → {dates.check_out} · {guests.adults} adulte{guests.adults>1?'s':''}
              </div>
              <div style={{ fontSize: '13px', color: '#8a8680', fontFamily: 'system-ui' }}>
                {client.first_name} {client.last_name} · {client.email}
              </div>
              <div style={{ borderTop: '1px solid #e8e6e1', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontFamily: 'system-ui', fontWeight: '600', color: '#1a1a1a' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>€{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Opzioni pagamento */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div onClick={() => setPaymentMethod('online')}
                style={{ background: 'white', border: `2px solid ${paymentMethod === 'online' ? BG : '#e8e6e1'}`, borderRadius: '12px', padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '28px' }}>💳</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a1a', fontFamily: 'system-ui' }}>Paiement en ligne sécurisé</div>
                    <div style={{ fontSize: '13px', color: '#8a8680', fontFamily: 'system-ui' }}>Carte bancaire · Visa, Mastercard, Amex · Sécurisé par Stripe</div>
                  </div>
                  {paymentMethod === 'online' && <div style={{ marginLeft: 'auto', color: BG, fontSize: '18px' }}>✓</div>}
                </div>
              </div>

              <div onClick={() => setPaymentMethod('onsite')}
                style={{ background: 'white', border: `2px solid ${paymentMethod === 'onsite' ? BG : '#e8e6e1'}`, borderRadius: '12px', padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '28px' }}>🏨</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a1a', fontFamily: 'system-ui' }}>Payer à l'hôtel</div>
                    <div style={{ fontSize: '13px', color: '#8a8680', fontFamily: 'system-ui' }}>Paiement à l'arrivée · Annulation gratuite</div>
                  </div>
                  {paymentMethod === 'onsite' && <div style={{ marginLeft: 'auto', color: BG, fontSize: '18px' }}>✓</div>}
                </div>
              </div>
            </div>

            <button
              onClick={paymentMethod === 'online' ? handleOnlinePayment : handleOnSiteBooking}
              disabled={submitting}
              style={{ width: '100%', padding: '16px', background: submitting ? '#d0cdc8' : BG, color: 'white', border: 'none', borderRadius: '10px', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '15px', fontFamily: 'system-ui', fontWeight: '500', letterSpacing: '0.02em' }}>
              {submitting ? 'Traitement...' : paymentMethod === 'online' ? `💳 Payer €${total.toFixed(2)}` : '✓ Confirmer la réservation'}
            </button>

            {paymentMethod === 'online' && (
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#8a8680', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                🔒 Paiement sécurisé par <strong style={{ color: '#635bff' }}>Stripe</strong>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '11px', color: '#c0bdb8', fontFamily: 'system-ui' }}>
          Réservations gérées par <a href="https://nexlyhub.com" style={{ color: '#8a8680' }}>Nexly Hub</a>
        </div>
      </div>
    </div>
  )
}
