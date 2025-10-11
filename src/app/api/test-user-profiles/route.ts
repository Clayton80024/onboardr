import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing user_profiles table...')
    
    const supabase = createClient()
    
    // Test if user_profiles table exists and is accessible
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)

    if (error) {
      console.error('user_profiles table error:', error)
      return NextResponse.json({ 
        error: 'user_profiles table issue',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('user_profiles table accessible, found', data?.length || 0, 'records')

    // Test table structure by trying to insert a test record (then delete it)
    const testData = {
      user_id: 'test_user_' + Date.now(),
      university_name: 'Test University',
      payment_plan: 'basic',
      tuition_amount: 1000.00,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
    }

    console.log('Testing insert with data:', testData)
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert(testData)
      .select()

    if (insertError) {
      console.error('Insert test failed:', insertError)
      return NextResponse.json({ 
        error: 'Insert test failed',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint,
        testData: testData
      }, { status: 500 })
    }

    console.log('Insert test successful:', insertData)

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testData.user_id)

    if (deleteError) {
      console.warn('Failed to clean up test data:', deleteError)
    } else {
      console.log('Test data cleaned up successfully')
    }

    return NextResponse.json({ 
      success: true,
      message: 'user_profiles table working correctly',
      tableAccessible: true,
      insertTestPassed: true,
      testData: testData
    })

  } catch (error) {
    console.error('user_profiles test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}





