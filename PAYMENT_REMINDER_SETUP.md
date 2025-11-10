# 📧 Payment Reminder Cron Job Setup Guide

## 🎯 Overview

This system sends automated email reminders to users **7 days before** their installment payments are due.

## 📋 Components

1. **Edge Function:** `send-payment-reminder` - Sends reminder emails via Resend
2. **Database Function:** `send_payment_reminders_7_days()` - Finds installments due in 7 days
3. **Cron Job:** Runs daily to process reminders

## 🚀 Setup Steps

### Step 1: Deploy the Edge Function

```bash
cd /Users/clayton/Desktop/onboardr/wepply
supabase functions deploy send-payment-reminder
```

Or use the setup script:
```bash
chmod +x setup-payment-reminders-cron.sh
./setup-payment-reminders-cron.sh
```

### Step 2: Enable pg_cron Extension

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
GRANT USAGE ON SCHEMA cron TO postgres;
```

### Step 3: Run the Database Setup Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `setup-payment-reminders.sql`
3. Copy and paste the entire script
4. Click **Run**

This creates:
- `payment_reminders` table (tracks sent reminders)
- `send_payment_reminders_7_days()` function
- `process_payment_reminders()` function

### Step 4: Deploy the Process Function

```bash
supabase functions deploy process-payment-reminders
```

### Step 5: Create the Cron Job

**Option A: Using pg_net (Recommended)**

In Supabase SQL Editor, run:

```sql
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the cron job
SELECT cron.schedule(
  'send-payment-reminders-7-days',
  '0 9 * * *', -- 9 AM UTC every day
  $$SELECT trigger_payment_reminders()$$
);
```

**Option B: External Cron Service (GitHub Actions, Vercel Cron, etc.)**

If pg_net is not available, use an external cron service to call the edge function:

```bash
# Example: Call via curl daily at 9 AM
curl -X POST https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/process-payment-reminders \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

**Schedule Options:**
- `'0 9 * * *'` - 9 AM UTC daily (default)
- `'0 14 * * *'` - 2 PM UTC (9 AM EST standard time)
- `'0 13 * * *'` - 1 PM UTC (9 AM EST daylight time)
- `'0 */6 * * *'` - Every 6 hours

### Step 5: Create Edge Function Trigger (Alternative Approach)

Since pg_cron can't directly call HTTP endpoints easily, we'll create a helper function that the cron job can use. However, a better approach is to create a separate edge function that the cron job calls.

**Option A: Use Edge Function Directly (Recommended)**

Create a new edge function `process-payment-reminders` that:
1. Queries installments due in 7 days
2. Calls `send-payment-reminder` for each one

**Option B: Use Database Function + HTTP Extension**

If you have `pg_net` or `http` extension enabled, the database function can call the edge function directly.

## 🧪 Testing

### Test the Database Function

```sql
-- Test finding installments due in 7 days
SELECT * FROM send_payment_reminders_7_days();

-- Test the process function
SELECT process_payment_reminders();
```

### Test the Edge Function Directly

```bash
curl -X POST https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/send-payment-reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "universityName": "Harvard University",
    "installmentNumber": 2,
    "amount": 760.71,
    "dueDate": "2025-11-17T00:00:00Z",
    "daysUntilDue": 7,
    "paymentLink": "https://buy.stripe.com/test"
  }'
```

## 📊 Monitoring

### View Cron Jobs

```sql
SELECT * FROM cron.job;
```

### View Cron Job Run History

```sql
SELECT 
  jobid,
  jobname,
  start_time,
  end_time,
  return_message,
  status
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

### View Sent Reminders

```sql
SELECT 
  pr.*,
  i.installment_number,
  i.amount,
  i.due_date
FROM payment_reminders pr
JOIN installments i ON pr.installment_id = i.id
ORDER BY pr.sent_at DESC
LIMIT 20;
```

## 🔧 Management

### Update Cron Schedule

```sql
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'send-payment-reminders-7-days'),
  schedule := '0 10 * * *' -- Change to 10 AM UTC
);
```

### Delete Cron Job

```sql
SELECT cron.unschedule('send-payment-reminders-7-days');
```

### Manually Trigger Reminders

```sql
SELECT process_payment_reminders();
```

## ⚙️ Configuration

### Environment Variables Required

Make sure these are set in **Supabase Edge Functions → Settings → Environment Variables**:

- `RESEND_API_KEY` ✅
- `RESEND_FROM_EMAIL` ✅
- `NEXT_PUBLIC_APP_URL` ✅

### How It Works

1. **Cron Job Runs Daily** (9 AM UTC)
2. **Database Function** finds installments due in exactly 7 days
3. **For each installment:**
   - Checks if reminder already sent today
   - Creates reminder record
   - Calls edge function to send email
4. **Edge Function** sends email via Resend
5. **Reminder tracked** in `payment_reminders` table

## 🎯 Email Content

The reminder email includes:
- Installment number
- Amount due
- Due date (formatted)
- Payment link (if available)
- Link to dashboard

## ✅ Verification Checklist

- [ ] Edge function deployed
- [ ] pg_cron extension enabled
- [ ] Database functions created
- [ ] Cron job scheduled
- [ ] Environment variables set
- [ ] Tested manually
- [ ] Verified email delivery

## 🔍 Troubleshooting

### Cron Job Not Running

1. Check if pg_cron is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
2. Check cron job exists: `SELECT * FROM cron.job;`
3. Check run history: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC;`

### Emails Not Sending

1. Check edge function logs in Supabase Dashboard
2. Verify Resend API key is correct
3. Check if reminders are being created: `SELECT * FROM payment_reminders;`
4. Test edge function directly with curl

### Duplicate Reminders

The system prevents duplicates by checking if a reminder was already sent today for each installment. If you see duplicates, check the `payment_reminders` table.

---

**Need Help?** Check the cron job run history and edge function logs for detailed error messages.

