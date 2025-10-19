import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export async function POST(req: Request) {
  try {
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

    // Calculate payment amounts based on plan
    const paymentPlans = {
      basic: { feePercentage: 0.055, upfrontPayments: 1, remainingPayments: 4, totalPayments: 5 }, // 5.5% fee
      premium: { feePercentage: 0.065, upfrontPayments: 1, remainingPayments: 6, totalPayments: 7 }, // 6.5% fee
      flexible: { feePercentage: 0.08, upfrontPayments: 1, remainingPayments: 8, totalPayments: 9 } // 8% fee
    }

    const plan = paymentPlans[paymentPlan as keyof typeof paymentPlans]
    if (!plan) {
      return NextResponse.json({ error: 'Invalid payment plan' }, { status: 400 })
    }

    const tuitionAmountNum = parseFloat(tuitionAmount)
    const adminFeeAmount = tuitionAmountNum * plan.feePercentage // Calculate percentage-based fee
    const totalAmount = tuitionAmountNum + adminFeeAmount
    
    // Calculate payment amounts - split total amount evenly across all payments
    const paymentAmount = totalAmount / plan.totalPayments
    const upfrontPaymentAmount = Math.round(paymentAmount * 100) // First payment is total amount divided by total payments
    const remainingPaymentAmount = Math.round(paymentAmount * 100) // Remaining payments are the same amount

    // Create or retrieve Stripe customer
    let customer: Stripe.Customer
    try {
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        customer = await stripe.customers.create({
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
            university: universityName
          }
        })
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    })

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create subscription with custom billing cycle
    // First create a product
    const product = await stripe.products.create({
      name: `Tuition Payment Plan - ${universityName}`,
      description: `${paymentPlan} plan (${plan.upfrontPayments}+${plan.remainingPayments} payments)`,
      metadata: {
        userId: userId,
        studentId: studentId,
        university: universityName,
        paymentPlan: paymentPlan
      }
    })

        // Then create a price for the product (for remaining payments - admin fee installments)
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: remainingPaymentAmount, // This is the admin fee divided by remaining payments
          currency: 'usd',
          recurring: {
            interval: 'month',
            interval_count: 1
          },
          metadata: {
            tuitionAmount: tuitionAmount,
            adminFee: adminFeeAmount.toString(),
            totalPayments: plan.totalPayments.toString(),
            upfrontPayment: upfrontPaymentAmount.toString(),
            remainingPaymentAmount: remainingPaymentAmount.toString()
          }
        })

    // First, charge the upfront payment (tuition amount)
    const upfrontPaymentIntent = await stripe.paymentIntents.create({
      amount: upfrontPaymentAmount,
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirm: true,
      description: `Tuition Payment - Installment 1 of ${plan.totalPayments} - ${universityName}`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userId: userId,
        studentId: studentId,
        university: universityName,
        paymentPlan: paymentPlan,
        paymentType: 'installment_1'
      }
    })

    if (upfrontPaymentIntent.status !== 'succeeded') {
      throw new Error('Upfront payment failed')
    }

    // Create subscription for remaining payments (admin fee installments)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: price.id,
        quantity: plan.remainingPayments // Only charge for remaining payments
      }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      metadata: {
        userId: userId,
        studentId: studentId,
        university: universityName,
        paymentPlan: paymentPlan,
        tuitionAmount: tuitionAmount,
        adminFee: adminFeeAmount.toString(),
        totalAmount: totalAmount.toString(),
        totalPayments: plan.totalPayments.toString(),
        upfrontPaymentAmount: upfrontPaymentAmount.toString(),
        remainingPaymentAmount: remainingPaymentAmount.toString()
      }
    })

    // Check if subscription was created successfully
    if (!subscription || subscription.status !== 'active') {
      throw new Error('Failed to create active subscription')
    }

    // Save onboarding data to Supabase
    const supabase = createServiceClient()
    
    // Create payment records in payments table
    const paymentRecords = []
    
    // First payment (upfront)
    paymentRecords.push({
      user_id: userId,
      amount: upfrontPaymentAmount / 100, // Convert from cents to dollars
      payment_plan: paymentPlan,
      status: 'succeeded', // Already charged
      payment_type: 'installment_1',
      stripe_payment_intent_id: upfrontPaymentIntent.id,
      due_date: new Date().toISOString()
    })
    
    // Create payment records for remaining installments
    for (let i = 2; i <= plan.totalPayments; i++) {
      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + (i - 1))
      
      paymentRecords.push({
        user_id: userId,
        amount: remainingPaymentAmount / 100, // Convert from cents to dollars
        payment_plan: paymentPlan,
        status: 'pending',
        payment_type: `installment_${i}`,
        due_date: dueDate.toISOString()
      })
    }
    
    // Insert payment records
    const { error: paymentError } = await supabase
      .from('payments')
      .insert(paymentRecords)
    
    if (paymentError) {
      console.error('Error creating payment records:', paymentError)
    } else {
      console.log('Payment records created successfully')
    }

    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_data')
      .insert({
        user_id: userId,
        university_name: universityName,
        tuition_amount: tuitionAmountNum,
        admin_fee: adminFeeAmount,
        total_amount: totalAmount,
        student_id: studentId,
        student_email: studentEmail,
        payment_plan: paymentPlan,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        stripe_payment_method_id: paymentMethodId,
        status: 'active',
        // Personal Information
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        address: address,
        city: city,
        state: state,
        zip_code: zipCode,
        country: country,
        // Emergency Contact
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_relationship: emergencyContactRelationship,
        // Banking Information
        bank_name: bankName,
        account_number: accountNumber,
        routing_number: routingNumber,
        account_type: accountType
      })
      .select()
      .single()

    if (onboardingError) {
      console.error('Error saving onboarding data:', onboardingError)
      // Cancel subscription if database save fails
      await stripe.subscriptions.cancel(subscription.id)
      return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
    }

    // Create installment schedule
    const installments = []
    const currentDate = new Date()
    
    // First payment (upfront tuition - already paid)
    installments.push({
      onboarding_id: onboardingData.id,
      installment_number: 1,
      amount: upfrontPaymentAmount / 100, // Store tuition amount in dollars
      due_date: currentDate.toISOString(),
      status: 'paid', // Mark as paid since upfront payment succeeded
      stripe_payment_intent_id: upfrontPaymentIntent.id,
      stripe_invoice_id: null,
      created_at: currentDate.toISOString()
    })

    // Remaining payments
    for (let i = 2; i <= plan.totalPayments; i++) {
      const dueDate = new Date(currentDate)
      dueDate.setMonth(dueDate.getMonth() + (i - 1))
      
      installments.push({
        onboarding_id: onboardingData.id,
        installment_number: i,
        amount: remainingPaymentAmount / 100, // Store admin fee installment in dollars
        due_date: dueDate.toISOString(),
        status: 'scheduled',
        stripe_payment_intent_id: null,
        stripe_invoice_id: null,
        created_at: currentDate.toISOString()
      })
    }

    const { error: installmentsError } = await supabase
      .from('installments')
      .insert(installments)

    if (installmentsError) {
      console.error('Error creating installments:', installmentsError)
      // Note: We don't cancel subscription here as the main data is saved
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      onboardingId: onboardingData.id,
      productId: product.id,
      priceId: price.id,
      message: 'Subscription created successfully'
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create subscription' 
    }, { status: 500 })
  }
}
