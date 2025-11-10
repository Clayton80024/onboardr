#!/bin/bash

# ============================================
# Payment Reminder Cron Job Setup Script
# ============================================
# This script helps set up the payment reminder cron job
# It creates an edge function trigger that calls the email function
# ============================================

echo "🚀 Setting up Payment Reminder Cron Job..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Deploy the payment reminder edge function
echo -e "${YELLOW}Step 1: Deploying payment reminder edge function...${NC}"
cd "$(dirname "$0")"
supabase functions deploy send-payment-reminder

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Edge function deployed successfully!${NC}"
else
  echo "❌ Failed to deploy edge function"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Setting up database function and cron job...${NC}"
echo "Please run the SQL script in Supabase Dashboard:"
echo "  1. Go to Supabase Dashboard → SQL Editor"
echo "  2. Open: setup-payment-reminders.sql"
echo "  3. Run the script"
echo "  4. Uncomment and run the cron.schedule() command"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "  1. Run setup-payment-reminders.sql in Supabase SQL Editor"
echo "  2. Uncomment the cron.schedule() line and run it"
echo "  3. Verify cron job is created: SELECT * FROM cron.job;"
echo "  4. Test manually: SELECT process_payment_reminders();"
echo ""
echo "🔍 To monitor:"
echo "  - View cron jobs: SELECT * FROM cron.job;"
echo "  - View run history: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;"
echo ""

