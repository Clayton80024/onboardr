import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = await import('https://esm.sh/stripe@19.1.0')
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-09-30.clover',
    })

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      paymentMethodId, 
      tuitionAmount, 
      paymentPlan, 
      universityName,
      studentId,
      studentEmail,
      userId,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      bankName,
      accountNumber,
      routingNumber,
      accountType
    } = await req.json()

    console.log('🚀 Creating hybrid payment system...')

    // Calculate payment amounts based on plan
    const paymentPlans = {
      basic: { feePercentage: 0.055, upfrontPayments: 1, remainingPayments: 4, totalPayments: 5 }, // 5.5% fee
      premium: { feePercentage: 0.065, upfrontPayments: 1, remainingPayments: 6, totalPayments: 7 }, // 6.5% fee
      flexible: { feePercentage: 0.075, upfrontPayments: 1, remainingPayments: 8, totalPayments: 9 } // 7.5% fee
    }

    const plan = paymentPlans[paymentPlan as keyof typeof paymentPlans]
    if (!plan) {
      throw new Error('Invalid payment plan')
    }

    const tuition = parseFloat(tuitionAmount)
    const adminFee = tuition * plan.feePercentage
    const totalAmount = tuition + adminFee
    const installmentAmount = totalAmount / plan.totalPayments

    console.log(`📊 Payment calculation: Tuition: $${tuition}, Admin Fee: $${adminFee.toFixed(2)}, Total: $${totalAmount.toFixed(2)}, Installment: $${installmentAmount.toFixed(2)}`)

    // Create Stripe customer
    const customer = await stripeClient.customers.create({
      email: email,
      name: `${firstName} ${lastName}`,
      phone: phoneNumber,
      address: {
        line1: address,
        city: city,
        state: state,
        postal_code: zipCode,
        country: country
      },
      metadata: {
        userId: userId,
        studentId: studentId,
        university: universityName,
        paymentPlan: paymentPlan
      }
    })

    console.log(`👤 Created Stripe customer: ${customer.id}`)

    // Attach payment method to customer
    await stripeClient.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    })

    console.log(`💳 Attached payment method: ${paymentMethodId}`)

    // HYBRID PAYMENT SYSTEM: First payment via credit card
    const upfrontPaymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(installmentAmount * 100), // First installment amount
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Only allow card payments, no redirects
      },
      metadata: {
        userId: userId,
        studentId: studentId,
        university: universityName,
        paymentPlan: paymentPlan,
        installmentNumber: '1',
        paymentMethod: 'card'
      }
    })

    // Confirm the payment intent
    const confirmedPaymentIntent = await stripeClient.paymentIntents.confirm(upfrontPaymentIntent.id)

    console.log(`💳 Created and confirmed upfront payment intent: ${confirmedPaymentIntent.id}`)

    // Generate ACH payment links for remaining installments
    const paymentLinks = []
    const currentDate = new Date()
    
    for (let i = 2; i <= plan.totalPayments; i++) {
      // Calculate due date for this installment (monthly payments)
      const dueDate = new Date(currentDate)
      dueDate.setMonth(dueDate.getMonth() + (i - 1)) // Installment 2 = 1 month from now, etc.
      
      // Set expiration to 7 days after due date (grace period)
      const expiresAt = new Date(dueDate)
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days grace period after due date
      
      const paymentLink = await stripeClient.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${universityName} Tuition Payment - Installment ${i}`,
                description: `${paymentPlan.charAt(0).toUpperCase() + paymentPlan.slice(1)} payment plan installment ${i} of ${plan.totalPayments}`
              },
              unit_amount: Math.round(installmentAmount * 100)
            },
            quantity: 1
          }
        ],
        payment_method_types: ['us_bank_account'], // ACH only
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/dashboard?payment=success&installment=${i}`
          }
        },
        metadata: {
          userId: userId,
          studentId: studentId,
          university: universityName,
          paymentPlan: paymentPlan,
          installmentNumber: i.toString(),
          paymentMethod: 'ach'
        }
      })

      paymentLinks.push({
        installmentNumber: i,
        paymentLinkId: paymentLink.id,
        paymentLink: paymentLink.url,
        expiresAt: expiresAt.toISOString()
      })

      console.log(`🔗 Created ACH payment link for installment ${i}: ${paymentLink.url}`)
    }

    // Save onboarding data to Supabase
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_data')
      .insert({
        user_id: userId,
        university_name: universityName,
        tuition_amount: parseFloat(tuition.toString()),
        admin_fee: adminFee,
        total_amount: totalAmount,
        payment_plan: paymentPlan,
        stripe_customer_id: customer.id,
        stripe_subscription_id: null, // No subscription for hybrid payments
        stripe_payment_method_id: paymentMethodId,
        student_id: studentId,
        student_email: studentEmail,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        address: address,
        city: city,
        state: state,
        zip_code: zipCode,
        country: country,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_relationship: emergencyContactRelationship,
        bank_name: bankName,
        account_number: accountNumber,
        routing_number: routingNumber,
        account_type: accountType,
        status: 'active'
      })
      .select()
      .single()

    if (onboardingError) {
      console.error('❌ Error saving onboarding data:', onboardingError)
      console.error('❌ Onboarding data being inserted:', {
        user_id: userId,
        university_name: universityName,
        tuition_amount: tuition,
        admin_fee: adminFee,
        total_amount: totalAmount,
        payment_plan: paymentPlan,
        student_id: studentId,
        student_email: studentEmail,
        stripe_customer_id: customer.id,
        stripe_subscription_id: null,
        stripe_payment_method_id: paymentMethodId,
        status: 'active'
      })
      throw new Error(`Failed to save onboarding data: ${onboardingError.message}`)
    }

    console.log(`💾 Saved onboarding data: ${onboardingData.id}`)

    // Create installment records with ACH payment links
    const installments = []
    const currentDateForInstallments = new Date()
    
    // First installment (already paid via card)
    installments.push({
      onboarding_id: onboardingData.id,
      installment_number: 1,
      amount: installmentAmount,
      due_date: currentDateForInstallments.toISOString(),
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: 'card',
      stripe_payment_intent_id: confirmedPaymentIntent.id,
      created_at: new Date().toISOString()
    })
    
    // Remaining installments (ACH payment links)
    for (let i = 2; i <= plan.totalPayments; i++) {
      const dueDate = new Date(currentDateForInstallments)
      dueDate.setMonth(dueDate.getMonth() + i - 1)
      
      const paymentLink = paymentLinks.find(pl => pl.installmentNumber === i)
      
      installments.push({
        onboarding_id: onboardingData.id,
        installment_number: i,
        amount: installmentAmount,
        due_date: dueDate.toISOString(),
        status: 'pending',
        payment_method: 'ach',
        payment_link: paymentLink?.paymentLink,
        payment_link_id: paymentLink?.paymentLinkId,
        payment_link_expires_at: paymentLink?.expiresAt,
        created_at: new Date().toISOString()
      })
    }

    const { error: installmentsError } = await supabase
      .from('installments')
      .insert(installments)

    if (installmentsError) {
      console.error('❌ Error saving installments:', installmentsError)
      throw new Error('Failed to save installments')
    }

    console.log(`📅 Created ${installments.length} installment records`)

    // Create payment records
    const payments = installments.map(installment => ({
      user_id: userId,
      stripe_payment_intent_id: installment.stripe_payment_intent_id,
      amount: installment.amount,
      payment_plan: paymentPlan, // Required field
      status: installment.status === 'paid' ? 'succeeded' : installment.status, // Convert 'paid' to 'succeeded'
      due_date: installment.due_date, // Required field
      payment_type: `installment_${installment.installment_number}`,
      created_at: new Date().toISOString()
    }))

    const { error: paymentsError } = await supabase
      .from('payments')
      .insert(payments)

    if (paymentsError) {
      console.error('❌ Error saving payments:', paymentsError)
      console.error('❌ Payments data being inserted:', payments)
      throw new Error(`Failed to save payments: ${paymentsError.message}`)
    }

    console.log(`💳 Created ${payments.length} payment records`)

    return new Response(
      JSON.stringify({
        success: true,
        upfrontPaymentIntentId: confirmedPaymentIntent.id,
        clientSecret: confirmedPaymentIntent.client_secret,
        onboardingId: onboardingData.id,
        paymentLinks: paymentLinks,
        message: 'Hybrid payment system created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Error creating hybrid payment system:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create hybrid payment system',
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
