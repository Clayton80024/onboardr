# ⏰ Supabase Cron Jobs Guide

## 📚 Understanding Supabase Cron Jobs

Supabase uses **pg_cron** extension to schedule PostgreSQL functions. This allows you to run automated tasks on a schedule (daily, hourly, etc.).

## 🎯 Common Use Cases for Your Payment System

Based on your installments system, here are useful cron jobs:

1. **Payment Reminders** - Send emails 3 days before, 1 day before, and on due date
2. **Expired Payment Links** - Check and regenerate expired ACH payment links
3. **Overdue Payments** - Mark payments as overdue after grace period
4. **Status Updates** - Update installment statuses automatically

## 🔧 Step 1: Enable pg_cron Extension

First, enable the extension in your Supabase database:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to your database role
GRANT USAGE ON SCHEMA cron TO postgres;
```

**Run this in:** Supabase Dashboard → SQL Editor

## 📧 Example 1: Payment Reminder Cron Job

### Create the Function

```sql
-- Function to send payment reminders
CREATE OR REPLACE FUNCTION send_payment_reminders()
RETURNS void AS $$
DECLARE
    installment_record RECORD;
    days_until_due INTEGER;
    reminder_type TEXT;
BEGIN
    -- Find installments due in 3 days, 1 day, or today
    FOR installment_record IN
        SELECT 
            i.*,
            od.user_id,
            od.email,
            od.first_name,
            od.last_name,
            od.university_name,
            od.payment_plan,
            EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER AS days_until_due
        FROM installments i
        JOIN onboarding_data od ON i.onboarding_id = od.id
        WHERE i.status = 'pending'
        AND i.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
        AND i.due_date >= CURRENT_DATE
    LOOP
        days_until_due := installment_record.days_until_due;
        
        -- Determine reminder type
        IF days_until_due = 0 THEN
            reminder_type := 'due_today';
        ELSIF days_until_due = 1 THEN
            reminder_type := 'due_tomorrow';
        ELSIF days_until_due = 3 THEN
            reminder_type := 'due_in_3_days';
        ELSE
            CONTINUE; -- Skip if not one of our reminder days
        END IF;
        
        -- Call your email edge function to send reminder
        -- Note: This requires HTTP extension or calling via edge function
        PERFORM net.http_post(
            url := 'https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/send-payment-reminder',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
            ),
            body := jsonb_build_object(
                'email', installment_record.email,
                'firstName', installment_record.first_name,
                'lastName', installment_record.last_name,
                'installmentNumber', installment_record.installment_number,
                'amount', installment_record.amount,
                'dueDate', installment_record.due_date,
                'reminderType', reminder_type,
                'paymentLink', installment_record.payment_link
            )
        );
        
        -- Log the reminder (optional)
        INSERT INTO payment_reminders (
            installment_id,
            reminder_type,
            sent_at
        ) VALUES (
            installment_record.id,
            reminder_type,
            NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Schedule the Cron Job

```sql
-- Run daily at 9 AM UTC
SELECT cron.schedule(
    'send-payment-reminders',
    '0 9 * * *', -- 9 AM every day
    $$SELECT send_payment_reminders()$$
);
```

## 🔄 Example 2: Check Expired Payment Links

### Create the Function

```sql
-- Function to check and regenerate expired payment links
CREATE OR REPLACE FUNCTION refresh_expired_payment_links()
RETURNS void AS $$
DECLARE
    installment_record RECORD;
BEGIN
    -- Find installments with expired payment links
    FOR installment_record IN
        SELECT 
            i.*,
            od.user_id,
            od.stripe_customer_id,
            od.university_name,
            od.payment_plan
        FROM installments i
        JOIN onboarding_data od ON i.onboarding_id = od.id
        WHERE i.status = 'pending'
        AND i.payment_method = 'ach'
        AND i.payment_link_expires_at IS NOT NULL
        AND i.payment_link_expires_at < NOW()
        AND i.payment_link IS NOT NULL
    LOOP
        -- Call edge function to regenerate payment link
        -- You'll need to create this edge function
        PERFORM net.http_post(
            url := 'https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/refresh-payment-link',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
            ),
            body := jsonb_build_object(
                'installmentId', installment_record.id,
                'userId', installment_record.user_id,
                'amount', installment_record.amount,
                'installmentNumber', installment_record.installment_number,
                'customerId', installment_record.stripe_customer_id
            )
        );
        
        -- Log the refresh attempt
        RAISE NOTICE 'Refreshing payment link for installment %', installment_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Schedule the Cron Job

```sql
-- Run every 6 hours
SELECT cron.schedule(
    'refresh-expired-links',
    '0 */6 * * *', -- Every 6 hours
    $$SELECT refresh_expired_payment_links()$$
);
```

## ⚠️ Example 3: Mark Overdue Payments

### Create the Function

```sql
-- Function to mark payments as overdue after grace period
CREATE OR REPLACE FUNCTION mark_overdue_payments()
RETURNS void AS $$
BEGIN
    -- Mark installments as overdue if past due date + 7 days grace period
    UPDATE installments
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < NOW() - INTERVAL '7 days'
    AND payment_method = 'ach';
    
    -- Log how many were marked overdue
    RAISE NOTICE 'Marked % installments as overdue', ROW_COUNT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Schedule the Cron Job

```sql
-- Run daily at midnight
SELECT cron.schedule(
    'mark-overdue-payments',
    '0 0 * * *', -- Midnight every day
    $$SELECT mark_overdue_payments()$$
);
```

## 📋 Viewing and Managing Cron Jobs

### List All Cron Jobs

```sql
SELECT * FROM cron.job;
```

### View Cron Job History

```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

### Update a Cron Job

```sql
-- Update schedule
SELECT cron.alter_job(
    job_id := (SELECT jobid FROM cron.job WHERE jobname = 'send-payment-reminders'),
    schedule := '0 10 * * *' -- Change to 10 AM
);
```

### Delete a Cron Job

```sql
SELECT cron.unschedule('send-payment-reminders');
```

## 🔐 Security Considerations

1. **Use SECURITY DEFINER** - Functions need elevated privileges
2. **Service Role Key** - Store in database settings, not hardcoded
3. **RLS Policies** - Cron functions bypass RLS, be careful with data access
4. **Error Handling** - Wrap in try-catch to prevent cron failures

## 🚀 Alternative: Use Edge Functions + External Cron

If pg_cron is complex, you can:

1. **Create an Edge Function** for each task
2. **Use External Cron Service** (GitHub Actions, Vercel Cron, etc.)
3. **Call Edge Function** on schedule

Example with GitHub Actions:

```yaml
# .github/workflows/payment-reminders.yml
name: Payment Reminders
on:
  schedule:
    - cron: '0 9 * * *' # 9 AM daily
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call Reminder Function
        run: |
          curl -X POST https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/send-payment-reminders \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

## 📊 Recommended Cron Jobs for Your System

1. **Payment Reminders** - Daily at 9 AM
   - 3 days before due date
   - 1 day before due date
   - On due date

2. **Expired Link Check** - Every 6 hours
   - Check for expired ACH payment links
   - Regenerate if needed

3. **Overdue Marking** - Daily at midnight
   - Mark payments overdue after grace period

4. **Status Sync** - Hourly
   - Sync payment statuses from Stripe webhooks

## ✅ Next Steps

1. **Enable pg_cron** in Supabase Dashboard
2. **Create reminder edge function** (`send-payment-reminder`)
3. **Set up cron jobs** using the examples above
4. **Test** with a manual function call first
5. **Monitor** cron job runs in `cron.job_run_details`

---

**What would you like to set up first?** Payment reminders, expired link checks, or something else? 🎯

