# 📧 Resend Configuration for Installo

## ✅ Your Resend Setup

**API Key:** `re_RqN1Qvag_HxyrXMhQXNvDzGBaucePHqh9` (Full Access)  
**Verified Domain:** `notifications.tryinstallo.com` (to avoid conflicts with Zoho on main domain)

## 🔧 Environment Variables

Add these to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_RqN1Qvag_HxyrXMhQXNvDzGBaucePHqh9
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
```

**Note:** The default from email is set to `noreply@notifications.tryinstallo.com`. You can change this to any email address from your verified subdomain.

## 🚀 Important: Verify Your Domain in Resend

Before emails will work in production, you need to verify your subdomain in Resend:

1. **Go to Resend Dashboard** → [resend.com/dashboard](https://resend.com/dashboard)
2. **Navigate to "Domains"**
3. **Click "Add Domain"**
4. **Enter:** `notifications.tryinstallo.com` (the subdomain to avoid Zoho conflicts)
5. **Add DNS Records:**
   - Resend will provide you with DNS records (SPF, DKIM, etc.)
   - Add these records to your domain's DNS settings for the subdomain
   - Wait for verification (usually takes a few minutes to a few hours)

**Why use a subdomain?** This avoids DNS conflicts with Zoho email service (like SPF records) on your main domain `tryinstallo.com`.

## 📧 From Email Options

Once your subdomain is verified, you can use any of these from addresses:

- `noreply@notifications.tryinstallo.com` (default - recommended)
- `onboarding@notifications.tryinstallo.com`
- `hello@notifications.tryinstallo.com`
- Any other email address from `notifications.tryinstallo.com`

## 🧪 Testing

### For Testing (Before Subdomain Verification)

If you haven't verified your subdomain yet, you can temporarily use:

```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

This works immediately but is only for testing. Switch to your subdomain email once verified.

### Test the Email

1. Complete the onboarding flow
2. Check the user's email inbox
3. Check Resend dashboard → Logs to see delivery status

## 🌐 Production Deployment

### Vercel/Netlify

Add these environment variables in your deployment platform:

```env
RESEND_API_KEY=re_RqN1Qvag_HxyrXMhQXNvDzGBaucePHqh9
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
```

### Supabase Edge Functions

The email is sent from the Next.js API route, so you only need to set these in your Next.js deployment (Vercel/Netlify), not in Supabase.

## ✅ Verification Checklist

- [ ] Resend API key added to `.env.local`
- [ ] Subdomain `notifications.tryinstallo.com` verified in Resend dashboard
- [ ] DNS records added and verified for the subdomain
- [ ] `RESEND_FROM_EMAIL` set to your subdomain email
- [ ] Test email sent successfully
- [ ] Environment variables added to production deployment
- [ ] Production emails working correctly

## 🔍 Troubleshooting

### Emails Not Sending

1. **Check API Key:** Verify `RESEND_API_KEY` is correct
2. **Check Subdomain:** Ensure `notifications.tryinstallo.com` is verified in Resend
3. **Check From Email:** Must be from verified subdomain (or use `onboarding@resend.dev` for testing)
4. **Check Logs:** Resend dashboard → Logs shows all email attempts

### Domain Verification Issues

- Make sure you're verifying the **subdomain** (`notifications.tryinstallo.com`) to avoid Zoho conflicts
- DNS records can take up to 48 hours to propagate
- Check that all DNS records are correctly added for the subdomain
- Resend will show verification status in the dashboard
- Using a subdomain keeps your main domain's email configuration (Zoho) separate

## 📊 Monitoring

View email logs in Resend dashboard:
- **Sent emails:** All emails sent
- **Delivery status:** Success/failure
- **Open/click tracking:** If enabled

---

**Need Help?** Check Resend dashboard logs for detailed error messages.

