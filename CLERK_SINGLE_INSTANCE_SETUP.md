# Clerk Production Configuration - Single Instance Setup

## 🔍 Understanding Clerk's Architecture

**Important**: Clerk uses a **single instance** for both development and production. You don't create separate instances - you configure the same instance to work with multiple environments.

## 🚀 How to Configure Your Existing Clerk Instance for Production

### Step 1: Access Your Clerk Dashboard
1. Go to [clerk.com](https://clerk.com) and sign in
2. Select your existing application (the one you're currently using for development)

### Step 2: Configure Domains & URLs
In your Clerk dashboard, navigate to **"Domains & URLs"** section:

#### Add Production Domain:
- **Primary Domain**: `tryinstallo.com`
- **Additional Domains**: You can add `www.tryinstallo.com` if needed

#### Configure URLs:
- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/onboarding`
- **After sign-up URL**: `/onboarding`

### Step 3: Environment Configuration
Clerk automatically handles development vs production based on your keys:

#### Development Keys (what you have now):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### Production Keys (same instance, different keys):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Step 4: Get Your Production Keys
1. In your Clerk dashboard, look for **"API Keys"** section
2. You should see both:
   - **Test keys** (for development) - `pk_test_...` and `sk_test_...`
   - **Live keys** (for production) - `pk_live_...` and `sk_live_...`

### Step 5: Configure Allowed Redirect URLs
In **"Domains & URLs"** section, add these to **"Allowed redirect URLs"**:
```
https://tryinstallo.com/sign-in
https://tryinstallo.com/sign-up
https://tryinstallo.com/onboarding
https://tryinstallo.com/dashboard
```

## 🔧 Alternative: Use Test Keys for Production (Quick Solution)

If you can't find production keys or want to test quickly:

### Option 1: Use Test Keys Temporarily
```env
# Use your existing test keys for now
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_existing_key
CLERK_SECRET_KEY=sk_test_your_existing_secret
```

### Option 2: Enable Production Mode
1. In Clerk dashboard, look for **"Environment"** or **"Mode"** settings
2. Switch from "Development" to "Production" mode
3. This will enable live keys and production features

## 🎯 Step-by-Step Action Plan

### Immediate Steps:
1. **Check your Clerk dashboard** for "API Keys" section
2. **Look for both test and live keys** (they should both be there)
3. **Configure your domain** `tryinstallo.com` in "Domains & URLs"
4. **Add redirect URLs** for your production domain

### If You Only See Test Keys:
1. **Contact Clerk support** - they can help enable production keys
2. **Check your Clerk plan** - some features might be plan-dependent
3. **Use test keys temporarily** while you resolve this

## 🆘 Troubleshooting

### Can't Find Production Keys?
- **Check your Clerk plan** - production keys might require a paid plan
- **Look in "Settings" → "API Keys"** - they might be in a different section
- **Contact Clerk support** - they're very helpful with setup issues

### Still Using Development Mode?
- **This is normal** - many apps use test keys in production initially
- **Test keys work fine** for production if configured properly
- **Upgrade later** when you need advanced features

## 📞 Next Steps

1. **Check your Clerk dashboard** for production keys
2. **Configure your domain** `tryinstallo.com`
3. **Add redirect URLs** for production
4. **Deploy with appropriate keys** (test or live)
5. **Test authentication** on your live domain

Your single Clerk instance can absolutely handle production - you just need to configure it properly!
