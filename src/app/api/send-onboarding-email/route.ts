import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OnboardingEmailData {
  email: string
  firstName: string
  lastName: string
  universityName: string
  tuitionAmount: number
  adminFee: number
  totalAmount: number
  paymentPlan: string
  installmentAmount: number
  totalPayments: number
  remainingPayments: number
  studentId: string
  studentEmail: string
}

function getPlanDisplayName(planId: string): string {
  const planNames: Record<string, string> = {
    basic: 'Fast Track (1+4 payments)',
    premium: 'Most Popular (1+6 payments)',
    flexible: 'Flexible (1+8 payments)'
  }
  return planNames[planId] || planId
}

function generateEmailHTML(data: OnboardingEmailData): string {
  const planName = getPlanDisplayName(data.paymentPlan)
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Installo!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to Installo! 🎓</h1>
              <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">Your payment plan has been activated</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${data.firstName},
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Congratulations! Your tuition payment plan has been successfully set up. We're excited to help you manage your payments with flexibility and ease.
              </p>
              
              <!-- Payment Summary Card -->
              <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">Payment Plan Summary</h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">University:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.universityName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Student ID:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.studentId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Plan:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${planName}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0 8px; color: #6b7280; font-size: 14px;">Tuition Amount:</td>
                    <td style="padding: 12px 0 8px; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">$${data.tuitionAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Admin Fee:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">$${data.adminFee.toFixed(2)}</td>
                  </tr>
                  <tr style="border-top: 2px solid #e5e7eb;">
                    <td style="padding: 12px 0 0; color: #111827; font-size: 16px; font-weight: 700;">Total Amount:</td>
                    <td style="padding: 12px 0 0; color: #10b981; font-size: 18px; font-weight: 700; text-align: right;">$${data.totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Payment Schedule -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">Payment Schedule</h2>
                
                <div style="margin-bottom: 15px;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    <strong style="color: #10b981;">✅ First Payment (Paid):</strong> $${data.installmentAmount.toFixed(2)}
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    <strong style="color: #3b82f6;">📅 Remaining Payments:</strong> ${data.remainingPayments} × $${data.installmentAmount.toFixed(2)} each
                  </p>
                </div>
                
                <p style="margin: 15px 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Your first payment has been processed successfully. You'll receive payment links for your remaining installments via email when they're due.
                </p>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">What's Next?</h2>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  <li>Access your dashboard to view payment details and history</li>
                  <li>You'll receive email notifications for upcoming payments</li>
                  <li>Pay remaining installments via secure ACH payment links</li>
                  <li>Track your payment progress in real-time</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${dashboardUrl}/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Dashboard</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
              </p>
              
              <p style="margin: 20px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>The Installo Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                This email was sent to ${data.email} (${data.studentEmail})
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Installo. All rights reserved.
              </p>
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

export async function POST(request: NextRequest) {
  try {
    const data: OnboardingEmailData = await request.json()

    // Validate required fields
    if (!data.email || !data.firstName || !data.universityName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, firstName, and universityName are required' },
        { status: 400 }
      )
    }

    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Get the from email address (should be a verified domain in Resend)
    // Default to notifications.tryinstallo.com domain if not specified
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@notifications.tryinstallo.com'

    // Send email
    const { data: emailData, error } = await resend.emails.send({
      from: fromEmail,
      to: [data.email],
      subject: `Welcome to Installo! Your payment plan is ready 🎓`,
      html: generateEmailHTML(data),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    console.log('✅ Onboarding email sent successfully:', emailData?.id)

    return NextResponse.json({
      success: true,
      messageId: emailData?.id,
      message: 'Onboarding email sent successfully'
    })

  } catch (error) {
    console.error('Error sending onboarding email:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

