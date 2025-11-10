# 🔧 Fix: Resend Domain Verification Error

## ❌ Error You're Seeing

```
"The associated domain with your API key is not verified. 
Please, create a new API key with full access or with a verified domain."
```

## ✅ Quick Fix: Use Test Email (Works Immediately)

For immediate testing, use Resend's test email address that doesn't require domain verification:

### Update Supabase Edge Functions Environment Variable

1. Go to **Supabase Dashboard** → **Edge Functions** → **Settings**
2. Find **Environment Variables** section
3. Update `RESEND_FROM_EMAIL`:
   - **Current:** `noreply@notifications.tryinstallo.com`
   - **Change to:** `onboarding@resend.dev`
4. Click **Save**

**No redeployment needed!** The change takes effect immediately.

## 🚀 Production Fix: Verify Your Domain

For production, you should verify your subdomain:

### Step 1: Verify Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/dashboard) → **Domains**
2. Click **Add Domain**
3. Enter: `notifications.tryinstallo.com`
4. Resend will provide DNS records (SPF, DKIM, DMARC)

### Step 2: Add DNS Records

Add these records to your domain's DNS (wherever you manage DNS for `tryinstallo.com`):

**Example DNS records Resend will provide:**
- **TXT Record** for SPF
- **TXT Record** for DKIM
- **CNAME Record** for DMARC (optional)

**Important:** Add these records for the **subdomain** `notifications.tryinstallo.com`, not the main domain.

### Step 3: Wait for Verification

- Usually takes **5-30 minutes**
- Can take up to **48 hours** in some cases
- Check Resend dashboard for verification status

### Step 4: Update Environment Variable Back

Once verified, update `RESEND_FROM_EMAIL` back to:
```
noreply@notifications.tryinstallo.com
```

## 📋 Current Status

**For Testing (Use Now):**
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**For Production (After Verification):**
```
RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
```

## ✅ Quick Action Steps

1. **Right Now:** Update `RESEND_FROM_EMAIL` in Supabase to `onboarding@resend.dev`
2. **Test:** Complete onboarding - email should work immediately
3. **Later:** Verify domain in Resend (when you have time)
4. **Switch Back:** Once verified, change back to `noreply@notifications.tryinstallo.com`

## 🔍 How to Check Domain Status

1. Go to Resend Dashboard → **Domains**
2. Look for `notifications.tryinstallo.com`
3. Status should show:
   - ✅ **Verified** (green checkmark)
   - ⏳ **Pending** (waiting for DNS)
   - ❌ **Failed** (check DNS records)

## 💡 Why This Happens

Resend requires domain verification to:
- Prevent spam
- Ensure email deliverability
- Build sender reputation

The test email `onboarding@resend.dev` bypasses this for development/testing.

---

**Action:** Update `RESEND_FROM_EMAIL` to `onboarding@resend.dev` in Supabase Edge Functions settings right now to get emails working immediately! 🚀

