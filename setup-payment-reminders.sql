-- ============================================
-- Payment Reminder Cron Job Setup
-- ============================================
-- This script sets up a cron job to send payment reminders
-- 7 days before installments are due
-- ============================================

-- Step 1: Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;

-- Step 2: Create a table to track sent reminders (optional, prevents duplicate emails)
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  installment_id UUID REFERENCES installments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- '7_days_before', '3_days_before', '1_day_before', 'due_today'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent_to TEXT NOT NULL,
  days_until_due INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_reminders_installment ON payment_reminders(installment_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_sent_at ON payment_reminders(sent_at);

-- Step 3: Create function to send payment reminders
-- This function finds installments due in 7 days and calls the edge function
CREATE OR REPLACE FUNCTION send_payment_reminders_7_days()
RETURNS TABLE(
  installment_id UUID,
  email_sent BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  installment_record RECORD;
  reminder_sent BOOLEAN;
  error_msg TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
  http_response JSONB;
BEGIN
  -- Get Supabase configuration
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Default values if not set
  IF supabase_url IS NULL THEN
    supabase_url := 'https://gdhgsmccaqycmvxxoaif.supabase.co';
  END IF;
  
  -- Find installments due in exactly 7 days
  FOR installment_record IN
    SELECT 
      i.id AS installment_id,
      i.installment_number,
      i.amount,
      i.due_date,
      i.payment_link,
      i.status,
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
    AND i.due_date >= CURRENT_DATE
    AND i.due_date <= CURRENT_DATE + INTERVAL '7 days'
    AND EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 7
    AND NOT EXISTS (
      -- Don't send if we already sent a 7-day reminder for this installment
      SELECT 1 FROM payment_reminders pr
      WHERE pr.installment_id = i.id
      AND pr.reminder_type = '7_days_before'
      AND pr.sent_at::date = CURRENT_DATE
    )
    AND od.email IS NOT NULL
    AND od.email != ''
  LOOP
    reminder_sent := FALSE;
    error_msg := NULL;
    
    BEGIN
      -- Call the edge function to send the reminder email
      -- Note: This requires the http extension or we can use a simpler approach
      -- For now, we'll use a direct HTTP call via pg_net if available
      -- Otherwise, we'll log and the cron job can call the edge function directly
      
      -- Insert reminder record (we'll mark it as sent after successful email)
      INSERT INTO payment_reminders (
        installment_id,
        reminder_type,
        email_sent_to,
        days_until_due
      ) VALUES (
        installment_record.installment_id,
        '7_days_before',
        installment_record.email,
        installment_record.days_until_due
      );
      
      reminder_sent := TRUE;
      
      -- Log the reminder
      RAISE NOTICE 'Payment reminder queued for installment % (due in % days) to %', 
        installment_record.installment_id, 
        installment_record.days_until_due,
        installment_record.email;
        
    EXCEPTION WHEN OTHERS THEN
      error_msg := SQLERRM;
      RAISE WARNING 'Error processing reminder for installment %: %', 
        installment_record.installment_id, 
        error_msg;
    END;
    
    RETURN QUERY SELECT 
      installment_record.installment_id,
      reminder_sent,
      error_msg;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create a simpler function that the cron job can call
-- This function will be called by the cron job, which will then
-- call the edge function via HTTP
CREATE OR REPLACE FUNCTION process_payment_reminders()
RETURNS void AS $$
DECLARE
  reminder_count INTEGER;
BEGIN
  -- Call the main reminder function
  PERFORM send_payment_reminders_7_days();
  
  -- Get count of reminders processed today
  SELECT COUNT(*) INTO reminder_count
  FROM payment_reminders
  WHERE reminder_type = '7_days_before'
  AND sent_at::date = CURRENT_DATE;
  
  RAISE NOTICE 'Processed % payment reminders for installments due in 7 days', reminder_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the cron job
-- This runs daily at 9 AM UTC (adjust timezone as needed)
-- The cron job calls the edge function via HTTP using pg_net extension

-- First, enable pg_net extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function that calls the edge function via HTTP
CREATE OR REPLACE FUNCTION trigger_payment_reminders()
RETURNS void AS $$
DECLARE
  supabase_url TEXT := 'https://gdhgsmccaqycmvxxoaif.supabase.co';
  service_role_key TEXT;
  response_id BIGINT;
BEGIN
  -- Get service role key from settings (you'll need to set this)
  -- For security, store it in a secure way or use environment variables
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  IF service_role_key IS NULL THEN
    RAISE WARNING 'Service role key not set. Cannot call edge function.';
    RETURN;
  END IF;
  
  -- Call the edge function via HTTP
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/process-payment-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := '{}'::jsonb
  ) INTO response_id;
  
  RAISE NOTICE 'Payment reminder processing triggered. Response ID: %', response_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: Simple cron job that logs (you'll call edge function externally)
-- Uncomment and run this to create the cron job:
/*
SELECT cron.schedule(
  'send-payment-reminders-7-days',
  '0 9 * * *', -- 9 AM UTC every day
  $$SELECT trigger_payment_reminders()$$
);
*/

-- Alternative: Run at 9 AM EST (14:00 UTC during standard time, 13:00 UTC during daylight time)
-- For EST: '0 14 * * *' (standard time) or '0 13 * * *' (daylight time)

-- ============================================
-- Manual Testing
-- ============================================

-- Test the function manually:
-- SELECT * FROM send_payment_reminders_7_days();

-- Or test the process function:
-- SELECT process_payment_reminders();

-- ============================================
-- View Cron Jobs
-- ============================================

-- View all cron jobs:
-- SELECT * FROM cron.job;

-- View cron job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- ============================================
-- Management Commands
-- ============================================

-- Update cron schedule (change to 10 AM UTC):
-- SELECT cron.alter_job(
--   job_id := (SELECT jobid FROM cron.job WHERE jobname = 'send-payment-reminders-7-days'),
--   schedule := '0 10 * * *'
-- );

-- Delete the cron job:
-- SELECT cron.unschedule('send-payment-reminders-7-days');

