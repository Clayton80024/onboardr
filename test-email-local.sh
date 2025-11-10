#!/bin/bash

# Test email sending locally
# This script tests the email API endpoint directly

echo "🧪 Testing Resend Email Integration..."
echo ""

# Check if .env.local exists and has RESEND_API_KEY
if [ ! -f .env.local ]; then
  echo "❌ .env.local file not found!"
  exit 1
fi

if ! grep -q "RESEND_API_KEY" .env.local; then
  echo "❌ RESEND_API_KEY not found in .env.local!"
  exit 1
fi

echo "✅ Environment variables found"
echo ""

# Test email endpoint
echo "📧 Sending test email..."
echo ""

curl -X POST http://localhost:3000/api/send-onboarding-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "universityName": "Harvard University",
    "tuitionAmount": 5000,
    "adminFee": 325,
    "totalAmount": 5325,
    "paymentPlan": "premium",
    "installmentAmount": 760.71,
    "totalPayments": 7,
    "remainingPayments": 6,
    "studentId": "STU12345",
    "studentEmail": "student@harvard.edu"
  }'

echo ""
echo ""
echo "✅ Test complete! Check the response above."
echo "📬 If successful, check your email inbox (or Resend dashboard → Logs)"

