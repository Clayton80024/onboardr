# Clerk Production Configuration Guide

## 🚀 Setting up Clerk for Production Domain

Since you have the domain https://tryinstallo.com/, you need to configure Clerk to work with your production environment.

### Step 1: Update Clerk Dashboard Settings

1. **Go to your Clerk Dashboard** at [clerk.com](https://clerk.com)
2. **Navigate to your application settings**
3. **Update the following URLs:**

#### Domains & URLs:
- **Production URL**: `https://tryinstallo.com`
- **Sign-in URL**: `https://tryinstallo.com/sign-in`
- **Sign-up URL**: `https://tryinstallo.com/sign-up`
- **After sign-in URL**: `https://tryinstallo.com/onboarding`
- **After sign-up URL**: `https://tryinstallo.com/onboarding`

#### Allowed Redirect URLs:
```
https://tryinstallo.com/sign-in
https://tryinstallo.com/sign-up
https://tryinstallo.com/onboarding
https://tryinstallo.com/dashboard
```

### Step 2: Environment Variables

Update your production environment variables:

```env
# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key_here
CLERK_SECRET_KEY=sk_live_your_production_secret_here

# Production URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Your domain
NEXT_PUBLIC_APP_URL=https://tryinstallo.com
```

### Step 3: Update Layout.tsx for Production

The layout.tsx already has the correct configuration, but make sure your ClerkProvider is properly configured.

### Step 4: Deploy Configuration

When deploying to your production environment (Vercel, Netlify, etc.):

1. **Add all environment variables** to your deployment platform
2. **Make sure the domain is properly configured**
3. **Test the authentication flow** after deployment

### Step 5: Testing Production Setup

1. **Visit** https://tryinstallo.com
2. **Test sign-up flow** - should redirect properly
3. **Test sign-in flow** - should work correctly
4. **Verify redirects** - after auth, should go to onboarding/dashboard

## 🔧 Additional Production Considerations

### Security Headers
Make sure your production environment has proper security headers configured.

### SSL Certificate
Ensure your domain has a valid SSL certificate (most hosting providers handle this automatically).

### Performance
Consider enabling Clerk's production optimizations in your dashboard.

## 🆘 Troubleshooting

If you encounter issues:

1. **Check Clerk Dashboard logs** for authentication errors
2. **Verify environment variables** are correctly set
3. **Test with different browsers** to rule out caching issues
4. **Check browser console** for any JavaScript errors

## 📞 Next Steps

1. Update your Clerk dashboard with the production URLs
2. Get your production Clerk keys
3. Update your environment variables
4. Deploy to your production environment
5. Test the complete authentication flow

Your domain https://tryinstallo.com/ is ready to go - you just need to configure Clerk to recognize it as a valid production domain!



