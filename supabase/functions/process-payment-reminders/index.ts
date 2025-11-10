import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://gdhgsmccaqycmvxxoaif.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔍 Processing payment reminders for installments due in 7 days...')

    // Find installments due in exactly 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const sevenDaysFromNowStr = sevenDaysFromNow.toISOString().split('T')[0] // YYYY-MM-DD

    // Query installments due in 7 days
    const { data: installments, error: queryError } = await supabase
      .from('installments')
      .select(`
        id,
        installment_number,
        amount,
        due_date,
        payment_link,
        status,
        onboarding_data:onboarding_id (
          user_id,
          email,
          first_name,
          last_name,
          university_name,
          payment_plan
        )
      `)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .lte('due_date', sevenDaysFromNowStr)
      .not('onboarding_data.email', 'is', null)

    if (queryError) {
      console.error('❌ Error querying installments:', queryError)
      throw queryError
    }

    console.log(`📊 Found ${installments?.length || 0} installments due in 7 days`)

    if (!installments || installments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No installments due in 7 days',
          remindersSent: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Check which reminders have already been sent today
    const today = new Date().toISOString().split('T')[0]
    const { data: sentReminders } = await supabase
      .from('payment_reminders')
      .select('installment_id')
      .eq('reminder_type', '7_days_before')
      .gte('sent_at', `${today}T00:00:00Z`)
      .lt('sent_at', `${today}T23:59:59Z`)

    const sentInstallmentIds = new Set(
      sentReminders?.map(r => r.installment_id) || []
    )

    // Filter out installments that already have reminders sent today
    const installmentsToRemind = installments.filter(inst => {
      const dueDate = new Date(inst.due_date)
      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      // Only process if exactly 7 days away and reminder not sent today
      return daysUntilDue === 7 && !sentInstallmentIds.has(inst.id)
    })

    console.log(`📧 Sending ${installmentsToRemind.length} payment reminders...`)

    const supabaseFunctionUrl = `${supabaseUrl}/functions/v1/send-payment-reminder`
    let remindersSent = 0
    let remindersFailed = 0
    const errors: string[] = []

    // Send reminder for each installment
    for (const installment of installmentsToRemind) {
      try {
        const onboardingData = installment.onboarding_data as any
        
        if (!onboardingData || !onboardingData.email) {
          console.warn(`⚠️ Skipping installment ${installment.id}: no email address`)
          continue
        }

        const dueDate = new Date(installment.due_date)
        const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

        // Call the send-payment-reminder edge function
        const reminderResponse = await fetch(supabaseFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            email: onboardingData.email,
            firstName: onboardingData.first_name || 'Student',
            lastName: onboardingData.last_name || '',
            universityName: onboardingData.university_name || 'University',
            installmentNumber: installment.installment_number,
            amount: parseFloat(installment.amount.toString()),
            dueDate: installment.due_date,
            paymentLink: installment.payment_link || null,
            daysUntilDue: daysUntilDue,
          }),
        })

        if (reminderResponse.ok) {
          // Record the reminder in the database
          await supabase.from('payment_reminders').insert({
            installment_id: installment.id,
            reminder_type: '7_days_before',
            email_sent_to: onboardingData.email,
            days_until_due: daysUntilDue,
          })

          remindersSent++
          console.log(`✅ Reminder sent for installment #${installment.installment_number} to ${onboardingData.email}`)
        } else {
          const errorData = await reminderResponse.json()
          remindersFailed++
          errors.push(`Installment ${installment.id}: ${errorData.error || 'Unknown error'}`)
          console.error(`❌ Failed to send reminder for installment ${installment.id}:`, errorData)
        }
      } catch (error) {
        remindersFailed++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Installment ${installment.id}: ${errorMsg}`)
        console.error(`❌ Error processing installment ${installment.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        remindersFailed,
        totalProcessed: installmentsToRemind.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Error in process-payment-reminders function:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

