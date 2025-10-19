import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

interface StripeEvent {
  id: string
  type: string
  data: {
    object: any
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = 'https://gdhgsmccaqycmvxxoaif.supabase.co'
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    let event: StripeEvent

    if (!webhookSecret) {
      console.log('Webhook secret not configured - skipping signature verification')
      event = JSON.parse(body)
    } else {
      // Import Stripe for signature verification
      const stripe = await import('https://esm.sh/stripe@19.1.0')
      const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY')!, {
        apiVersion: '2025-09-30.clover',
      })

      try {
        event = await stripeClient.webhooks.constructEventAsync(
          body,
          signature,
          webhookSecret
        ) as StripeEvent
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, supabase)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object, supabase)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabase)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handlePaymentIntentSucceeded(paymentIntent: any, supabase: any) {
  console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`)
  
  try {
    // Update payments table
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
    
    if (paymentError) {
      console.error('Error updating payment:', paymentError)
    } else {
      console.log('Payment record updated successfully')
    }

    // Also update installments table for backward compatibility
    const { error: installmentError } = await supabase
      .from('installments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
    
    if (installmentError) {
      console.error('Error updating installment:', installmentError)
    }
  } catch (error) {
    console.error('Error processing payment_intent.succeeded:', error)
  }
}

async function handlePaymentIntentFailed(failedPayment: any, supabase: any) {
  console.log(`PaymentIntent ${failedPayment.id} failed!`)
  
  try {
    // Update payments table
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        stripe_payment_intent_id: failedPayment.id,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', failedPayment.id)
    
    if (paymentError) {
      console.error('Error updating failed payment:', paymentError)
    } else {
      console.log('Failed payment record updated successfully')
    }

    // Also update installments table for backward compatibility
    const { error: installmentError } = await supabase
      .from('installments')
      .update({
        status: 'failed',
        failure_reason: failedPayment.last_payment_error?.message || 'Payment failed'
      })
      .eq('stripe_payment_intent_id', failedPayment.id)
    
    if (installmentError) {
      console.error('Error updating failed installment:', installmentError)
    }
  } catch (error) {
    console.error('Error processing payment_intent.payment_failed:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: any, supabase: any) {
  console.log(`Invoice payment succeeded for ${invoice.id}`)
  
  try {
    const { error } = await supabase
      .from('installments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_invoice_id: invoice.id
      })
      .eq('stripe_invoice_id', invoice.id)
    
    if (error) {
      console.error('Error updating invoice installment:', error)
    }
  } catch (error) {
    console.error('Error processing invoice.payment_succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  console.log(`Invoice payment failed for ${invoice.id}`)
  
  try {
    const { error } = await supabase
      .from('installments')
      .update({
        status: 'failed',
        failure_reason: 'Invoice payment failed'
      })
      .eq('stripe_invoice_id', invoice.id)
    
    if (error) {
      console.error('Error updating failed invoice installment:', error)
    }
  } catch (error) {
    console.error('Error processing invoice.payment_failed:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  console.log(`Subscription ${subscription.id} was cancelled`)
  
  try {
    const { error } = await supabase
      .from('onboarding_data')
      .update({
        status: 'cancelled'
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (error) {
      console.error('Error updating cancelled subscription:', error)
    }
  } catch (error) {
    console.error('Error processing subscription.deleted:', error)
  }
}
