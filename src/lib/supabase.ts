import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side supabase client
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Server-side supabase client function (for API routes)
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Server-side supabase client with service role (bypasses RLS)
export const createServiceClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface UserProfile {
  id: string
  clerk_user_id: string
  university_id: string
  university_name: string
  tuition_amount: number
  student_id: string
  student_email: string
  payment_plan: 'monthly' | 'semester' | 'yearly'
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  stripe_payment_intent_id: string
  amount: number
  status: 'pending' | 'succeeded' | 'failed'
  created_at: string
}

export interface University {
  id: string
  name: string
  short_name: string | null
  city: string
  state: string
  country: string
  logo_url: string | null
  website_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}



