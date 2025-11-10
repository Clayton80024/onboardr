# ⚡ Payment Reminder Quick Start

## ✅ What's Been Created

1. **`send-payment-reminder`** edge function - Sends reminder emails ✅ **DEPLOYED**
2. **`process-payment-reminders`** edge function - Processes reminders ✅ **DEPLOYED**
3. **Database setup script** - `setup-payment-reminders.sql`
4. **Setup guide** - `PAYMENT_REMINDER_SETUP.md`

## 🚀 Next Steps (5 minutes)

### Step 1: Run Database Setup

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `setup-payment-reminders.sql`
3. Copy and paste the entire script
4. Click **Run**

This creates:
- `payment_reminders` table
- Database functions

### Step 2: Enable Extensions

In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
GRANT USAGE ON SCHEMA cron TO postgres;
```

### Step 3: Set Service Role Key (for pg_net)

In Supabase SQL Editor, run:

```sql
-- Set your service role key (get it from Supabase Dashboard → Settings → API)
ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

**Get your service role key from:** Supabase Dashboard → Settings → API → `service_role` key

### Step 4: Create Cron Job

In Supabase SQL Editor, run:

```sql
SELECT cron.schedule(
  'send-payment-reminders-7-days',
  '0 9 * * *', -- 9 AM UTC every day
  $$SELECT trigger_payment_reminders()$$
);
```

## 🧪 Test It

### Test the Process Function

```bash
curl -X POST https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/process-payment-reminders \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### Test the Reminder Email Function

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

## 📊 Verify It's Working

### Check Cron Job

```sql
SELECT * FROM cron.job WHERE jobname = 'send-payment-reminders-7-days';
```

### Check Cron Job Runs

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-payment-reminders-7-days')
ORDER BY start_time DESC 
LIMIT 10;
```

### Check Sent Reminders

```sql
SELECT * FROM payment_reminders 
ORDER BY sent_at DESC 
LIMIT 20;
```

## 🎯 How It Works

1. **Cron job runs daily** at 9 AM UTC
2. **Calls `trigger_payment_reminders()`** function
3. **Function calls** `process-payment-reminders` edge function via HTTP
4. **Edge function** finds installments due in 7 days
5. **For each installment**, calls `send-payment-reminder` edge function
6. **Email sent** via Resend
7. **Reminder logged** in `payment_reminders` table

## ⚙️ Configuration

Make sure these environment variables are set in **Supabase Edge Functions → Settings**:

- ✅ `RESEND_API_KEY`
- ✅ `RESEND_FROM_EMAIL`
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

## 🔧 Troubleshooting

### Cron Job Not Running

1. Check extensions: `SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');`
2. Check cron job: `SELECT * FROM cron.job;`
3. Check run history: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC;`

### Emails Not Sending

1. Check edge function logs in Supabase Dashboard
2. Verify Resend API key is correct
3. Test edge function directly with curl

---

**That's it!** Your payment reminder system is ready. Users will receive emails 7 days before their installments are due. 🎉

