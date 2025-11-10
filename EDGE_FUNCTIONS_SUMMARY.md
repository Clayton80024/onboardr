# 📋 Supabase Edge Functions Summary

## 🎯 **Edge Functions in Your Application**

You have **2 edge functions** in your codebase:

### 1. ✅ **`create-hybrid-payment`** - **ACTIVELY USED**

**Location:** `supabase/functions/create-hybrid-payment/index.ts`

**Purpose:**
- Creates hybrid payment system (Card + ACH)
- Processes first payment via credit card
- Generates ACH payment links for remaining installments
- **Sends onboarding completion email via Resend** ← This is where email sending happens

**Called From:**
- `src/components/stripe-payment.tsx` (line 81
- Directly from frontend when user completes payment

**URL:**
```
https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/create-hybrid-payment
```

**Environment Variables Required:**
- `STRIPE_SECRET_KEY` ✅
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `RESEND_API_KEY` ✅ **← For email sending**
- `RESEND_FROM_EMAIL` ✅ **← For email sending**
- `NEXT_PUBLIC_APP_URL` ✅ **← For email dashboard link**

**Status:** ✅ **ACTIVE** - This is the function that sends emails

---

### 2. ⚠️ **`stripe-webhook`** - **OPTIONAL/DEPRECATED**

**Location:** `supabase/functions/stripe-webhook/index.ts`

**Purpose:**
- Handles Stripe webhook events
- Updates installment status when payments complete
- Processes payment failures

**Called From:**
- Stripe webhooks (if configured to use edge function)
- Currently, you're using the Next.js route instead: `/api/webhooks/stripe`

**URL:**
```
https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/stripe-webhook
```

**Status:** ⚠️ **NOT ACTIVELY USED** - You're using the Next.js webhook route instead

---

## 📧 **For Email Sending - Use This Function:**

### **`create-hybrid-payment`** ✅

This is the **ONLY** edge function that sends emails. It's called when:
1. User completes onboarding
2. User submits payment form
3. Payment is processed successfully
4. **Email is sent to Clerk sign-up email**

## 🔧 **Environment Variables Setup**

### For `create-hybrid-payment` (Email Sending):

**Add to Supabase Edge Functions Settings:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/gdhgsmccaqycmvxxoaif)
2. Navigate to **Edge Functions** → **Settings**
3. Add these variables:

```env
# Required for Email Sending
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
NEXT_PUBLIC_APP_URL=https://tryinstallo.com

# Already should have these:
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_URL=https://gdhgsmccaqycmvxxoaif.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🚀 **Deployment Status**

### `create-hybrid-payment`:
- ✅ Code committed to GitHub
- ⚠️ **Needs redeployment** after adding Resend variables
- ⚠️ **Needs Resend environment variables** added

### `stripe-webhook`:
- ✅ Code exists
- ⚠️ Not actively used (using Next.js route instead)

## 📝 **Quick Reference**

**For Email Issues:**
- Check: `create-hybrid-payment` edge function
- Location: Supabase Dashboard → Edge Functions → `create-hybrid-payment` → Logs
- Make sure: Resend variables are in **Edge Functions** settings (not project settings)

**To Deploy:**
```bash
supabase functions deploy create-hybrid-payment
```

---

**Summary:** You're using **1 edge function** for email sending: `create-hybrid-payment`. Make sure it has the Resend environment variables!

