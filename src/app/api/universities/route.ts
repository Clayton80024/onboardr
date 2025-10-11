import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const country = searchParams.get('country')
    
    const supabase = createClient()
    
    let query = supabase
      .from('universities')
      .select('id, name, short_name, city, state, country, logo_url, website_url')
      .eq('is_active', true)
      .order('name')
    
    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,short_name.ilike.%${search}%`)
    }
    
    // Add country filter if provided
    if (country) {
      query = query.eq('country', country)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching universities:', error)
      return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 })
    }
    
    return NextResponse.json({ universities: data })
  } catch (error) {
    console.error('Error in universities API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
