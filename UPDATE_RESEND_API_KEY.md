# 🔑 Update Resend API Key - Quick Guide

## ✅ Your New API Key

**New Full Access API Key:** `re_RqN1Qvag_HxyrXMhQXNvDzGBaucePHqh9`

This key has **full access** and can use your verified domain `notifications.tryinstallo.com` ✅

## 🚀 Update in Supabase Edge Functions (Required)

### Step 1: Go to Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/gdhgsmccaqycmvxxoaif/functions
2. Click **Settings** (or go to Edge Functions → Settings)

### Step 2: Update Environment Variable

1. Find the **Environment Variables** section
2. Locate `RESEND_API_KEY`
3. **Update the value** to: `re_RqN1Qvag_HxyrXMhQXNvDzGBaucePHqh9`
4. Click **Save**

**No redeployment needed!** The change takes effect immediately.

### Step 3: Verify RESEND_FROM_EMAIL

Make sure `RESEND_FROM_EMAIL` is set to:
```
noreply@notifications.tryinstallo.com
```

Since your domain is verified and you have a full access key, this should work now!

## ✅ Quick Checklist

- [ ] Updated `RESEND_API_KEY` in Supabase Edge Functions
- [ ] Verified `RESEND_FROM_EMAIL` is `noreply@notifications.tryinstallo.com`
- [ ] Test onboarding flow
- [ ] Check email inbox

## 🧪 Test It Now

After updating the API key:

1. Complete the onboarding flow on your site
2. Check Supabase Edge Functions logs for email success
3. Check your email inbox (Clerk sign-up email)
4. Check Resend dashboard → Logs for delivery status

## 📋 Summary

- **Old Key:** `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX` (didn't have domain access)
- **New Key:** `re_RqN1Qvag_HxyrXMhQXNvDzGBaucePHqh9` (full access ✅)
- **Domain:** `notifications.tryinstallo.com` (verified ✅)
- **From Email:** `noreply@notifications.tryinstallo.com` (ready to use ✅)

---

**Action:** Update the API key in Supabase Edge Functions settings right now, then test! 🚀

