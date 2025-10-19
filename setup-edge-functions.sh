#!/bin/bash

# Setup script for Supabase Edge Functions
# This script will guide you through the setup process

echo "🚀 Setting up Supabase Edge Functions for Stripe Webhooks"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed"

# Check if we're already linked
if [ -f ".supabase/config.toml" ]; then
    echo "✅ Project is already linked to Supabase"
else
    echo "🔗 Linking to Supabase project..."
    echo ""
    echo "To complete the setup, you need to:"
    echo "1. Get your Supabase access token from: https://supabase.com/dashboard/account/tokens"
    echo "2. Run: export SUPABASE_ACCESS_TOKEN=your_token_here"
    echo "3. Then run: supabase link --project-ref gdhgsmccaqycmvxxoaif"
    echo ""
    echo "Or you can login interactively:"
    echo "supabase login"
    echo "supabase link --project-ref gdhgsmccaqycmvxxoaif"
    echo ""
    read -p "Press Enter after you've completed the login and linking process..."
fi

# Check if we're linked now
if [ -f ".supabase/config.toml" ]; then
    echo "✅ Project linked successfully!"
    
    # Deploy the edge function
    echo "📦 Deploying stripe-webhook edge function..."
    supabase functions deploy stripe-webhook
    
    if [ $? -eq 0 ]; then
        echo "✅ Edge function deployed successfully!"
        echo ""
        echo "🔗 Your webhook endpoint is now available at:"
        echo "https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/stripe-webhook"
        echo ""
        echo "📝 Next steps:"
        echo "1. Go to your Stripe Dashboard: https://dashboard.stripe.com/webhooks"
        echo "2. Update your webhook endpoint URL to:"
        echo "   https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/stripe-webhook"
        echo "3. Make sure these events are selected:"
        echo "   - payment_intent.succeeded"
        echo "   - payment_intent.payment_failed"
        echo "   - invoice.payment_succeeded"
        echo "   - invoice.payment_failed"
        echo "   - customer.subscription.deleted"
        echo ""
        echo "4. Set these environment variables in your Supabase Dashboard:"
        echo "   - STRIPE_SECRET_KEY"
        echo "   - STRIPE_WEBHOOK_SECRET"
        echo "   - SUPABASE_URL"
        echo "   - SUPABASE_SERVICE_ROLE_KEY"
        echo ""
        echo "5. Test the webhook with: node test-edge-function.js"
    else
        echo "❌ Deployment failed. Please check the error messages above."
        exit 1
    fi
else
    echo "❌ Project linking failed. Please complete the login process first."
    exit 1
fi
