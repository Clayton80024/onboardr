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

    const { searchParams } = new URL(request.url)
    const onboardingId = searchParams.get('id')

    if (!onboardingId) {
      return NextResponse.json({ error: 'Onboarding ID is required' }, { status: 400 })
    }

    // Create Supabase service client
    const supabase = createServiceClient()

    // Fetch onboarding data
    const { data: onboardingData, error } = await supabase
      .from('onboarding_data')
      .select('*')
      .eq('id', onboardingId)
      .eq('user_id', userId) // Ensure user can only access their own data
      .single()

    if (error) {
      console.error('Onboarding data fetch error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch onboarding data',
        details: error.message 
      }, { status: 500 })
    }

    if (!onboardingData) {
      return NextResponse.json({ error: 'Onboarding data not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      data: onboardingData
    })

  } catch (error) {
    console.error('Onboarding data API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
