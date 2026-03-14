'use client'
import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ConfermaContent() {
  const params = useParams()
  const sp = useSearchParams()
  const slug = params?.slug as string
  const sessionId = sp?.get('session_id')
  const status = sp?.get('status')
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/verify-payment?session_id=${sessionId}`)
        .then(r => r.json())
        .then(d => { setPayment(d); setLoading(false) })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const S: any = {
    minHeight: '100vh', background: '#fafaf9', fontFamily: 'Garamond, Georgia, serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  }

  if (loading) return (
    <div style={S}>
      <div style={{ color: '#8a8680', fontSize: '16px' }}>Vérification du paiement...</div>
    </div>
  )

  const isPaid = payment?.paid || status === 'success'
  const isCancelled = status === 'cancelled'

  return (
    <div style={S}>
      <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {isPaid ? '✅' : isCancelled ? '❌' : '⚠️'}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '400', color: '#1a1a1a', marginBottom: '12px' }}>
          {isPaid ? 'Réservation confirmée !' : isCancelled ? 'Paiement annulé' : 'Statut inconnu'}
        </h1>
        <p style={{ fontSize: '16px', color: '#8a8680', marginBottom: '24px', lineHeight: '1.6' }}>
          {isPaid
            ? `Votre réservation a été confirmée et le paiement de €${((payment?.amount || 0) / 100).toFixed(2)} a été reçu. Vous recevrez une confirmation par email.`
            : isCancelled
            ? 'Votre paiement a été annulé. Aucun montant n\'a été débité.'
            : 'Nous n\'avons pas pu vérifier votre paiement. Contactez-nous si nécessaire.'}
        </p>
        {payment?.metadata && isPaid && (
          <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ fontSize: '12px', color: '#8a8680', marginBottom: '8px', letterSpacing: '0.1em' }}>DÉTAILS</div>
            {payment.metadata.room_type && <div style={{ fontSize: '14px', color: '#1a1a1a', marginBottom: '4px' }}>🏨 {payment.metadata.room_type}</div>}
            {payment.metadata.check_in && <div style={{ fontSize: '14px', color: '#1a1a1a', marginBottom: '4px' }}>📅 {payment.metadata.check_in} → {payment.metadata.check_out}</div>}
            {payment.metadata.guest_name && <div style={{ fontSize: '14px', color: '#1a1a1a' }}>👤 {payment.metadata.guest_name}</div>}
          </div>
        )}
        <Link href={`/${slug}`} style={{ display: 'inline-block', padding: '12px 28px', background: '#1a1a1a', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontFamily: 'system-ui' }}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export default function ConfermaPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#8a8680' }}>Chargement...</div></div>}>
      <ConfermaContent />
    </Suspense>
  )
}
