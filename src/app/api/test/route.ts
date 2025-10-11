import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing API endpoint...')
    
    // Get the authenticated user from Clerk
    const { userId } = await auth()
    console.log('User ID:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'No user ID found' }, { status: 401 })
    }

    // Test Supabase connection
    console.log('Testing Supabase connection...')
    const supabase = createClient()
    
    // Test a simple query
    const { data, error } = await supabase
      .from('universities')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Supabase connection error:', error)
      return NextResponse.json({ 
        error: 'Supabase connection failed',
        details: error.message 
      }, { status: 500 })
    }

    console.log('Supabase connection successful')

    return NextResponse.json({ 
      success: true,
      message: 'API endpoint working',
      userId: userId,
      supabaseConnected: true
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}





