# 🔍 Email Not Sending - Troubleshooting Guide

## ⚠️ **Critical: Supabase Secrets vs Edge Function Environment Variables**

Supabase has **TWO different places** for environment variables:

### 1. ❌ **Project Secrets** (NOT for Edge Functions)
- Location: Supabase Dashboard → Project Settings → Secrets
- **These are NOT accessible to Edge Functions!**
- Edge functions **cannot** read from project secrets

### 2. ✅ **Edge Function Environment Variables** (CORRECT)
- Location: Supabase Dashboard → **Edge Functions** → **Settings** → **Environment Variables**
- **This is where Edge Functions read from!**
- This is where you MUST add Resend variables

## 🔧 **Step-by-Step: Add Variables to Correct Location**

### Step 1: Go to Edge Functions Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/gdhgsmccaqycmvxxoaif)
2. Click **Edge Functions** in the left sidebar
3. Click **Settings** (or the gear icon ⚙️)
4. Scroll to **Environment Variables** section

### Step 2: Add Variables (NOT in Secrets!)

**DO NOT use "Secrets" - Use "Environment Variables" section!**

Add these 3 variables:

```
RESEND_API_KEY = re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL = noreply@notifications.tryinstallo.com
NEXT_PUBLIC_APP_URL = https://tryinstallo.com
```

### Step 3: Save and Redeploy

1. Click **Save** after adding variables
2. **Redeploy the edge function:**
   ```bash
   supabase functions deploy create-hybrid-payment
   ```

## 🧪 **Test the Edge Function**

After redeploying, test it:

```bash
curl -X POST https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/create-hybrid-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "paymentMethodId": "pm_test_123",
    "tuitionAmount": "1000",
    "paymentPlan": "premium",
    "universityName": "Test University",
    "studentId": "TEST123",
    "studentEmail": "student@test.com",
    "userId": "test_user",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com"
  }'
```

## 📋 **Checklist**

- [ ] Variables added to **Edge Functions** → **Settings** → **Environment Variables** (NOT Secrets!)
- [ ] All 3 variables present: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`
- [ ] Edge function redeployed after adding variables
- [ ] Domain `notifications.tryinstallo.com` verified in Resend
- [ ] Tested onboarding flow
- [ ] Checked Supabase Edge Functions logs

## 🔍 **How to Verify Variables Are Set**

### Check in Supabase Dashboard:

1. Go to Edge Functions → Settings
2. Look for **Environment Variables** section
3. You should see:
   - `RESEND_API_KEY` ✅
   - `RESEND_FROM_EMAIL` ✅
   - `NEXT_PUBLIC_APP_URL` ✅

### Check in Logs:

After completing onboarding, check Supabase Edge Functions logs. You should see:

**If variables are set correctly:**
- `✅ RESEND_API_KEY found: re_B5f25EB...`
- `📧 Attempting to send email via Resend API...`

**If variables are NOT set:**
- `❌ RESEND_API_KEY not set in Supabase Edge Functions environment variables`
- `❌ Email will not be sent`

## 🚨 **Common Mistakes**

### Mistake 1: Adding to Project Secrets Instead of Edge Function Variables
- ❌ Wrong: Project Settings → Secrets
- ✅ Correct: Edge Functions → Settings → Environment Variables

### Mistake 2: Not Redeploying After Adding Variables
- After adding variables, you MUST redeploy the edge function
- Variables are only loaded when the function is deployed

### Mistake 3: Typo in Variable Name
- Make sure it's exactly: `RESEND_API_KEY` (not `RESEND_API` or `RESENDKEY`)

## 📞 **Next Steps**

1. **Verify variables are in the correct location** (Edge Functions → Settings)
2. **Redeploy the edge function**
3. **Test onboarding flow**
4. **Check Supabase logs** for the detailed error messages
5. **Share the logs** if still not working

---

**The most common issue is adding variables to "Secrets" instead of "Edge Functions Environment Variables"!**

