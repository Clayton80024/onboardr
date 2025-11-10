# 🧪 Testing Email Workflow After Setup

## ✅ **What You've Done**

1. ✅ Added Resend variables to **Supabase Edge Functions**:
   - `RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX`
   - `RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com`
   - `NEXT_PUBLIC_APP_URL=https://tryinstallo.com`

2. ✅ Added Resend variables to **Netlify** (for Next.js app)

## 🔧 **Next Steps - Deploy Updated Edge Function**

Since we updated the edge function code to call Resend directly, you need to redeploy it:

### Option 1: Deploy via Supabase CLI (Recommended)

```bash
cd /Users/clayton/Desktop/onboardr/wepply

# Make sure you're logged in
supabase login

# Link to your project (if not already linked)
supabase link --project-ref gdhgsmccaqycmvxxoaif

# Deploy the updated edge function
supabase functions deploy create-hybrid-payment
```

### Option 2: Deploy via Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/gdhgsmccaqycmvxxoaif)
2. Navigate to **Edge Functions**
3. Find `create-hybrid-payment`
4. Click **Deploy** or **Redeploy**

## 🧪 **Testing the Email Workflow**

### Step 1: Complete Onboarding

1. Go to your live site: `https://tryinstallo.com`
2. Sign up/Sign in with Clerk
3. Complete the onboarding flow:
   - Select university
   - Enter tuition amount
   - Choose payment plan
   - Enter personal information
   - Complete payment

### Step 2: Check Logs

#### Check Supabase Edge Functions Logs:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/gdhgsmccaqycmvxxoaif)
2. Navigate to **Edge Functions** → **Logs**
3. Look for `create-hybrid-payment` function logs
4. You should see:
   - `📧 Sending onboarding email to Clerk user: user@example.com`
   - `📧 Onboarding email sent successfully to user@example.com: {email_id}`

#### Check Resend Dashboard:

1. Go to [Resend Dashboard](https://resend.com/emails) → **Logs**
2. You should see:
   - Email sent to your Clerk sign-up email
   - Delivery status
   - Any errors (if any)

### Step 3: Check Your Email

1. Check your **Clerk sign-up email inbox**
2. Look for email from: `noreply@notifications.tryinstallo.com`
3. Subject: `Welcome to Installo! Your payment plan is ready 🎓`
4. Check spam folder if not in inbox

## 🔍 **Troubleshooting**

### If Email Not Sent:

1. **Check Supabase Logs:**
   - Look for: `⚠️ RESEND_API_KEY not set`
   - This means variables aren't properly set

2. **Verify Environment Variables:**
   - Go to Supabase Dashboard → Edge Functions → Settings
   - Make sure all 3 variables are there:
     - `RESEND_API_KEY`
     - `RESEND_FROM_EMAIL`
     - `NEXT_PUBLIC_APP_URL`

3. **Check Resend Dashboard:**
   - Go to Resend → Logs
   - Look for failed attempts
   - Check error messages

4. **Verify Domain:**
   - Make sure `notifications.tryinstallo.com` is verified in Resend
   - Or temporarily use `onboarding@resend.dev` for testing

### Common Issues:

**"RESEND_API_KEY not set"**
- ✅ Go to Supabase → Edge Functions → Settings
- ✅ Add `RESEND_API_KEY` variable
- ✅ Make sure you're adding to **Edge Functions**, not just project settings

**"Failed to send email"**
- ✅ Check Resend dashboard → Logs for detailed error
- ✅ Verify domain is verified in Resend
- ✅ Check that `RESEND_FROM_EMAIL` matches verified domain

**"Email not received"**
- ✅ Check spam folder
- ✅ Verify email address (should be Clerk sign-up email)
- ✅ Check Resend dashboard → Logs to see if it was sent

## ✅ **Success Indicators**

You'll know it's working when:

1. ✅ Supabase logs show: `📧 Onboarding email sent successfully`
2. ✅ Resend dashboard shows email sent
3. ✅ You receive email in your Clerk sign-up email inbox
4. ✅ Email has correct content (payment plan summary, etc.)

## 📝 **Quick Checklist**

- [ ] Environment variables added to Supabase Edge Functions
- [ ] Edge function redeployed with new code
- [ ] Tested onboarding flow on live site
- [ ] Checked Supabase Edge Functions logs
- [ ] Checked Resend dashboard logs
- [ ] Received email in inbox

---

**After deploying the edge function, test the workflow and let me know if emails are being sent!** 🚀

