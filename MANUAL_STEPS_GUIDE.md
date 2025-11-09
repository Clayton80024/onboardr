# 📋 Manual Steps Guide - What You Need to Do

## 🤔 **Why Are These "Manual Steps"?**

These steps require you to:
1. **Log into external services** (Supabase Dashboard, Stripe Dashboard) - I can't do this for you
2. **Run SQL commands** on your production database - For security, this must be done by you
3. **Configure payment settings** in Stripe - Requires your Stripe account access

I've automated everything I can (code, deployment), but these require your direct access to these services.

---

## 📊 **Step 1: Database Migration - Add ACH Support Columns**

### **What This Does:**
Adds 4 new columns to your `installments` table so the app can store:
- `payment_link` - The Stripe payment link URL for ACH payments
- `payment_method` - Whether payment is 'card' or 'ach'
- `payment_link_expires_at` - When the payment link expires
- `payment_link_id` - Stripe's payment link ID

**Without this:** The app will crash when trying to save ACH payment links because these columns don't exist yet.

### **How to Do It (Choose One Method):**

#### **Method 1: Supabase Dashboard (Easiest - Recommended)** ⭐

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Log in to your account
   - Select your project (the one with URL: `gdhgsmccaqycmvxxoaif.supabase.co`)

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the SQL:**
   - Open the file `add-ach-support.sql` in your project
   - Copy ALL the contents (lines 1-68)
   - Paste into the SQL Editor

4. **Run the SQL:**
   - Click the "Run" button (or press Cmd+Enter / Ctrl+Enter)
   - Wait for "Success. No rows returned" message

5. **Verify It Worked:**
   - In SQL Editor, run this query:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'installments' 
   AND column_name IN ('payment_link', 'payment_method', 'payment_link_expires_at', 'payment_link_id');
   ```
   - You should see 4 rows returned

**✅ Done!** Your database now supports ACH payments.

---

#### **Method 2: Command Line (If you have psql installed)**

```bash
# Get your database connection string from Supabase Dashboard:
# Settings → Database → Connection string (URI format)

# Then run:
psql "postgresql://postgres:[YOUR-PASSWORD]@db.gdhgsmccaqycmvxxoaif.supabase.co:5432/postgres" -f add-ach-support.sql
```

**Note:** Replace `[YOUR-PASSWORD]` with your actual database password from Supabase Dashboard.

---

## 💳 **Step 2: Stripe Configuration - Enable ACH Payments**

### **What This Does:**
1. Enables ACH (bank account) payments in your Stripe account
2. Configures webhooks so Stripe can notify your app when ACH payments complete
3. Ensures your Edge Function has the right API keys

**Without this:** 
- ACH payment links won't work (Stripe will reject them)
- Your app won't know when ACH payments complete (no webhook notifications)

### **How to Do It:**

#### **Part A: Enable ACH Payments in Stripe**

1. **Go to Stripe Dashboard:**
   - Visit: https://dashboard.stripe.com
   - Log in to your account

2. **Enable ACH Payments:**
   - Click "Settings" (gear icon) in the left sidebar
   - Click "Payment methods" 
   - Scroll down to find "US Bank Account (ACH Direct Debit)"
   - Toggle it to **ON** (green)
   - Complete any verification steps if prompted

3. **Save Changes:**
   - Click "Save changes" at the bottom

**✅ ACH payments are now enabled!**

---

#### **Part B: Configure Webhook Endpoint**

1. **Go to Webhooks Section:**
   - In Stripe Dashboard, click "Developers" in the left sidebar
   - Click "Webhooks"

2. **Add/Update Webhook Endpoint:**
   - Click "Add endpoint" (or edit existing one)
   - **Endpoint URL:** 
     ```
     https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/stripe-webhook
     ```
   - **Description:** "Supabase Edge Function - ACH Payment Webhooks"

3. **Select Events to Listen For:**
   - Click "Select events"
   - Check these events:
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `checkout.session.completed` (for ACH payment links)
     - ✅ `payment_link.payment_failed`
   - Click "Add events"

4. **Save and Copy Webhook Secret:**
   - Click "Add endpoint" (or "Update endpoint")
   - **IMPORTANT:** Copy the "Signing secret" (starts with `whsec_...`)
   - You'll need this in the next step

**✅ Webhook is configured!**

---

#### **Part C: Add Environment Variables to Supabase**

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open Edge Functions Settings:**
   - Click "Edge Functions" in the left sidebar
   - Click "Settings" or the gear icon

3. **Add/Update Environment Variables:**
   
   Make sure these are set:
   
   - **`STRIPE_SECRET_KEY`**
     - Value: Your Stripe Secret Key (starts with `sk_test_...` or `sk_live_...`)
     - Get it from: Stripe Dashboard → Developers → API keys → Secret key
   
   - **`STRIPE_WEBHOOK_SECRET`**
     - Value: The webhook signing secret you copied (starts with `whsec_...`)
     - This is from the webhook you just created
   
   - **`SUPABASE_URL`**
     - Value: `https://gdhgsmccaqycmvxxoaif.supabase.co`
     - (This might already be set)
   
   - **`SUPABASE_SERVICE_ROLE_KEY`**
     - Value: Your Supabase Service Role Key
     - Get it from: Supabase Dashboard → Settings → API → service_role key
     - ⚠️ **Keep this secret!** Never expose it in frontend code.

4. **Save Changes:**
   - Click "Save" or "Update"

**✅ Environment variables are set!**

---

## ✅ **Verification - Make Sure Everything Works**

### **Test Database Migration:**

Run this in Supabase SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'installments' 
AND column_name IN ('payment_link', 'payment_method', 'payment_link_expires_at', 'payment_link_id');
```

**Expected Result:** 4 rows showing the new columns

---

### **Test Stripe ACH:**

1. **Check ACH is Enabled:**
   - Stripe Dashboard → Settings → Payment methods
   - "US Bank Account (ACH Direct Debit)" should be **ON** (green)

2. **Check Webhook:**
   - Stripe Dashboard → Developers → Webhooks
   - Your webhook should show as "Active" with green status
   - Endpoint URL should match: `.../functions/v1/stripe-webhook`

3. **Test Webhook (Optional):**
   - Click on your webhook
   - Click "Send test webhook"
   - Select `payment_intent.succeeded`
   - Check Supabase Edge Function logs to see if it received it

---

### **Test Complete Flow:**

1. **Create a Test Payment:**
   - Go to your app
   - Complete onboarding
   - Make a payment

2. **Verify ACH Links Are Created:**
   - Check your dashboard
   - You should see "Pay via ACH" buttons for remaining installments

3. **Test ACH Payment:**
   - Click "Pay via ACH" button
   - Should open Stripe payment page
   - Complete test payment (use Stripe test mode)

4. **Verify Webhook Updates:**
   - Check database - payment status should update
   - Check Stripe Dashboard → Webhooks → Recent events

---

## 🚨 **Troubleshooting**

### **Database Migration Issues:**

**Problem:** "column already exists" error
- **Solution:** The columns already exist! You're all set. The `IF NOT EXISTS` should prevent this, but if you see it, just ignore it.

**Problem:** "permission denied" error
- **Solution:** Make sure you're using the SQL Editor in Supabase Dashboard (not a direct database connection). The SQL Editor has the right permissions.

---

### **Stripe Configuration Issues:**

**Problem:** ACH payments not showing up
- **Solution:** 
  1. Make sure ACH is enabled in Payment methods
  2. Check you're in the right Stripe account (test vs live mode)
  3. Some countries/regions have restrictions - check Stripe docs

**Problem:** Webhook not receiving events
- **Solution:**
  1. Verify webhook URL is correct
  2. Check webhook is "Active" (green status)
  3. Verify `STRIPE_WEBHOOK_SECRET` is set correctly in Supabase
  4. Check Edge Function logs: `npm run supabase:logs`

**Problem:** "Invalid API key" errors
- **Solution:**
  1. Verify `STRIPE_SECRET_KEY` is set in Supabase Edge Function settings
  2. Make sure you're using the right key (test vs live)
  3. Check the key hasn't expired or been revoked

---

## 📝 **Quick Checklist**

Before you start, make sure you have:
- [ ] Access to Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Access to Stripe Dashboard (https://dashboard.stripe.com)
- [ ] The file `add-ach-support.sql` (it's in your project folder)

**After completing both steps:**
- [ ] Database has 4 new columns in `installments` table
- [ ] ACH payments enabled in Stripe
- [ ] Webhook endpoint configured
- [ ] Environment variables set in Supabase
- [ ] Test payment works end-to-end

---

## ⏱️ **Time Estimate**

- **Database Migration:** 5 minutes
- **Stripe Configuration:** 10 minutes
- **Testing:** 5 minutes

**Total: ~20 minutes**

---

## 🆘 **Need Help?**

If you get stuck:
1. Check the error message carefully
2. Verify you're in the right account/dashboard
3. Make sure you copied values correctly (no extra spaces)
4. Check Supabase/Stripe documentation
5. Review the troubleshooting section above

---

**Once both steps are complete, your ACH payment system will be fully operational!** 🎉

