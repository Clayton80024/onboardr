# 🔍 Email Workflow Diagnostic Guide

## 📋 **Complete Workflow Analysis**

### Step 1: User Completes Onboarding
1. User fills out onboarding form
2. User enters payment information
3. Frontend calls: `https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/create-hybrid-payment`
4. Sends data including: `email: user?.emailAddresses[0]?.emailAddress`

### Step 2: Edge Function Processes
1. Edge function receives request
2. Processes payment via Stripe
3. Saves data to Supabase
4. **Attempts to send email via Resend**

### Step 3: Email Sending
1. Checks if `email` variable exists
2. Gets `RESEND_API_KEY` from environment
3. Calls Resend API: `https://api.resend.com/emails`
4. Sends email to Clerk sign-up email

## 🔍 **How to Diagnose the Issue**

### Check 1: Supabase Edge Functions Logs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/gdhgsmccaqycmvxxoaif)
2. Navigate to **Edge Functions** → **Logs**
3. Find the `create-hybrid-payment` function
4. Look for these log messages:

**✅ Good Signs:**
- `📧 Received email for user: user@example.com`
- `📧 Email sending check - email variable: user@example.com`
- `✅ RESEND_API_KEY found: re_B5f25EB...`
- `📧 Attempting to send email via Resend API...`
- `✅ Onboarding email sent successfully to user@example.com`

**❌ Problem Signs:**
- `📧 Received email for user: NOT PROVIDED` → Email not being sent from frontend
- `❌ No email address available` → Email variable is empty
- `❌ RESEND_API_KEY not set` → Environment variable missing
- `❌ Failed to send onboarding email` → Resend API error
- `❌ Status: 401` → Invalid API key
- `❌ Status: 422` → Invalid email format or domain not verified

### Check 2: Verify Environment Variables in Supabase

1. Go to Supabase Dashboard → **Edge Functions** → **Settings**
2. Verify these variables exist:
   - `RESEND_API_KEY` = `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`
   - `RESEND_FROM_EMAIL` = `noreply@notifications.tryinstallo.com`
   - `NEXT_PUBLIC_APP_URL` = `https://tryinstallo.com`

**Important:** Make sure you're adding them to **Edge Functions** settings, not just project settings!

### Check 3: Verify Resend Domain

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Check if `notifications.tryinstallo.com` is verified
3. Status should be: **✅ Verified**

If not verified:
- Click on the domain
- Add the DNS records provided by Resend
- Wait for verification (can take a few hours)

### Check 4: Check Resend Dashboard Logs

1. Go to [Resend Dashboard](https://resend.com/emails) → **Logs**
2. Look for email attempts
3. Check:
   - **Status:** Sent, Delivered, Bounced, Failed
   - **Error messages** (if any)
   - **Recipient email address**

### Check 5: Verify Email Address

The email should be sent to:
- **Clerk sign-up email** (the email used to create the account)
- NOT the email entered in the onboarding form

To verify:
1. Check what email you used to sign up with Clerk
2. That's where the email should go

## 🚨 **Common Issues & Solutions**

### Issue 1: "Email variable is empty"

**Symptoms:**
- Logs show: `📧 Received email for user: NOT PROVIDED`
- Logs show: `❌ No email address available`

**Causes:**
- Clerk user object not available in frontend
- `user?.emailAddresses[0]?.emailAddress` is undefined

**Solution:**
- Check if user is authenticated
- Verify Clerk is properly configured
- Check browser console for Clerk errors

### Issue 2: "RESEND_API_KEY not set"

**Symptoms:**
- Logs show: `❌ RESEND_API_KEY not set`

**Solution:**
1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add `RESEND_API_KEY` = `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`
3. **Redeploy the edge function** after adding

### Issue 3: "Resend API Error 401"

**Symptoms:**
- Logs show: `❌ Status: 401`
- Resend dashboard shows authentication error

**Causes:**
- Invalid API key
- API key not properly set

**Solution:**
- Verify API key is correct: `re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`
- Make sure there are no extra spaces
- Redeploy edge function

### Issue 4: "Resend API Error 422"

**Symptoms:**
- Logs show: `❌ Status: 422`
- Resend dashboard shows validation error

**Causes:**
- Domain not verified
- Invalid email format
- From email doesn't match verified domain

**Solution:**
- Verify `notifications.tryinstallo.com` is verified in Resend
- Or temporarily use `onboarding@resend.dev` for testing

### Issue 5: "Email sent but not received"

**Symptoms:**
- Logs show: `✅ Onboarding email sent successfully`
- Resend dashboard shows email sent
- But no email in inbox

**Solutions:**
- Check spam folder
- Verify email address (should be Clerk sign-up email)
- Check Resend dashboard for delivery status
- Some email providers delay delivery

## 📝 **Step-by-Step Diagnostic Process**

1. **Complete onboarding** on your live site
2. **Check Supabase logs** immediately:
   - Look for email-related logs
   - Note any errors
3. **Check Resend dashboard**:
   - Go to Logs
   - See if email attempt was made
   - Check error messages
4. **Verify environment variables**:
   - Supabase Edge Functions settings
   - All 3 variables present
5. **Check domain verification**:
   - Resend dashboard → Domains
   - `notifications.tryinstallo.com` should be verified

## 🔧 **Quick Fix Checklist**

- [ ] Environment variables added to Supabase Edge Functions
- [ ] Edge function redeployed after adding variables
- [ ] Domain verified in Resend (`notifications.tryinstallo.com`)
- [ ] Tested onboarding flow
- [ ] Checked Supabase Edge Functions logs
- [ ] Checked Resend dashboard logs
- [ ] Verified email address (Clerk sign-up email)
- [ ] Checked spam folder

## 📞 **What to Share for Debugging**

If emails still don't work, share:

1. **Supabase Edge Functions Logs:**
   - Copy all logs from the `create-hybrid-payment` function
   - Look for lines starting with `📧` or `❌`

2. **Resend Dashboard Screenshot:**
   - Go to Resend → Logs
   - Screenshot any failed attempts

3. **Environment Variables Status:**
   - Confirm all 3 variables are in Supabase Edge Functions settings

4. **Domain Verification Status:**
   - Screenshot from Resend → Domains showing verification status

---

**After deploying the updated edge function with better logging, check the logs to see exactly where the issue is!**

