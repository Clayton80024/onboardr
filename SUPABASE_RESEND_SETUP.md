# 📧 Supabase Edge Functions - Resend Email Setup

## ⚠️ **IMPORTANT: Add Resend Variables to Supabase**

The edge function now calls Resend **directly** (not through Next.js API), so you need to add Resend environment variables to **Supabase Edge Functions**, not just Netlify.

## 🔧 Step-by-Step Setup

### Step 1: Go to Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `gdhgsmccaqycmvxxoaif`
3. Navigate to **Edge Functions** → **Settings** (or go directly to: Settings → Edge Functions)

### Step 2: Add Environment Variables

Add these **2 environment variables** to Supabase Edge Functions:

#### 1. RESEND_API_KEY (Required)
- **Key:** `RESEND_API_KEY`
- **Value:** `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`
- **Required:** Yes

#### 2. RESEND_FROM_EMAIL (Optional but Recommended)
- **Key:** `RESEND_FROM_EMAIL`
- **Value:** `noreply@notifications.tryinstallo.com`
- **Required:** No (defaults to `noreply@notifications.tryinstallo.com` if not set)

#### 3. NEXT_PUBLIC_APP_URL (Optional but Recommended)
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://tryinstallo.com`
- **Required:** No (used for dashboard link in email)

### Step 3: Save and Redeploy

1. **Click "Save"** after adding the variables
2. **Redeploy the edge function** (if needed):
   ```bash
supabase functions deploy create-hybrid-payment
   ```

## ✅ Complete Environment Variables for Supabase Edge Functions

Make sure you have ALL of these in Supabase Edge Functions settings:

```env
# Resend Email Service (NEW - Required for emails)
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
NEXT_PUBLIC_APP_URL=https://tryinstallo.com

# Existing variables (you should already have these)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
SUPABASE_URL=https://gdhgsmccaqycmvxxoaif.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🔍 How to Verify

### Check Supabase Edge Functions Logs

1. Go to Supabase Dashboard → **Edge Functions** → **Logs**
2. Look for the `create-hybrid-payment` function
3. After a user completes onboarding, you should see:
   - `📧 Sending onboarding email to Clerk user: user@example.com`
   - `📧 Onboarding email sent successfully to user@example.com: {email_id}`

### Check Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/emails) → **Logs**
2. You should see emails being sent
3. Check delivery status

## 🚨 Troubleshooting

### Emails Still Not Sending?

1. **Check Supabase Edge Functions Environment Variables:**
   - Go to Supabase Dashboard → Edge Functions → Settings
   - Verify `RESEND_API_KEY` is set correctly
   - Verify `RESEND_FROM_EMAIL` is set

2. **Check Edge Function Logs:**
   - Look for error messages like:
     - `⚠️ RESEND_API_KEY not set in Supabase Edge Functions environment variables`
     - `⚠️ Failed to send onboarding email`

3. **Check Resend Dashboard:**
   - Go to Resend Dashboard → Logs
   - Look for failed email attempts
   - Check error messages

4. **Verify Domain:**
   - Make sure `notifications.tryinstallo.com` is verified in Resend
   - Or temporarily use `onboarding@resend.dev` for testing

### Common Errors:

**"RESEND_API_KEY not set"**
- ✅ Add `RESEND_API_KEY` to Supabase Edge Functions environment variables
- ✅ Make sure you're adding it to **Supabase**, not just Netlify

**"Failed to send email"**
- ✅ Check Resend dashboard → Logs for detailed error
- ✅ Verify domain is verified in Resend
- ✅ Check that `RESEND_FROM_EMAIL` matches verified domain

## 📝 Summary

**Key Point:** The edge function now calls Resend **directly**, so you need Resend variables in **BOTH** places:

1. **Netlify** (for Next.js app):
   - `RESEND_API_KEY` (if you want to keep the API route as backup)
   - `RESEND_FROM_EMAIL` (if you want to keep the API route as backup)

2. **Supabase Edge Functions** (REQUIRED for emails):
   - `RESEND_API_KEY` ✅ **REQUIRED**
   - `RESEND_FROM_EMAIL` ✅ **RECOMMENDED**
   - `NEXT_PUBLIC_APP_URL` ✅ **RECOMMENDED**

---

**After adding these variables, emails should work!** 🎉

