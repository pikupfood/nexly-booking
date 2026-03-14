import { NextRequest, NextResponse } from 'next/server'

// Force dynamic — evita che Next.js tenti di pre-renderare questa route al build time
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY non configurata su Vercel' }, { status: 500 })
  }

  // Import lazy DENTRO la funzione — non al livello modulo
  // Questo evita "Neither apiKey nor config.authenticator provided" al build time
  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(apiKey, { apiVersion: '2025-02-24.acacia' })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { slug, module, amount, description, tenantId, tenantName, metadata, successPath, cancelPath } = body

  if (!amount || amount < 50) {
    return NextResponse.json({ error: 'Montant invalide (min 50 centesimi)' }, { status: 400 })
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
            description: `${tenantName || ''} · ${module || ''}`.trim() || undefined,
          },
          unit_amount: Math.round(amount),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/${successPath || 'conferma'}?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${baseUrl}/${cancelPath || module || 'hotel'}?status=cancelled`,
      metadata: {
        tenant_id: String(tenantId || ''),
        module: String(module || ''),
        slug: String(slug || ''),
        ...(metadata || {}),
      },
      payment_intent_data: {
        metadata: {
          tenant_id: String(tenantId || ''),
          module: String(module || ''),
          source: 'nexly_booking',
        },
      },
    })

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
