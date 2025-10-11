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

    // Check if user has completed onboarding by looking for onboarding_data record
    const { data: onboardingData, error } = await supabase
      .from('onboarding_data')
      .select('id, status, created_at')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Onboarding data fetch error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch onboarding data',
        details: error.message 
      }, { status: 500 })
    }

    // If onboarding_data exists and status is 'active', onboarding is completed
    const onboardingCompleted = onboardingData && onboardingData.status === 'active'

    console.log('Onboarding status check:', {
      userId,
      onboardingData,
      onboardingCompleted
    })

    return NextResponse.json({ 
      onboardingCompleted,
      completedAt: onboardingData?.created_at || null,
      onboardingId: onboardingData?.id || null
    })

  } catch (error) {
    console.error('Onboarding check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
