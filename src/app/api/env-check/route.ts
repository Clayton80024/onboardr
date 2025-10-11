import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    
    console.log('Environment check:')
    console.log('Supabase URL exists:', !!supabaseUrl)
    console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'NOT SET')
    console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
    console.log('Supabase Anon Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NOT SET')
    console.log('App URL exists:', !!appUrl)
    console.log('App URL:', appUrl || 'NOT SET')
    
    return NextResponse.json({
      supabaseUrlExists: !!supabaseUrl,
      supabaseAnonKeyExists: !!supabaseAnonKey,
      appUrlExists: !!appUrl,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : null,
      supabaseAnonKey: supabaseAnonKey ? supabaseAnonKey.substring(0, 30) + '...' : null,
      appUrl: appUrl || null
    })
  } catch (error) {
    return NextResponse.json({ error: 'Environment check failed' }, { status: 500 })
  }
}





