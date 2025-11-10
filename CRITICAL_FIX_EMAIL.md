# 🚨 CRITICAL FIX: Where to Add Resend Variables in Supabase

## ⚠️ **THE PROBLEM**

You mentioned you added variables to **"Supabase secrets"** - but **Edge Functions CANNOT read from Project Secrets!**

Supabase has **TWO different places** for environment variables:

### ❌ **WRONG: Project Settings → Secrets**
- Location: Supabase Dashboard → **Project Settings** → **Secrets**
- **Edge Functions CANNOT access these!**
- This is for other Supabase features, NOT edge functions

### ✅ **CORRECT: Edge Functions → Settings → Environment Variables**
- Location: Supabase Dashboard → **Edge Functions** → **Settings** → **Environment Variables**
- **This is where Edge Functions read from!**
- This is where you MUST add Resend variables

## 🔧 **STEP-BY-STEP: Add Variables to CORRECT Location**

### Step 1: Go to Edge Functions Settings

1. Go to: [Supabase Dashboard](https://supabase.com/dashboard/project/gdhgsmccaqycmvxxoaif)
2. Click **"Edge Functions"** in the left sidebar (NOT "Settings")
3. Click **"Settings"** (gear icon ⚙️) at the top
4. Scroll down to **"Environment Variables"** section

### Step 2: Add the 3 Variables

In the **"Environment Variables"** section (NOT "Secrets"), add:

**Variable 1:**
- **Key:** `RESEND_API_KEY`
- **Value:** `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`

**Variable 2:**
- **Key:** `RESEND_FROM_EMAIL`
- **Value:** `noreply@notifications.tryinstallo.com`

**Variable 3:**
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://tryinstallo.com`

### Step 3: Save

1. Click **"Save"** button
2. Wait for confirmation

### Step 4: Redeploy Edge Function

**CRITICAL:** After adding variables, you MUST redeploy the edge function!

```bash
cd /Users/clayton/Desktop/onboardr/wepply
supabase functions deploy create-hybrid-payment
```

Or via Supabase Dashboard:
1. Go to Edge Functions
2. Find `create-hybrid-payment`
3. Click **"Deploy"** or **"Redeploy"**

## 🔍 **How to Verify You're in the Right Place**

When you're in the correct location, you should see:

✅ **Correct Location:**
- URL contains: `/project/gdhgsmccaqycmvxxoaif/functions`
- Page title: "Edge Functions" or "Functions"
- Section says: **"Environment Variables"** (NOT "Secrets")

❌ **Wrong Location:**
- URL contains: `/project/gdhgsmccaqycmvxxoaif/settings`
- Page title: "Project Settings"
- Section says: "Secrets" or "API Keys"

## 📋 **Visual Guide**

```
Supabase Dashboard
├── Edge Functions ← Click here
│   ├── Settings ← Click here
│   │   └── Environment Variables ← Add variables HERE ✅
│   └── create-hybrid-payment
│
└── Project Settings
    └── Secrets ← NOT HERE ❌ (Edge Functions can't read this!)
```

## 🧪 **After Adding Variables**

1. **Redeploy the edge function** (required!)
2. **Test onboarding** on your live site
3. **Check Supabase logs:**
   - Go to Edge Functions → Logs
   - Look for: `🔍 Environment Variables Check:`
   - Should see: `✅ RESEND_API_KEY found: re_B5f25EB...`

## 🚨 **If Still Not Working**

After adding to the correct location and redeploying, check the logs. The new code will show:

**If variables are set correctly:**
```
🔍 Environment Variables Check:
🔍 RESEND_API_KEY exists: true
🔍 RESEND_API_KEY value: re_B5f25EB...
🔍 RESEND_FROM_EMAIL: noreply@notifications.tryinstallo.com
✅ RESEND_API_KEY found: re_B5f25EB...
```

**If variables are NOT set:**
```
🔍 Environment Variables Check:
🔍 RESEND_API_KEY exists: false
🔍 RESEND_API_KEY value: MISSING
❌ RESEND_API_KEY not set in Supabase Edge Functions environment variables
```

## ✅ **Quick Checklist**

- [ ] Variables added to **Edge Functions** → **Settings** → **Environment Variables**
- [ ] NOT added to Project Settings → Secrets
- [ ] All 3 variables added: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`
- [ ] Clicked "Save"
- [ ] **Redeployed edge function** after adding variables
- [ ] Tested onboarding flow
- [ ] Checked Supabase Edge Functions logs

---

**The key issue: Edge Functions read from "Edge Functions → Settings → Environment Variables", NOT from "Project Settings → Secrets"!**

