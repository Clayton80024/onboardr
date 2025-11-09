# Clerk + Netlify Setup Guide

## 🎯 **Recommendation: Create New Clerk Project**

Since your current Clerk is managed by Vercel Marketplace and you want to use Netlify, creating a new Clerk project is the **best solution**. Here's why:

### ✅ **Benefits of New Clerk Project:**
- **Full control** over configuration
- **No Vercel dependencies** 
- **Works perfectly with Netlify**
- **Clean setup** without marketplace limitations
- **Better long-term flexibility**

## 🚀 **Step-by-Step Setup**

### Step 1: Create New Clerk Project
1. Go to [clerk.com](https://clerk.com)
2. **Sign out** of your current account (if needed)
3. **Create a new account** or use a different email
4. **Create a new application** (not through Vercel Marketplace)
5. **Choose "Custom"** or "Manual" setup option

### Step 2: Configure Your New Clerk Project
1. **Project Name**: "Installo Production"
2. **Domain**: `tryinstallo.com`
3. **Authentication Methods**: Email + Password (or your preferred methods)

### Step 3: Get Your New Keys
In your new Clerk dashboard:
1. Go to **"API Keys"** section
2. Copy your **Publishable Key** (`pk_test_...`)
3. Copy your **Secret Key** (`sk_test_...`)

### Step 4: Configure URLs
In **"Domains & URLs"**:
- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/onboarding`
- **After sign-up URL**: `/onboarding`

### Step 5: Add Redirect URLs
Add these to **"Allowed redirect URLs"**:
```
https://tryinstallo.com/sign-in
https://tryinstallo.com/sign-up
https://tryinstallo.com/onboarding
https://tryinstallo.com/dashboard
```

## 🔧 **Update Your Application**

### Step 1: Update Environment Variables
Create a new `.env.local` file:
```env
# New Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_new_key_here
CLERK_SECRET_KEY=sk_test_your_new_secret_here

# URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# App URL
NEXT_PUBLIC_APP_URL=https://tryinstallo.com
```

### Step 2: Test Locally
```bash
npm run dev
```
Test the authentication flow to make sure everything works.

## 🌐 **Deploy to Netlify**

### Step 1: Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. **Connect your GitHub repository**
3. **Deploy your site**

### Step 2: Add Environment Variables in Netlify
In Netlify dashboard:
1. Go to **"Site settings"** → **"Environment variables"**
2. Add all your environment variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_new_key
   CLERK_SECRET_KEY=sk_test_your_new_secret
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   NEXT_PUBLIC_APP_URL=https://tryinstallo.com
   ```

### Step 3: Configure Custom Domain
1. In Netlify dashboard, go to **"Domain settings"**
2. **Add custom domain**: `tryinstallo.com`
3. **Configure DNS** as instructed by Netlify

## 🎯 **Migration Strategy**

### Option 1: Clean Migration (Recommended)
1. **Create new Clerk project**
2. **Update environment variables**
3. **Deploy to Netlify**
4. **Test thoroughly**
5. **Go live**

### Option 2: Gradual Migration
1. **Keep old Clerk** for development
2. **Create new Clerk** for production
3. **Use different keys** for different environments
4. **Migrate users** when ready

## 🔒 **Security Considerations**

### Production Keys
Once your new Clerk project is working:
1. **Switch to production mode** in Clerk dashboard
2. **Get live keys** (`pk_live_...` and `sk_live_...`)
3. **Update environment variables** with live keys
4. **Redeploy** to Netlify

### Data Migration
- **User data** will need to be migrated if you have existing users
- **Consider user experience** during migration
- **Plan migration strategy** if needed

## 🆘 **Troubleshooting**

### Common Issues:
1. **Domain not recognized**: Make sure `tryinstallo.com` is added in Clerk
2. **Redirect errors**: Check all redirect URLs are configured
3. **Environment variables**: Verify all keys are correct in Netlify
4. **DNS issues**: Ensure domain is properly configured

## 📞 **Next Steps**

1. **Create new Clerk project** (not through Vercel Marketplace)
2. **Configure domain** `tryinstallo.com`
3. **Get new API keys**
4. **Update environment variables**
5. **Deploy to Netlify**
6. **Test authentication flow**
7. **Go live!**

This approach gives you **complete control** and **works perfectly with Netlify**!



