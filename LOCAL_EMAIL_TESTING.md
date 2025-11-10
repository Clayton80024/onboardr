# 📧 Local Email Testing Guide

## 🎯 Which Email Address Receives the Email?

The email is sent to the **Clerk sign-up email address** (the email you used to create your account):
- **Primary:** Your Clerk authentication email (the email you signed up with)
- **Fallback:** The email entered in the onboarding form (Step 6) if Clerk email is not available

**Example:** If you signed up with `user@example.com` in Clerk, that's where the email will be sent, regardless of what email you enter in the onboarding form.

**Note:** This ensures the email always goes to the authenticated user's verified email address.

## ⚠️ Why Emails Don't Work on Localhost

When testing locally, the **Supabase Edge Function** (which runs on Supabase servers) tries to call:
```
http://localhost:3000/api/send-onboarding-email
```

**Problem:** Edge functions run on Supabase's servers, not your local machine, so they **cannot reach `localhost:3000`**.

## ✅ Solution: Test Email Endpoint Directly

### Option 1: Test Email API Route Directly (Recommended for Local Testing)

1. **Make sure your Next.js dev server is running:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run the test script:**
   ```bash
   ./test-email-local.sh
   ```

   Or test manually with curl:
   ```bash
   curl -X POST http://localhost:3000/api/send-onboarding-email \
     -H "Content-Type: application/json" \
     -d '{
       "email": "YOUR_EMAIL@example.com",
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

3. **Replace `YOUR_EMAIL@example.com`** with your actual email address

4. **Check:**
   - Your email inbox
   - Resend dashboard → Logs (https://resend.com/emails)

### Option 2: Use ngrok for Local Testing (Advanced)

If you want the edge function to work during onboarding:

1. **Install ngrok:**
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```

5. **Restart your Next.js server:**
   ```bash
   npm run dev
   ```

6. **Now the edge function can reach your local API!**

## 🔍 Troubleshooting

### Check Environment Variables

Make sure `.env.local` has:
```env
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Check Email Address

The email is sent to:
- The email you enter in the onboarding form (Step 6)
- Or your Clerk account email if no email is entered

**To see what email is being used:**
1. Check the browser console during onboarding
2. Check Supabase Edge Function logs
3. Check the email API route logs

### Check Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Click **Logs** to see all email attempts
3. Check for errors or delivery status

### Common Issues

1. **"Email service not configured"**
   - ✅ Make sure `RESEND_API_KEY` is in `.env.local`
   - ✅ Restart your Next.js server after adding env vars

2. **"Failed to send email"**
   - ✅ Check Resend dashboard → Logs for error details
   - ✅ Make sure you're using `onboarding@resend.dev` for testing (no domain verification needed)

3. **Email not received**
   - ✅ Check spam folder
   - ✅ Check Resend dashboard → Logs to see if it was sent
   - ✅ Verify the email address is correct

## 🚀 Production Setup

For production, the edge function will work because:
- Your app will be deployed (not localhost)
- The edge function can reach your production URL
- Environment variables will be set in your deployment platform

## 📝 Quick Test Checklist

- [ ] `.env.local` has `RESEND_API_KEY`
- [ ] `.env.local` has `RESEND_FROM_EMAIL=onboarding@resend.dev` (for testing)
- [ ] Next.js dev server is running (`npm run dev`)
- [ ] Test email endpoint directly with curl or test script
- [ ] Check your email inbox
- [ ] Check Resend dashboard → Logs

---

**Need help?** Check the browser console, terminal logs, or Resend dashboard for detailed error messages.

