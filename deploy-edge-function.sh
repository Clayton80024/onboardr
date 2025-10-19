#!/bin/bash

# Deploy Supabase Edge Function for Stripe Webhooks
# This script helps deploy the edge function to Supabase

echo "🚀 Deploying Stripe Webhook Edge Function to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ You are not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

# Deploy the edge function
echo "📦 Deploying stripe-webhook function..."
supabase functions deploy stripe-webhook

if [ $? -eq 0 ]; then
    echo "✅ Edge function deployed successfully!"
    echo ""
    echo "🔗 Your webhook endpoint is now available at:"
    echo "https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your Stripe webhook endpoint URL in the Stripe Dashboard"
    echo "2. Make sure your environment variables are set in Supabase Dashboard"
    echo "3. Test the webhook with a test event"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
