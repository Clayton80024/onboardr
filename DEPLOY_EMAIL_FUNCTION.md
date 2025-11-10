# 🚀 Deploy Email Edge Function - Step by Step Guide

## What You Need

I **cannot directly access** your Supabase account, but I can guide you through deploying the new email edge function. Here's what you need to do:

## Step 1: Login to Supabase CLI

Run this command in your terminal:

```bash
cd /Users/clayton/Desktop/onboardr/wepply
supabase login
```

This will:
- Open your browser
- Ask you to authenticate with Supabase
- Save your access token locally

## Step 2: Link to Your Project (if not already linked)

If you haven't linked your project yet, you'll need your:
- **Project Reference ID** (found in Supabase Dashboard → Settings → General)
- Your project URL is: `https://gdhgsmccaqycmvxxoaif.supabase.co`

Run:
```bash
supabase link --project-ref gdhgsmccaqycmvxxoaif
```

Or if you prefer to select from a list:
```bash
supabase link
```

## Step 3: Deploy the Email Edge Function

Once logged in and linked, deploy the new function:

```bash
supabase functions deploy send-onboarding-email
```

## Step 4: Deploy the Updated Payment Function

The payment function now calls the email function, so redeploy it:

```bash
supabase functions deploy create-hybrid-payment
```

## Step 5: Verify Environment Variables

Make sure these are set in **Supabase Dashboard → Edge Functions → Settings → Environment Variables**:

```
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
NEXT_PUBLIC_APP_URL=https://tryinstallo.com
```

**Important:** These must be in **Edge Functions → Settings → Environment Variables**, NOT in Project Secrets!

## Alternative: Manual Deployment via Dashboard

If you prefer not to use CLI, you can:

1. Go to Supabase Dashboard → Edge Functions
2. Click "Create a new function"
3. Name it: `send-onboarding-email`
4. Copy the contents of `supabase/functions/send-onboarding-email/index.ts`
5. Paste into the editor
6. Click "Deploy"

## Quick Test After Deployment

After deploying, you can test the function:

```bash
curl -X POST https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/send-onboarding-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "email": "your-email@example.com",
    "firstName": "Test",
    "lastName": "User",
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

## What I Can Do For You

I can:
- ✅ Create the edge function code (already done!)
- ✅ Update the payment function to call it (already done!)
- ✅ Provide deployment commands
- ✅ Help troubleshoot if deployment fails

I **cannot**:
- ❌ Access your Supabase account directly
- ❌ Run deployment commands that require authentication
- ❌ See your environment variables or secrets

## Need Help?

If you run into any issues during deployment, share the error message and I'll help troubleshoot!

