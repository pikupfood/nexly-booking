import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: NextRequest) {
  const {
    slug, module, // hotel | spa | padel | restaurant
    amount,       // importo in centesimi (es. 10000 = €100)
    description,  // es. "Chambre Deluxe · 3 nuits · 2026-03-20 → 2026-03-23"
    tenantId,
    tenantName,
    metadata,     // dati extra da salvare (reservationData, etc.)
    successPath,  // path dopo il pagamento riuscito
    cancelPath,   // path se cancella
  } = await req.json()

  if (!amount || amount < 50) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }

  const baseUrl = `${process.env.NEXT_PUBLIC_URL || 'https://nexly-booking.vercel.app'}/${slug}`

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: description || 'Réservation',
            description: `${tenantName || ''} · ${module || ''}`.trim(),
          },
          unit_amount: Math.round(amount), // già in centesimi
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/${successPath || 'confirmation'}?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${baseUrl}/${cancelPath || module || 'hotel'}?status=cancelled`,
      metadata: {
        tenant_id: tenantId || '',
        module: module || '',
        slug: slug || '',
        ...metadata,
      },
      payment_intent_data: {
        metadata: {
          tenant_id: tenantId || '',
          module: module || '',
          source: 'nexly_booking',
        }
      },
    })

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
