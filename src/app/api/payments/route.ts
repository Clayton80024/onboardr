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

    // Fetch payments for this user
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Payments fetch error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch payments',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      data: payments || []
    })

  } catch (error) {
    console.error('Payments API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, payment_plan, payment_type, due_date } = body

    // Validate required fields
    if (!amount || !payment_plan) {
      return NextResponse.json({ 
        error: 'Amount and payment plan are required' 
      }, { status: 400 })
    }

    // Create Supabase service client
    const supabase = createServiceClient()

    // Create payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        payment_plan: payment_plan,
        status: 'pending',
        payment_type: payment_type || 'tuition',
        due_date: due_date || new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Payment creation error:', error)
      return NextResponse.json({ 
        error: 'Failed to create payment',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      data: payment
    })

  } catch (error) {
    console.error('Payment creation API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}













