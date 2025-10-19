# Migration Guide: Stripe Webhooks to Supabase Edge Functions

This guide will help you migrate from the current Next.js API route webhook handler to Supabase Edge Functions for better security and performance.

## Why Migrate to Edge Functions?

### Security Benefits
- **Direct Database Access**: Edge functions run on Supabase's infrastructure with direct access to your database
- **No Public API Exposure**: Your webhook processing logic is not exposed through your Next.js API routes
- **Built-in Security**: Supabase handles authentication and authorization
- **Isolated Environment**: Edge functions run in a secure, isolated environment

### Performance Benefits
- **Faster Response Times**: Edge functions are closer to your database
- **Automatic Scaling**: Supabase automatically scales edge functions based on demand
- **Reduced Cold Starts**: Edge functions have better cold start performance than serverless functions

## Migration Steps

### 1. Install Supabase CLI (if not already installed)

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

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference (found in your Supabase dashboard URL).

### 4. Set Environment Variables

In your Supabase Dashboard, go to Settings > Edge Functions and set these environment variables:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook endpoint secret
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 5. Deploy the Edge Function

```bash
npm run supabase:deploy
```

Or use the deployment script:

```bash
./deploy-edge-function.sh
```

### 6. Update Stripe Webhook Configuration

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Find your existing webhook endpoint
3. Update the endpoint URL to:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
4. Make sure the following events are selected:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

### 7. Test the Migration

1. Create a test payment in your application
2. Check the Stripe webhook delivery logs to ensure the new endpoint is receiving events
3. Verify that your database is being updated correctly
4. Check the edge function logs: `npm run supabase:logs`

### 8. Remove the Old Webhook Handler (Optional)

Once you've confirmed the edge function is working correctly, you can remove the old webhook handler:

```bash
rm src/app/api/webhooks/stripe/route.ts
```

## Monitoring and Troubleshooting

### View Edge Function Logs

```bash
npm run supabase:logs
```

### Check Stripe Webhook Delivery

1. Go to Stripe Dashboard > Webhooks
2. Click on your webhook endpoint
3. View the delivery logs to see if events are being processed successfully

### Common Issues

1. **Environment Variables Not Set**: Make sure all required environment variables are set in Supabase Dashboard
2. **Webhook Secret Mismatch**: Ensure the `STRIPE_WEBHOOK_SECRET` matches your Stripe webhook endpoint secret
3. **Database Permissions**: The edge function uses the service role key, so it should have full database access

## Rollback Plan

If you need to rollback to the old webhook handler:

1. Update your Stripe webhook URL back to your Next.js API route
2. The old webhook handler is still available at `/api/webhooks/stripe`
3. Remove the edge function if needed: `supabase functions delete stripe-webhook`

## Support

If you encounter any issues during migration:

1. Check the edge function logs: `npm run supabase:logs`
2. Verify environment variables are set correctly
3. Test with Stripe's webhook testing tool
4. Check the Supabase Dashboard for any error messages
