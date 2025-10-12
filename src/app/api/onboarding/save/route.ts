import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting onboarding save request...')
    
    // Get the authenticated user from Clerk
    const { userId } = await auth()
    console.log('User ID:', userId)
    
    if (!userId) {
      console.log('No user ID found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details from Clerk
    const user = await currentUser()

    // Parse the request body
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    const {
      university,
      universityId,
      universityName,
      paymentPlan,
      tuitionAmount,
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
    } = body

    // Validate required fields
    if (!university || !paymentPlan || !tuitionAmount) {
      return NextResponse.json({ 
        error: 'Missing required fields: university, paymentPlan, and tuitionAmount are required' 
      }, { status: 400 })
    }

    // Use Clerk user data as fallback for personal info
    const finalFirstName = firstName || user?.firstName || 'Unknown'
    const finalLastName = lastName || user?.lastName || 'User'
    const finalEmail = email || user?.emailAddresses[0]?.emailAddress || 'unknown@example.com'

    // Create Supabase client
    console.log('Creating Supabase client...')
    const supabase = createClient()
    console.log('Supabase client created successfully')

    // Prepare user profile data
    console.log('Preparing user profile data...')
    const userProfileData = {
      user_id: userId,
      university_id: universityId,
      university_name: universityName || university,
      payment_plan: paymentPlan,
      tuition_amount: parseFloat(tuitionAmount),
      first_name: finalFirstName,
      last_name: finalLastName,
      email: finalEmail,
      phone_number: phoneNumber || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
      country: country || 'United States',
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      emergency_contact_relationship: emergencyContactRelationship || null,
      bank_name: bankName || null,
      account_number: accountNumber || null,
      routing_number: routingNumber || null,
      account_type: accountType || 'checking',
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString()
    }

    // Insert or update user profile
    console.log('Attempting to save user profile data:', JSON.stringify(userProfileData, null, 2))
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(userProfileData, {
        onConflict: 'user_id'
      })
      .select()

    console.log('Profile save result:', { profileData, profileError })

    if (profileError) {
      console.error('Profile save error:', profileError)
      return NextResponse.json({ 
        error: 'Failed to save profile data',
        details: profileError.message,
        code: profileError.code
      }, { status: 500 })
    }

    // Create initial payment record if payment plan is not 'full'
    if (paymentPlan !== 'full') {
      console.log('Creating payment record for installment plan...')
      const paymentData = {
        user_id: userId, // This is the Clerk user ID
        amount: parseFloat(tuitionAmount),
        payment_plan: paymentPlan,
        status: 'pending',
        due_date: calculateDueDate(paymentPlan),
        payment_type: 'tuition'
      }

      console.log('Payment data:', JSON.stringify(paymentData, null, 2))
      const { error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData)

      if (paymentError) {
        console.error('Payment creation error:', paymentError)
        // Don't fail the entire request if payment creation fails
        console.warn('Profile saved but payment creation failed')
      } else {
        console.log('Payment record created successfully')
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding data saved successfully',
      profile: profileData?.[0]
    })

  } catch (error) {
    console.error('Onboarding save error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to calculate due date based on payment plan
function calculateDueDate(paymentPlan: string): string {
  const now = new Date()
  
  switch (paymentPlan) {
    case 'split':
      // Second payment due in 3 months
      return new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString()
    case 'monthly':
      // Next payment due in 1 month
      return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString()
    case 'quarterly':
      // Next payment due in 3 months
      return new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString()
    default:
      // Default to 1 month
      return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString()
  }
}
