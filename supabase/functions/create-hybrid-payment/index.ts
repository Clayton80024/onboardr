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
    console.log('📧 Received email for user:', email || 'NOT PROVIDED')
    console.log('📧 Received userId:', userId || 'NOT PROVIDED')
    console.log('📧 Received firstName:', firstName || 'NOT PROVIDED')

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

    // Send onboarding completion email to Clerk sign-up email (non-blocking)
    // The email variable contains the Clerk user's sign-up email address
    console.log(`📧 Email sending check - email variable: ${email || 'MISSING'}`)
    console.log(`📧 Email sending check - userId: ${userId || 'MISSING'}`)
    
    if (!email) {
      console.error('❌ No email address available for sending onboarding email')
      console.error('❌ Email variable is empty or undefined')
    } else {
      try {
        console.log(`📧 Sending onboarding email to Clerk user: ${email}`)
        
        // Get Resend configuration from environment variables
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@notifications.tryinstallo.com'
        const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://tryinstallo.com'
        
        if (!resendApiKey) {
          console.error('❌ RESEND_API_KEY not set in Supabase Edge Functions environment variables')
          console.error('❌ Email will not be sent. Please add RESEND_API_KEY to Supabase Edge Functions settings')
          console.error('❌ Go to: Supabase Dashboard → Edge Functions → Settings → Add RESEND_API_KEY')
        } else {
          console.log(`✅ RESEND_API_KEY found: ${resendApiKey.substring(0, 10)}...`)
          // Generate email HTML
          const planNames = {
            basic: 'Fast Track (1+4 payments)',
            premium: 'Most Popular (1+6 payments)',
            flexible: 'Flexible (1+8 payments)'
          }
          const planName = planNames[paymentPlan as keyof typeof planNames] || paymentPlan
          
          const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Installo!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to Installo! 🎓</h1>
              <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">Your payment plan has been activated</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Congratulations! Your tuition payment plan has been successfully set up. We're excited to help you manage your payments with flexibility and ease.</p>
              <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">Payment Plan Summary</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                  <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">University:</td><td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${universityName}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Student ID:</td><td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${studentId}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Plan:</td><td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${planName}</td></tr>
                  <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 12px 0 8px; color: #6b7280; font-size: 14px;">Tuition Amount:</td><td style="padding: 12px 0 8px; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">$${tuition.toFixed(2)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Admin Fee:</td><td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">$${adminFee.toFixed(2)}</td></tr>
                  <tr style="border-top: 2px solid #e5e7eb;"><td style="padding: 12px 0 0; color: #111827; font-size: 16px; font-weight: 700;">Total Amount:</td><td style="padding: 12px 0 0; color: #10b981; font-size: 18px; font-weight: 700; text-align: right;">$${totalAmount.toFixed(2)}</td></tr>
                </table>
              </div>
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">Payment Schedule</h2>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;"><strong style="color: #10b981;">✅ First Payment (Paid):</strong> $${installmentAmount.toFixed(2)}</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong style="color: #3b82f6;">📅 Remaining Payments:</strong> ${plan.remainingPayments} × $${installmentAmount.toFixed(2)} each</p>
              </div>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr><td style="text-align: center;"><a href="${appUrl}/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Dashboard</a></td></tr>
              </table>
              <p style="margin: 20px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The Installo Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Installo. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `
          
          // Send email via Resend API
          console.log(`📧 Attempting to send email via Resend API...`)
          console.log(`📧 From: ${resendFromEmail}`)
          console.log(`📧 To: ${email}`)
          console.log(`📧 API Key present: ${!!resendApiKey}`)
          
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: resendFromEmail,
              to: [email],
              subject: 'Welcome to Installo! Your payment plan is ready 🎓',
              html: emailHTML,
            }),
          })

          console.log(`📧 Resend API response status: ${resendResponse.status}`)
          
          if (resendResponse.ok) {
            const emailData = await resendResponse.json()
            console.log(`✅ Onboarding email sent successfully to ${email}`)
            console.log(`✅ Email ID: ${emailData.id}`)
          } else {
            const errorText = await resendResponse.text()
            let errorData
            try {
              errorData = JSON.parse(errorText)
            } catch {
              errorData = { error: errorText }
            }
            console.error(`❌ Failed to send onboarding email to ${email}`)
            console.error(`❌ Status: ${resendResponse.status}`)
            console.error(`❌ Error:`, JSON.stringify(errorData, null, 2))
          }
        }
      } catch (emailError) {
        console.error(`❌ Exception while sending onboarding email to ${email}:`)
        console.error(`❌ Error type: ${emailError.constructor.name}`)
        console.error(`❌ Error message: ${emailError.message}`)
        console.error(`❌ Error stack:`, emailError.stack)
        // Don't fail the entire request if email fails
      }
    }

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
