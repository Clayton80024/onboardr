# 🧪 Testing Edge Functions on Localhost

## ✅ Yes, You Can Test Locally!

You can test both edge functions (`send-onboarding-email` and `create-hybrid-payment`) on localhost. Here's how:

## Option 1: Serve Edge Functions Locally (Recommended)

### Step 1: Start Supabase Locally

```bash
cd /Users/clayton/Desktop/onboardr/wepply
supabase start
```

This starts:
- Local Supabase instance
- Edge Functions runtime
- Database
- API Gateway

### Step 2: Serve the Edge Functions

In a separate terminal, serve the functions:

```bash
cd /Users/clayton/Desktop/onboardr/wepply

# Serve all functions
supabase functions serve

# Or serve specific functions
supabase functions serve send-onboarding-email
supabase functions serve create-hybrid-payment
```

This will start the functions on:
- `http://localhost:54321/functions/v1/send-onboarding-email`
- `http://localhost:54321/functions/v1/create-hybrid-payment`

### Step 3: Set Local Environment Variables

Create a `.env.local` file in the `wepply` directory (if it doesn't exist):

```bash
# Resend Configuration
RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (for payment function to call email function)
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
```

**Note:** When running `supabase start`, it will output the service role key. Copy it from there.

### Step 4: Update Payment Function for Local Testing

The payment function needs to know the local URL. When running locally, it will automatically use `http://localhost:54321` if `SUPABASE_URL` is set correctly.

### Step 5: Test the Email Function Directly

```bash
curl -X POST http://localhost:54321/functions/v1/send-onboarding-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LOCAL_SERVICE_ROLE_KEY" \
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

## Option 2: Test with Full Local Stack

### Step 1: Start Everything

```bash
# Terminal 1: Start Supabase
cd /Users/clayton/Desktop/onboardr/wepply
supabase start

# Terminal 2: Serve Edge Functions
supabase functions serve

# Terminal 3: Start Next.js App
npm run dev
```

### Step 2: Update Your Frontend to Use Local Functions

In your Next.js app, you can conditionally use local functions:

```typescript
const supabaseUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:54321'
  : 'https://gdhgsmccaqycmvxxoaif.supabase.co'
```

### Step 3: Complete Onboarding Flow

1. Go to `http://localhost:3000`
2. Sign up/Sign in
3. Complete onboarding
4. Check your email!

## Option 3: Test Email Function Only (Simplest)

If you just want to test the email function without the full stack:

```bash
# Start Supabase locally
supabase start

# Serve just the email function
supabase functions serve send-onboarding-email

# Test it
curl -X POST http://localhost:54321/functions/v1/send-onboarding-email \
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

## 🔍 Viewing Logs Locally

```bash
# View function logs
supabase functions logs send-onboarding-email
supabase functions logs create-hybrid-payment

# Or watch logs in real-time
supabase functions serve --debug
```

## ⚠️ Important Notes

1. **Environment Variables**: When running locally, edge functions read from:
   - `.env.local` file in your project root
   - Or you can pass them via `supabase functions serve --env-file .env.local`

2. **Service Role Key**: Get it from `supabase start` output, or from:
   ```bash
   supabase status
   ```

3. **Database**: Local functions connect to your local Supabase database, not production

4. **Stripe**: For payment testing, use Stripe test mode keys

## 🚀 Quick Start Script

Create a test script:

```bash
#!/bin/bash
# test-local-email.sh

echo "🧪 Testing Email Function Locally..."

curl -X POST http://localhost:54321/functions/v1/send-onboarding-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(supabase status | grep 'service_role key' | awk '{print $3}')" \
  -d '{
    "email": "test@example.com",
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

## ✅ Summary

**Yes, you can test on localhost!** The easiest way is:

1. `supabase start` - Start local Supabase
2. `supabase functions serve` - Serve functions locally
3. Test via curl or your Next.js app pointing to `http://localhost:54321`

The functions will work exactly the same as in production, just running locally! 🎉

