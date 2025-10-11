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
    const onboardingId = searchParams.get('onboardingId')

    if (!onboardingId) {
      return NextResponse.json({ error: 'Onboarding ID is required' }, { status: 400 })
    }

    // Create Supabase service client
    const supabase = createServiceClient()

    // First verify the user owns this onboarding record
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_data')
      .select('id')
      .eq('id', onboardingId)
      .eq('user_id', userId)
      .single()

    if (onboardingError || !onboardingData) {
      return NextResponse.json({ error: 'Onboarding data not found or access denied' }, { status: 404 })
    }

    // Fetch installments for this onboarding
    const { data: installments, error } = await supabase
      .from('installments')
      .select('*')
      .eq('onboarding_id', onboardingId)
      .order('installment_number', { ascending: true })

    if (error) {
      console.error('Installments fetch error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch installments',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      data: installments || []
    })

  } catch (error) {
    console.error('Installments API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
