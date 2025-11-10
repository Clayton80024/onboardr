# 📧 Netlify Environment Variables for Resend

## 🔑 Required Environment Variables

You need to add **2 environment variables** to your Netlify deployment:

### 1. RESEND_API_KEY (Required)
- **Value:** `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`
- **Purpose:** Your Resend API key for sending emails
- **Required:** Yes

### 2. RESEND_FROM_EMAIL (Optional but Recommended)
- **Value:** `noreply@notifications.tryinstallo.com` (after domain verification)
- **Or for testing:** `onboarding@resend.dev` (works immediately, no verification needed)
- **Purpose:** The "from" email address for your emails
- **Required:** No (defaults to `noreply@notifications.tryinstallo.com` if not set)

## 📝 Step-by-Step: Adding Variables to Netlify

### Step 1: Go to Netlify Dashboard
1. Log in to [Netlify](https://app.netlify.com)
2. Select your site (e.g., `tryinstallo.com`)

### Step 2: Navigate to Environment Variables
1. Click on **Site settings** (or go to: Site settings → **Environment variables**)
2. Scroll down to the **Environment variables** section
3. Click **Add a variable**

### Step 3: Add RESEND_API_KEY
1. **Key:** `RESEND_API_KEY`
2. **Value:** `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`
3. **Scopes:** Select **All scopes** (or specific scopes if you prefer)
4. Click **Save**

### Step 4: Add RESEND_FROM_EMAIL
1. **Key:** `RESEND_FROM_EMAIL`
2. **Value (choose one):**
   - **For testing (before domain verification):** `onboarding@resend.dev`
   - **For production (after domain verification):** `noreply@notifications.tryinstallo.com`
3. **Scopes:** Select **All scopes** (or specific scopes if you prefer)
4. Click **Save**

### Step 5: Redeploy Your Site
After adding the variables, you need to trigger a new deployment:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Or push a new commit to trigger automatic deployment

## ✅ Complete Environment Variables List

Here's the complete list of variables you should have in Netlify:

```env
# Resend Email Service
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com

# Other variables you likely already have:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
STRIPE_SECRET_KEY=your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_APP_URL=https://tryinstallo.com
```

## 🧪 Testing After Deployment

1. **Complete the onboarding flow** on your Netlify site
2. **Check your email inbox** (the Clerk sign-up email)
3. **Check Resend dashboard** → [Logs](https://resend.com/emails) to see email status

## 🔍 Verification

### Check if Variables are Set:
1. Go to Netlify → Site settings → Environment variables
2. Verify both `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are listed

### Check if Emails are Working:
1. Complete onboarding on your live site
2. Check Resend dashboard → Logs for email attempts
3. Check your email inbox (Clerk sign-up email)

## ⚠️ Important Notes

1. **Domain Verification:** If using `noreply@notifications.tryinstallo.com`, make sure `notifications.tryinstallo.com` is verified in Resend dashboard first
2. **Redeploy Required:** After adding environment variables, you must redeploy for changes to take effect
3. **Scopes:** You can set different values for Production, Deploy Preview, and Branch Deploys if needed
4. **Security:** Never commit these values to your repository - they're already in `.gitignore`

## 🚨 Troubleshooting

### Emails Not Sending?

1. **Check Variables:**
   - Go to Netlify → Site settings → Environment variables
   - Verify `RESEND_API_KEY` is set correctly
   - Verify `RESEND_FROM_EMAIL` is set

2. **Check Deployment:**
   - Make sure you redeployed after adding variables
   - Check deployment logs for any errors

3. **Check Resend Dashboard:**
   - Go to [Resend Dashboard](https://resend.com/emails) → Logs
   - Look for error messages

4. **Check Domain Verification:**
   - If using `noreply@notifications.tryinstallo.com`, verify the domain is verified in Resend
   - Or temporarily use `onboarding@resend.dev` for testing

### Still Not Working?

1. Check Netlify function logs (if using Netlify Functions)
2. Check browser console for errors
3. Verify the email is being sent to the correct address (Clerk sign-up email)

---

**Quick Reference:**
- **Resend API Key:** `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`
- **From Email (Testing):** `onboarding@resend.dev`
- **From Email (Production):** `noreply@notifications.tryinstallo.com`

