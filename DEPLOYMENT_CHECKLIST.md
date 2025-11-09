# 🚀 Complete Deployment Checklist - ACH Payment System

## ✅ **Step 1: GitHub Deployment - COMPLETE** ✅

All ACH-related code has been committed and pushed to GitHub:
- ✅ Supabase Edge Function (`create-hybrid-payment`)
- ✅ Database migration script (`add-ach-support.sql`)
- ✅ Frontend components (dashboard, onboarding, payment forms)
- ✅ API routes and webhook handlers
- ✅ Documentation

**Commit**: `a46b913` - "Deploy ACH payment support - Complete hybrid payment system"
**Branch**: `development`

---

## 🔧 **Step 2: Supabase Edge Function Deployment**

### **Deploy the Hybrid Payment Function:**

```bash
cd /Users/clayton/Desktop/onboardr/wepply
supabase functions deploy create-hybrid-payment
```

### **Verify Deployment:**

```bash
# Check if function is deployed
supabase functions list

# Test the function endpoint
curl https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/create-hybrid-payment \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### **Required Environment Variables in Supabase:**

Make sure these are set in your Supabase project settings:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access
- `NEXT_PUBLIC_APP_URL` - Your application URL (for redirects)

---

## 🗄️ **Step 3: Database Migration**

### **Run the ACH Support Migration:**

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Using psql directly
psql -h YOUR_DB_HOST -U YOUR_USER -d YOUR_DB -f add-ach-support.sql

# Option 3: Via Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy contents of add-ach-support.sql
# 3. Run the SQL script
```

### **Verify Database Schema:**

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'installments' 
AND column_name IN ('payment_link', 'payment_method', 'payment_link_expires_at', 'payment_link_id');

-- Should return 4 rows
```

### **Verify Functions:**

```sql
-- Check if helper functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('is_payment_link_expired', 'refresh_expired_payment_link');

-- Should return 2 rows
```

---

## 🔗 **Step 4: Stripe Configuration**

### **Enable ACH Payments in Stripe:**

1. Go to Stripe Dashboard → Settings → Payment methods
2. Enable "US Bank Account (ACH Direct Debit)"
3. Complete any required verification steps

### **Update Webhook Endpoint:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add/Update webhook endpoint:
   - **URL**: `https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/stripe-webhook`
   - **Events to listen for**:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed` (for ACH payment links)
     - `payment_link.payment_failed`
3. Copy the webhook signing secret
4. Add to Supabase Edge Function environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 **Step 5: Testing**

### **Test Payment Flow:**

1. **Create Test Payment:**
   - Complete onboarding form
   - Select university
   - Select payment plan (Basic, Premium, or Flexible)
   - Enter payment information
   - Submit payment

2. **Verify First Payment:**
   - Check Stripe Dashboard for payment intent
   - Verify payment is processed via credit card
   - Check database for installment records

3. **Verify ACH Links:**
   - Check dashboard shows "Pay via ACH" buttons
   - Verify payment links are generated
   - Check database for `payment_link` values

4. **Test ACH Payment:**
   - Click "Pay via ACH" button
   - Verify Stripe payment link opens
   - Complete test payment (use Stripe test mode)
   - Verify webhook updates payment status

### **Test Checklist:**

- [ ] First payment processes via credit card
- [ ] ACH payment links are generated
- [ ] Dashboard shows "Pay via ACH" buttons
- [ ] Payment links open in new tab
- [ ] ACH payment completes successfully
- [ ] Webhook updates payment status
- [ ] Database records are correct
- [ ] Payment method indicators work (Card vs ACH)

---

## 🔍 **Step 6: Verification**

### **Check Edge Function Logs:**

```bash
supabase functions logs create-hybrid-payment
supabase functions logs stripe-webhook
```

### **Check Application Logs:**

- Monitor browser console for errors
- Check network requests to Edge Function
- Verify API responses

### **Database Verification:**

```sql
-- Check recent payments
SELECT 
  id,
  installment_number,
  amount,
  status,
  payment_method,
  payment_link IS NOT NULL as has_payment_link,
  payment_link_expires_at
FROM installments
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚨 **Troubleshooting**

### **Issue: Edge Function Not Found**

**Solution:**
```bash
# Redeploy the function
supabase functions deploy create-hybrid-payment --no-verify-jwt
```

### **Issue: Database Columns Missing**

**Solution:**
```bash
# Re-run migration
psql -h YOUR_DB_HOST -U YOUR_USER -d YOUR_DB -f add-ach-support.sql
```

### **Issue: ACH Payment Links Not Generated**

**Check:**
1. Edge Function logs for errors
2. Stripe API key is correct
3. ACH payments enabled in Stripe Dashboard
4. Environment variables are set correctly

### **Issue: Webhook Not Updating Status**

**Check:**
1. Webhook endpoint is correct in Stripe
2. Webhook secret is set in Edge Function
3. Webhook events are configured correctly
4. Check webhook logs in Stripe Dashboard

---

## 📊 **Monitoring**

### **Key Metrics to Track:**

1. **Payment Success Rate:**
   - Card payments: Should be ~98%+
   - ACH payments: Should be ~95%+

2. **Cost Savings:**
   - Track processing fees saved
   - Compare card vs ACH fees

3. **User Adoption:**
   - Track ACH vs card usage
   - Monitor payment completion rates

### **Dashboard Metrics:**

- Total payments processed
- ACH payment completion rate
- Average time to complete payments
- Payment method distribution
- Failed payment rate

---

## ✅ **Final Verification**

Before marking as complete, verify:

- [ ] All code is committed to GitHub
- [ ] Edge Function is deployed to Supabase
- [ ] Database migration is complete
- [ ] Stripe ACH payments are enabled
- [ ] Webhook endpoint is configured
- [ ] Test payment flow works end-to-end
- [ ] Dashboard shows ACH buttons correctly
- [ ] Payment links work correctly
- [ ] Webhook updates status correctly

---

## 🎉 **Deployment Complete!**

Once all steps are complete, your ACH payment system is live and ready to process payments!

**Next Steps:**
1. Monitor the system for the first few days
2. Track cost savings from ACH payments
3. Gather user feedback
4. Optimize based on real-world usage

---

**Last Updated**: $(date)
**Deployment Date**: Current
**Status**: Ready for Production

