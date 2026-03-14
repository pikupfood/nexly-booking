import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY non configurata' }, { status: 500 })
  }

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(apiKey, { apiVersion: '2025-02-24.acacia' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return NextResponse.json({
      status: session.payment_status,
      paid: session.payment_status === 'paid',
      amount: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
