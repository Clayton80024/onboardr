import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`)
      
      // Update installment status in database
      try {
        const supabase = createServiceClient()
        const supabase = createServiceClient()
        const { error } = await supabase
          .from('installments')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntent.id
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        if (error) {
          console.error('Error updating installment:', error)
        }
      } catch (error) {
        console.error('Error processing payment_intent.succeeded:', error)
      }
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object
      console.log(`PaymentIntent ${failedPayment.id} failed!`)
      
      // Update installment status to failed
      try {
        const supabase = createServiceClient()
        const { error } = await supabase
          .from('installments')
          .update({
            status: 'failed',
            failure_reason: failedPayment.last_payment_error?.message || 'Payment failed'
          })
          .eq('stripe_payment_intent_id', failedPayment.id)
        
        if (error) {
          console.error('Error updating failed installment:', error)
        }
      } catch (error) {
        console.error('Error processing payment_intent.payment_failed:', error)
      }
      break

    case 'invoice.payment_succeeded':
      const invoicePaymentSucceeded = event.data.object
      console.log(`Invoice payment succeeded for ${invoicePaymentSucceeded.id}`)
      
      // Update installment status for subscription payments
      try {
        const supabase = createServiceClient()
        const { error } = await supabase
          .from('installments')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_invoice_id: invoicePaymentSucceeded.id
          })
          .eq('stripe_invoice_id', invoicePaymentSucceeded.id)
        
        if (error) {
          console.error('Error updating invoice installment:', error)
        }
      } catch (error) {
        console.error('Error processing invoice.payment_succeeded:', error)
      }
      break

    case 'invoice.payment_failed':
      const invoicePaymentFailed = event.data.object
      console.log(`Invoice payment failed for ${invoicePaymentFailed.id}`)
      
      // Update installment status to failed
      try {
        const supabase = createServiceClient()
        const { error } = await supabase
          .from('installments')
          .update({
            status: 'failed',
            failure_reason: 'Invoice payment failed'
          })
          .eq('stripe_invoice_id', invoicePaymentFailed.id)
        
        if (error) {
          console.error('Error updating failed invoice installment:', error)
        }
      } catch (error) {
        console.error('Error processing invoice.payment_failed:', error)
      }
      break

    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object
      console.log(`Subscription ${subscriptionDeleted.id} was cancelled`)
      
      // Update onboarding status
      try {
        const supabase = createServiceClient()
        const { error } = await supabase
          .from('onboarding_data')
          .update({
            status: 'cancelled'
          })
          .eq('stripe_subscription_id', subscriptionDeleted.id)
        
        if (error) {
          console.error('Error updating cancelled subscription:', error)
        }
      } catch (error) {
        console.error('Error processing subscription.deleted:', error)
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}




