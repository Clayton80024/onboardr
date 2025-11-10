import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderData {
  email: string
  firstName: string
  lastName: string
  universityName: string
  installmentNumber: number
  amount: number
  dueDate: string
  paymentLink?: string
  daysUntilDue: number
}

function generateReminderEmailHTML(data: ReminderData, appUrl: string): string {
  const formattedDueDate = new Date(data.dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder - Installo</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Payment Reminder ⏰</h1>
              <p style="margin: 10px 0 0; color: #fef3c7; font-size: 16px;">Your installment is due in ${data.daysUntilDue} ${data.daysUntilDue === 1 ? 'day' : 'days'}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Hi ${data.firstName},</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">This is a friendly reminder that your installment payment is coming up soon.</p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">Payment Details</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                  <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">University:</td><td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.universityName}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Installment #:</td><td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.installmentNumber}</td></tr>
                  <tr style="border-top: 1px solid #fde68a;"><td style="padding: 12px 0 8px; color: #6b7280; font-size: 14px;">Amount Due:</td><td style="padding: 12px 0 8px; color: #111827; font-size: 16px; font-weight: 700; text-align: right;">$${data.amount.toFixed(2)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date:</td><td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formattedDueDate}</td></tr>
                </table>
              </div>

              ${data.paymentLink ? `
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 15px; color: #1e40af; font-size: 14px; font-weight: 600;">💳 Ready to Pay?</p>
                <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">Click the button below to complete your payment securely via ACH.</p>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr><td style="text-align: center;"><a href="${data.paymentLink}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Pay Now</a></td></tr>
                </table>
              </div>
              ` : `
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 15px; color: #1e40af; font-size: 14px; font-weight: 600;">💳 Ready to Pay?</p>
                <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">Visit your dashboard to complete your payment.</p>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr><td style="text-align: center;"><a href="${appUrl}/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Go to Dashboard</a></td></tr>
                </table>
              </div>
              `}

              <p style="margin: 20px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The Installo Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Installo. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const data: ReminderData = await req.json()

    // Validate required fields
    if (!data.email || !data.firstName || !data.amount || !data.dueDate) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: email, firstName, amount, and dueDate are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Resend configuration from environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@notifications.tryinstallo.com'
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://tryinstallo.com'

    console.log('📧 Payment Reminder - Starting...')
    console.log('📧 To:', data.email)
    console.log('📧 Installment #:', data.installmentNumber)
    console.log('📧 Amount:', data.amount)
    console.log('📧 Due Date:', data.dueDate)
    console.log('📧 Days Until Due:', data.daysUntilDue)

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not set in Supabase Edge Functions environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          message: 'RESEND_API_KEY not set in Edge Functions environment variables'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate email HTML
    const emailHTML = generateReminderEmailHTML(data, appUrl)

    // Send email via Resend API
    console.log('📧 Sending payment reminder email via Resend API...')
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [data.email],
        subject: `Payment Reminder: Installment #${data.installmentNumber} due in ${data.daysUntilDue} ${data.daysUntilDue === 1 ? 'day' : 'days'}`,
        html: emailHTML,
      }),
    })

    console.log('📧 Resend API response status:', resendResponse.status)

    if (resendResponse.ok) {
      const emailData = await resendResponse.json()
      console.log('✅ Payment reminder email sent successfully:', emailData.id)
      return new Response(
        JSON.stringify({
          success: true,
          messageId: emailData.id,
          message: 'Payment reminder email sent successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      const errorText = await resendResponse.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      console.error('❌ Failed to send payment reminder email:', errorData)
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: errorData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: resendResponse.status,
        }
      )
    }

  } catch (error) {
    console.error('❌ Error in send-payment-reminder function:', error)
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

