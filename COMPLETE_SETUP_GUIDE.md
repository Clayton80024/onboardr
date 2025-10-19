# Complete Setup Guide: Supabase Edge Functions for Stripe Webhooks

I've created all the necessary files for your Supabase Edge Functions integration. Now you need to complete a few steps to deploy and activate them.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)
2. Click "Generate new token"
3. Copy the token (it starts with `sbp_`)

### Step 2: Set Environment Variable and Deploy

Run these commands in your terminal:

```bash
cd /Users/clayton/Desktop/onboardr/installo

# Set your access token (replace with your actual token)
export SUPABASE_ACCESS_TOKEN=your_token_here

# Link to your project
supabase link --project-ref gdhgsmccaqycmvxxoaif

# Deploy the edge function
supabase functions deploy stripe-webhook
```

### Step 3: Set Environment Variables in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/gdhgsmccaqycmvxxoaif/settings/edge-functions)
2. Navigate to Settings > Edge Functions
3. Add these environment variables:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SUPABASE_URL=https://gdhgsmccaqycmvxxoaif.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Step 4: Update Stripe Webhook Configuration

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Find your existing webhook endpoint
3. Update the endpoint URL to:
   ```
   https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/stripe-webhook
   ```
4. Ensure these events are selected:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

### Step 5: Test the Integration

```bash
# Test the edge function
node test-edge-function.js
```

## 📁 Files Created

I've created the following files for you:

- `supabase/functions/stripe-webhook/index.ts` - The main edge function
- `supabase/config.toml` - Supabase configuration
- `supabase/functions/stripe-webhook/deno.json` - Deno configuration
- `deploy-edge-function.sh` - Deployment script
- `test-edge-function.js` - Test script
- `setup-edge-functions.sh` - Setup script
- `supabase/README.md` - Documentation
- `EDGE_FUNCTION_MIGRATION.md` - Migration guide

## 🔒 Security Benefits

Your webhook processing now runs on Supabase's secure infrastructure with:

- Direct database access (no API exposure)
- Built-in authentication and authorization
- Automatic scaling
- Isolated execution environment
- Better performance and reliability

## 🧪 Testing

After deployment, you can test the webhook by:

1. Creating a test payment in your app
2. Checking Stripe webhook delivery logs
3. Verifying database updates
4. Running the test script: `node test-edge-function.js`

## 📊 Monitoring

Monitor your edge function through:

- Supabase Dashboard > Edge Functions
- Function logs: `supabase functions logs stripe-webhook`
- Stripe Dashboard > Webhooks (delivery status)

## 🆘 Troubleshooting

If you encounter issues:

1. **Deployment fails**: Check your access token and project reference
2. **Webhook not receiving events**: Verify the endpoint URL in Stripe
3. **Database not updating**: Check environment variables in Supabase
4. **Function errors**: Check logs with `supabase functions logs stripe-webhook`

## 🎯 Next Steps

Once everything is working:

1. Monitor the webhook delivery in Stripe Dashboard
2. Test with real payments
3. Remove the old webhook handler (`src/app/api/webhooks/stripe/route.ts`) if desired
4. Update your deployment process to include edge function deployment

Your Stripe webhooks are now running on Supabase's secure infrastructure! 🎉
