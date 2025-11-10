# 📧 Resend Email Integration Setup

This guide explains how to set up the Resend.com email service to send onboarding completion emails.

## 🎯 Overview

When a user completes the onboarding process and their payment is successfully processed, an automated welcome email is sent to them with:
- Payment plan summary
- Payment schedule details
- Next steps and dashboard access
- Professional, branded email template

## 🚀 Quick Setup

### Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Verify your email address

### Step 2: Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Installo Production")
4. Copy the API key (starts with `re_`)

### Step 3: Verify Your Subdomain (Recommended for Production)

For production, you should verify your subdomain to avoid conflicts with other email services (like Zoho):

1. Go to **Domains** in the Resend dashboard
2. Click **Add Domain**
3. Enter your subdomain: `notifications.tryinstallo.com`
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

**Why use a subdomain?** This keeps your Resend email configuration separate from your main domain's email service (Zoho), avoiding DNS record conflicts.

**Note:** For testing, you can use the default `onboarding@resend.dev` email address without domain verification.

### Step 4: Set Environment Variables

Add these to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
```

**For Development/Testing (before subdomain verification):**
```env
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**For Production (after subdomain verification):**
```env
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
```

**Note:** Using subdomain `notifications.tryinstallo.com` to avoid conflicts with Zoho email on main domain.

**Note:** See `RESEND_CONFIGURATION.md` for your specific configuration details.

### Step 5: Deploy Environment Variables

#### For Vercel/Netlify:
1. Go to your deployment platform's dashboard
2. Navigate to **Environment Variables**
3. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
4. Redeploy your application

#### For Supabase Edge Functions:
The email is sent from the Next.js API route, so you only need to set the environment variables in your Next.js deployment. The edge function calls the Next.js API route.

## 📧 How It Works

1. **User completes onboarding** → Payment is processed via Stripe
2. **Edge function saves data** → `onboarding_data` is saved with status `'active'`
3. **Email is triggered** → Edge function calls `/api/send-onboarding-email`
4. **Email is sent** → Resend sends the welcome email to the **Clerk sign-up email address**

**Important:** The email is always sent to the email address the user used to sign up with Clerk authentication, ensuring it goes to their verified account email.

## 📝 Email Template Features

The email includes:
- ✅ Personalized greeting with user's first name
- ✅ Payment plan summary (university, student ID, plan type)
- ✅ Financial breakdown (tuition, admin fee, total)
- ✅ Payment schedule (first payment + remaining installments)
- ✅ Next steps and helpful information
- ✅ Dashboard access button
- ✅ Professional, responsive design

## 🧪 Testing

### Test Locally

1. Make sure your `.env.local` has the Resend API key
2. Complete the onboarding flow
3. Check your email inbox (or Resend dashboard → Logs)

### Test Email Endpoint Directly

You can test the email API route directly:

```bash
curl -X POST http://localhost:3000/api/send-onboarding-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "universityName": "Harvard University",
    "tuitionAmount": 5000,
    "adminFee": 325,
    "totalAmount": 5325,
    "paymentPlan": "premium",
    "installmentAmount": 760.71,
    "totalPayments": 7,
    "remainingPayments": 6,
    "studentId": "STU12345",
    "studentEmail": "student@harvard.edu"
  }'
```

## 🔍 Monitoring

### View Email Logs

1. Go to Resend dashboard → **Logs**
2. See all sent emails, delivery status, and any errors
3. Check email opens and clicks (if tracking is enabled)

### Check Application Logs

The edge function logs email sending:
- ✅ Success: `📧 Onboarding email sent successfully: {messageId}`
- ⚠️ Warning: `⚠️ Failed to send onboarding email: {error}`

**Note:** Email failures don't block the onboarding process. The payment and data saving will still succeed even if the email fails.

## 🛠️ Customization

### Modify Email Template

Edit the `generateEmailHTML()` function in:
```
src/app/api/send-onboarding-email/route.ts
```

### Change Email Subject

Edit line in `route.ts`:
```typescript
subject: `Welcome to Installo! Your payment plan is ready 🎓`,
```

### Add More Email Recipients

You can modify the email sending to include additional recipients (e.g., university administrators):

```typescript
await resend.emails.send({
  from: fromEmail,
  to: [data.email],
  cc: ['admin@university.edu'], // Add CC
  bcc: ['notifications@installo.com'], // Add BCC
  // ...
})
```

## 🚨 Troubleshooting

### Email Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check From Email**: Ensure `RESEND_FROM_EMAIL` is a verified domain (or use `onboarding@resend.dev` for testing)
3. **Check Logs**: Look at Resend dashboard → Logs for error messages
4. **Check Application Logs**: Look for email-related errors in your application logs

### Common Errors

- **"Invalid API key"**: Check that your `RESEND_API_KEY` is correct
- **"Domain not verified"**: Verify your domain in Resend dashboard or use `onboarding@resend.dev` for testing
- **"Rate limit exceeded"**: Resend free tier has limits; upgrade if needed

### Email Goes to Spam

1. **Verify your domain** in Resend
2. **Set up SPF/DKIM records** (Resend provides these)
3. **Use a professional from address** (e.g., `noreply@installo.com`)
4. **Avoid spam trigger words** in subject/body

## 📊 Resend Pricing

- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pro Tier**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing

For most applications, the free tier is sufficient for onboarding emails.

## 🔒 Security

- ✅ API key is stored as environment variable (never commit to git)
- ✅ Email sending is non-blocking (doesn't affect onboarding if it fails)
- ✅ Email content is sanitized and validated
- ✅ Only sends to the user's verified email address

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Best Practices](https://resend.com/docs/best-practices)

## ✅ Checklist

- [ ] Resend account created
- [ ] API key generated and added to `.env.local`
- [ ] From email address configured
- [ ] Domain verified (for production)
- [ ] Environment variables added to deployment platform
- [ ] Test email sent successfully
- [ ] Email template customized (if needed)
- [ ] Monitoring set up (check Resend logs)

---

**Need Help?** Check the Resend dashboard logs or application console for detailed error messages.

