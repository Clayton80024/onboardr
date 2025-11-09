import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase service client
    const supabase = createServiceClient()

    // Debug: Get all onboarding_data records for this user
    const { data: allOnboardingData, error: allError } = await supabase
      .from('onboarding_data')
      .select('*')
      .eq('user_id', userId)

    // Debug: Get the specific record
    const { data: onboardingData, error } = await supabase
      .from('onboarding_data')
      .select('id, status, created_at, user_id')
      .eq('user_id', userId)
      .single()

    // Debug: Check if any records exist
    const { count } = await supabase
      .from('onboarding_data')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({ 
      debug: {
        userId,
        allOnboardingData,
        onboardingData,
        onboardingDataExists: !!onboardingData,
        status: onboardingData?.status,
        onboardingCompleted: onboardingData && onboardingData.status === 'active',
        totalRecords: count,
        error: error?.message,
        allError: allError?.message
      }
    })

  } catch (error) {
    console.error('Debug onboarding error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

