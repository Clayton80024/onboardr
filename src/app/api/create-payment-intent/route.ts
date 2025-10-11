import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { formatAmountForStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { amount, paymentPlan, userId } = await request.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: 'usd',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userId,
        paymentPlan,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}




