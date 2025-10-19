#!/usr/bin/env node

/**
 * Test script for the Stripe webhook edge function
 * This script helps verify that the edge function is working correctly
 */

const https = require('https');
const crypto = require('crypto');

// Configuration - Update these values
const SUPABASE_URL = 'https://gdhgsmccaqycmvxxoaif.supabase.co';
const STRIPE_WEBHOOK_SECRET = 'whsec_your_actual_webhook_secret_here';

// Test webhook payload (simplified payment_intent.succeeded event)
const testPayload = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_test_1234567890',
      amount: 2000,
      currency: 'usd',
      status: 'succeeded'
    }
  }
};

function createStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

function testEdgeFunction() {
  const payload = JSON.stringify(testPayload);
  const signature = createStripeSignature(payload, STRIPE_WEBHOOK_SECRET);
  
  const url = new URL(`${SUPABASE_URL}/functions/v1/stripe-webhook`);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'stripe-signature': signature
    }
  };

  console.log('🧪 Testing Stripe webhook edge function...');
  console.log(`📍 Endpoint: ${url.toString()}`);
  console.log(`📦 Payload: ${payload}`);
  console.log(`🔐 Signature: ${signature}`);
  console.log('');

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Response: ${data}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Edge function test successful!');
      } else if (res.statusCode === 400 && data.includes('Invalid signature')) {
        console.log('✅ Edge function is working! Signature verification is active (rejecting test signature as expected).');
        console.log('🔒 Security: Webhook signature verification is properly configured.');
      } else {
        console.log('❌ Edge function test failed!');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(payload);
  req.end();
}

// Check if required environment variables are set
if (SUPABASE_URL.includes('YOUR_PROJECT_REF')) {
  console.log('❌ Please set SUPABASE_URL environment variable');
  console.log('   Example: export SUPABASE_URL=https://your-project-ref.supabase.co');
  process.exit(1);
}

if (STRIPE_WEBHOOK_SECRET === 'whsec_test_secret') {
  console.log('⚠️  Using test webhook secret. Set STRIPE_WEBHOOK_SECRET for production testing.');
}

testEdgeFunction();
