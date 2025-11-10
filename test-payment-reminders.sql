-- ============================================
-- Payment Reminder Diagnostic Queries
-- ============================================
-- Run these queries to check your installments and test the reminder system
-- ============================================

-- 1. Check all pending installments and their due dates
SELECT 
  i.id,
  i.installment_number,
  i.amount,
  i.due_date,
  i.status,
  i.payment_method,
  od.email,
  od.first_name,
  od.last_name,
  od.university_name,
  EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER AS days_until_due,
  CASE 
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 7 THEN '✅ Due in 7 days (will get reminder)'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER < 7 THEN '⚠️ Due in less than 7 days'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER > 7 THEN '📅 Due in more than 7 days'
    WHEN i.due_date < CURRENT_DATE THEN '❌ Overdue'
  END AS reminder_status
FROM installments i
JOIN onboarding_data od ON i.onboarding_id = od.id
WHERE i.status = 'pending'
ORDER BY i.due_date ASC;

-- 2. Check installments due in exactly 7 days (what the reminder system looks for)
SELECT 
  i.id,
  i.installment_number,
  i.amount,
  i.due_date,
  od.email,
  od.first_name,
  od.last_name,
  EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER AS days_until_due
FROM installments i
JOIN onboarding_data od ON i.onboarding_id = od.id
WHERE i.status = 'pending'
AND EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 7
AND od.email IS NOT NULL
AND od.email != '';

-- 3. Check if reminders have been sent
SELECT 
  pr.*,
  i.installment_number,
  i.amount,
  i.due_date
FROM payment_reminders pr
JOIN installments i ON pr.installment_id = i.id
ORDER BY pr.sent_at DESC
LIMIT 20;

-- 4. Count installments by days until due
SELECT 
  EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER AS days_until_due,
  COUNT(*) AS count,
  CASE 
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER = 7 THEN '✅ Will get reminder today'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER < 7 THEN '⚠️ Past reminder window'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER > 7 THEN '📅 Future reminder'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER < 0 THEN '❌ Overdue'
  END AS status
FROM installments
WHERE status = 'pending'
GROUP BY EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER
ORDER BY days_until_due;

-- 5. Create a test installment due in 7 days (for testing)
-- WARNING: Only run this if you want to create test data!
-- Make sure you have at least one onboarding_data record first

/*
-- First, get an onboarding_id to use:
SELECT id, email, first_name, last_name FROM onboarding_data LIMIT 1;

-- Then create a test installment (replace 'YOUR_ONBOARDING_ID' with actual ID):
INSERT INTO installments (
  onboarding_id,
  installment_number,
  amount,
  due_date,
  status,
  payment_method,
  created_at
) VALUES (
  'YOUR_ONBOARDING_ID'::uuid,  -- Replace with actual onboarding_id
  99,                           -- Test installment number
  100.00,                       -- Test amount
  CURRENT_DATE + INTERVAL '7 days',  -- Due in exactly 7 days
  'pending',
  'ach',
  NOW()
);

-- Verify the test installment:
SELECT 
  i.*,
  EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER AS days_until_due
FROM installments i
WHERE i.installment_number = 99;
*/

-- 6. Check what the reminder function would find RIGHT NOW
SELECT 
  CURRENT_DATE AS today,
  CURRENT_DATE + INTERVAL '7 days' AS seven_days_from_now,
  COUNT(*) AS installments_due_in_7_days
FROM installments i
JOIN onboarding_data od ON i.onboarding_id = od.id
WHERE i.status = 'pending'
AND i.due_date::date = (CURRENT_DATE + INTERVAL '7 days')::date
AND od.email IS NOT NULL
AND od.email != '';

