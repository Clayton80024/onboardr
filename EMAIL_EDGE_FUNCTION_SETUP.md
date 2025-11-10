# 📧 Email Edge Function - Separate Function Setup

## ✅ **Better Architecture: Separate Email Function**

We've created a **dedicated edge function** for sending emails instead of bundling it into the payment function. This provides:

- ✅ **Separation of concerns** - Payment logic separate from email logic
- ✅ **Reusability** - Can call email function from anywhere
- ✅ **Easier maintenance** - Update email logic independently
- ✅ **Better error handling** - Email failures don't affect payment processing
- ✅ **Cleaner code** - Each function has a single responsibility

## 📁 **New Edge Function Created**

**Location:** `supabase/functions/send-onboarding-email/index.ts`

**Purpose:** Dedicated function for sending onboarding completion emails via Resend

**URL:**
```
https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/send-onboarding-email
```

## 🔧 **Setup Steps**

### Step 1: Deploy the Email Edge Function

```bash
cd /Users/clayton/Desktop/onboardr/wepply

# Deploy the new email function
supabase functions deploy send-onboarding-email
```

Or via Supabase Dashboard:
1. Go to Edge Functions
2. Click "Deploy" or upload the function

### Step 2: Add Environment Variables

**Add to Supabase Edge Functions → Settings → Environment Variables:**

```
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
NEXT_PUBLIC_APP_URL=https://tryinstallo.com
```

**Important:** These variables are needed for the `send-onboarding-email` function.

### Step 3: Deploy Updated Payment Function

The `create-hybrid-payment` function now calls the email function instead of sending emails directly:

```bash
supabase functions deploy create-hybrid-payment
```

## 🔄 **How It Works Now**

1. **User completes onboarding** → Payment processed
2. **`create-hybrid-payment` function** → Processes payment, saves data
3. **Calls `send-onboarding-email` function** → Sends email via Resend
4. **Email sent** → User receives welcome email

## 📋 **Edge Functions Summary**

### 1. `create-hybrid-payment` ✅
- Processes payments
- Creates installments
- **Calls email function** (doesn't send email directly)

### 2. `send-onboarding-email` ✅ **NEW**
- Dedicated email sending function
- Handles Resend API integration
- Generates email HTML
- Sends to Clerk sign-up email

### 3. `stripe-webhook` ⚠️
- Optional webhook handler
- Not actively used (using Next.js route instead)

## 🚀 **Deployment Commands**

### Deploy Both Functions:

```bash
# Deploy email function
supabase functions deploy send-onboarding-email

# Deploy payment function (updated to call email function)
supabase functions deploy create-hybrid-payment
```

Or deploy all at once:
```bash
npm run supabase:deploy:all
```

## ✅ **Benefits of This Approach**

1. **Modularity** - Each function has one job
2. **Testability** - Can test email function independently
3. **Reusability** - Can call email function from other places
4. **Maintainability** - Update email template without touching payment code
5. **Scalability** - Can add more email types easily

## 🔍 **Testing**

### Test Email Function Directly:

```bash
curl -X POST https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/send-onboarding-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
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

## 📝 **Environment Variables Required**

**For `send-onboarding-email` function:**
- `RESEND_API_KEY` ✅ Required
- `RESEND_FROM_EMAIL` ✅ Recommended
- `NEXT_PUBLIC_APP_URL` ✅ Recommended

**For `create-hybrid-payment` function:**
- `STRIPE_SECRET_KEY` ✅ Required
- `SUPABASE_URL` ✅ Required
- `SUPABASE_SERVICE_ROLE_KEY` ✅ Required (to call email function)

---

**This architecture is much cleaner and more maintainable!** 🎉

