import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection without auth...')
    
    // Test Supabase connection
    const supabase = createClient()
    
    // Test a simple query to universities table
    const { data, error } = await supabase
      .from('universities')
      .select('id, name')
      .limit(3)

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ 
        error: 'Supabase query failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('Supabase query successful, found', data?.length || 0, 'universities')

    return NextResponse.json({ 
      success: true,
      message: 'Supabase connection working',
      universitiesFound: data?.length || 0,
      sampleData: data
    })

  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}





