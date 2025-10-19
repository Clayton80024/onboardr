# Supabase Edge Functions for Stripe Webhooks

This directory contains Supabase Edge Functions for handling Stripe webhooks securely on Supabase's infrastructure.

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to your Supabase project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Set Environment Variables

Set the following environment variables in your Supabase project dashboard:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook endpoint secret
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 5. Deploy the Edge Function

```bash
npm run supabase:deploy
```

## Usage

### Webhook Endpoint

After deployment, your webhook endpoint will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

### Update Stripe Webhook Configuration

1. Go to your Stripe Dashboard
2. Navigate to Webhooks
3. Update your webhook endpoint URL to use the Supabase Edge Function URL
4. Make sure to include the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

## Local Development

### Start Supabase locally

```bash
npm run supabase:start
```

### View logs

```bash
npm run supabase:logs
```

### Stop Supabase

```bash
npm run supabase:stop
```

## Security Benefits

Using Supabase Edge Functions for Stripe webhooks provides several security advantages:

1. **Direct Database Access**: Edge functions run on Supabase's infrastructure with direct access to your database
2. **No Public API Exposure**: Your webhook processing logic is not exposed through your Next.js API routes
3. **Built-in Security**: Supabase handles authentication and authorization
4. **Isolated Environment**: Edge functions run in a secure, isolated environment
5. **Automatic Scaling**: Supabase automatically scales edge functions based on demand

## Function Details

The `stripe-webhook` edge function handles the following Stripe events:

- `payment_intent.succeeded`: Updates installment status to 'paid'
- `payment_intent.payment_failed`: Updates installment status to 'failed'
- `invoice.payment_succeeded`: Updates subscription installment status to 'paid'
- `invoice.payment_failed`: Updates subscription installment status to 'failed'
- `customer.subscription.deleted`: Updates onboarding status to 'cancelled'

## Monitoring

You can monitor your edge function through:
- Supabase Dashboard > Edge Functions
- Function logs: `npm run supabase:logs`
- Stripe Dashboard > Webhooks (for delivery status)
