import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const priceId = process.env.STRIPE_PRICE_ID

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Missing STRIPE_SECRET_KEY in .env.local' },
        { status: 500 }
      )
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing STRIPE_PRICE_ID in .env.local' },
        { status: 500 }
      )
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecretKey)

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: { userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
