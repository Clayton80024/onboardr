# 🔍 Payment Reminder Debugging Guide

## ✅ Your Function is Working!

The response `"No installments due in 7 days"` means:
- ✅ The function is running correctly
- ✅ The query is working
- ✅ There just aren't any installments due in exactly 7 days right now

## 🔍 Diagnostic Steps

### Step 1: Check Your Installments

Run this in Supabase SQL Editor:

```sql
-- See all pending installments and when they're due
SELECT 
  i.id,
  i.installment_number,
  i.amount,
  i.due_date,
  i.status,
  EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER AS days_until_due,
  CASE 
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 7 THEN '✅ Due in 7 days'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER < 7 THEN '⚠️ Due soon'
    WHEN EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER > 7 THEN '📅 Future'
    WHEN i.due_date < CURRENT_DATE THEN '❌ Overdue'
  END AS status
FROM installments i
WHERE i.status = 'pending'
ORDER BY i.due_date ASC;
```

### Step 2: Check What the Function Would Find

```sql
-- Check installments due in exactly 7 days
SELECT 
  i.id,
  i.installment_number,
  i.amount,
  i.due_date,
  od.email,
  EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER AS days_until_due
FROM installments i
JOIN onboarding_data od ON i.onboarding_id = od.id
WHERE i.status = 'pending'
AND EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 7
AND od.email IS NOT NULL;
```

### Step 3: Create a Test Installment (Optional)

If you want to test the reminder system, create a test installment due in 7 days:

```sql
-- First, get an onboarding_id
SELECT id, email FROM onboarding_data LIMIT 1;

-- Then create test installment (replace 'YOUR_ONBOARDING_ID')
INSERT INTO installments (
  onboarding_id,
  installment_number,
  amount,
  due_date,
  status,
  payment_method
) VALUES (
  'YOUR_ONBOARDING_ID'::uuid,  -- Replace with actual ID
  99,                          -- Test number
  100.00,
  CURRENT_DATE + INTERVAL '7 days',
  'pending',
  'ach'
);
```

Then run the reminder function again - it should find this test installment!

## 📊 Understanding the Results

### If you see installments but no reminders:

1. **Check email addresses:**
   ```sql
   SELECT i.id, od.email 
   FROM installments i
   JOIN onboarding_data od ON i.onboarding_id = od.id
   WHERE i.status = 'pending'
   AND EXTRACT(DAY FROM (i.due_date - CURRENT_DATE))::INTEGER = 7;
   ```
   - Emails must be NOT NULL and not empty

2. **Check if reminders already sent today:**
   ```sql
   SELECT * FROM payment_reminders 
   WHERE sent_at::date = CURRENT_DATE;
   ```

3. **Check installment status:**
   - Must be `'pending'` (not `'paid'`, `'failed'`, etc.)

### If you don't see any installments:

- You might not have any pending installments
- Or they're not due in exactly 7 days
- Check when they ARE due with the diagnostic query above

## 🧪 Testing the Full Flow

1. **Create test data:**
   - Use the SQL above to create an installment due in 7 days

2. **Run the reminder function:**
   ```bash
   curl -X POST https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/process-payment-reminders \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
   ```

3. **Check the response:**
   - Should show `remindersSent: 1` (or more)
   - Check your email inbox

4. **Verify in database:**
   ```sql
   SELECT * FROM payment_reminders ORDER BY sent_at DESC LIMIT 5;
   ```

## 🎯 Common Scenarios

### Scenario 1: No Installments
**Response:** `"No installments due in 7 days"`
**Solution:** This is normal if you don't have installments due in exactly 7 days

### Scenario 2: Installments Exist But No Reminders
**Check:**
- Email addresses are set
- Status is 'pending'
- Not already sent today

### Scenario 3: Installments Due in 6 Days
**Response:** `"No installments due in 7 days"`
**Explanation:** The system only sends reminders for installments due in exactly 7 days. Tomorrow, installments due in 6 days will be due in 7 days.

## 📅 When Will Reminders Be Sent?

The cron job runs daily at 9 AM UTC. It will:
- Find installments due in exactly 7 days
- Send reminders
- Track them in `payment_reminders` table

**Example:**
- Today: Nov 10
- Installment due: Nov 17 (7 days away)
- Reminder sent: Today at 9 AM UTC ✅

## 🔧 Quick Fixes

### See All Pending Installments:
```sql
SELECT 
  installment_number,
  amount,
  due_date,
  status,
  EXTRACT(DAY FROM (due_date - CURRENT_DATE))::INTEGER AS days_away
FROM installments
WHERE status = 'pending'
ORDER BY due_date;
```

### Check Reminder History:
```sql
SELECT 
  pr.sent_at,
  pr.reminder_type,
  i.installment_number,
  i.due_date,
  pr.email_sent_to
FROM payment_reminders pr
JOIN installments i ON pr.installment_id = i.id
ORDER BY pr.sent_at DESC;
```

---

**The system is working correctly!** It's just waiting for installments that are due in exactly 7 days. 🎉

