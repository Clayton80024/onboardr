-- ============================================
-- Check Your Installments - Simple Query
-- ============================================
-- Run this to see all your installments and when they're due
-- ============================================

-- See all pending installments with days until due
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
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 7 THEN '✅ Due in 7 days (WILL GET REMINDER TODAY)'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 6 THEN '📅 Due in 6 days (will get reminder tomorrow)'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 5 THEN '📅 Due in 5 days (will get reminder in 2 days)'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER < 7 AND EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER >= 0 THEN '⚠️ Due soon (past reminder window)'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER > 7 THEN '📅 Future (will get reminder later)'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER < 0 THEN '❌ Overdue'
  END AS reminder_status
FROM installments i
JOIN onboarding_data od ON i.onboarding_id = od.id
WHERE i.status = 'pending'
ORDER BY i.due_date ASC;

-- Summary: Count by status
SELECT 
  CASE 
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER = 7 THEN 'Due in 7 days (reminder today)'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER < 7 AND EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER >= 0 THEN 'Due soon (past reminder)'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER > 7 THEN 'Future (reminder later)'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER < 0 THEN 'Overdue'
  END AS status,
  COUNT(*) AS count
FROM installments
WHERE status = 'pending'
GROUP BY 
  CASE 
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER = 7 THEN 'Due in 7 days (reminder today)'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER < 7 AND EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER >= 0 THEN 'Due soon (past reminder)'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER > 7 THEN 'Future (reminder later)'
    WHEN EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER < 0 THEN 'Overdue'
  END
ORDER BY 
  CASE 
    WHEN status = 'Overdue' THEN 1
    WHEN status = 'Due soon (past reminder)' THEN 2
    WHEN status = 'Due in 7 days (reminder today)' THEN 3
    WHEN status = 'Future (reminder later)' THEN 4
  END;

