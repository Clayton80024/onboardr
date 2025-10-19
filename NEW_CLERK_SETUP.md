# Updated Environment Variables for New Clerk Project

## 🔑 **Your New Clerk Keys**

```env
# New Clerk Keys (Production Ready)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YWN0aXZlLXRhcGlyLTI0LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_RbrbDxBs5U5dYlCyWdiautqIv90c91E8GheYVd5xQU

# Authentication URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# App Configuration
NEXT_PUBLIC_APP_URL=https://tryinstallo.com
```

## 🚀 **Next Steps to Complete Setup**

### Step 1: Update Your Local Environment
Create/update your `.env.local` file with the new keys above.

### Step 2: Configure Clerk Dashboard
In your new Clerk project dashboard:

1. **Go to "Domains & URLs"**
2. **Add your domain**: `tryinstallo.com`
3. **Configure URLs**:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/onboarding`
   - After sign-up URL: `/onboarding`

4. **Add Redirect URLs**:
   ```
   https://tryinstallo.com/sign-in
   https://tryinstallo.com/sign-up
   https://tryinstallo.com/onboarding
   https://tryinstallo.com/dashboard
   ```

### Step 3: Test Locally
```bash
npm run dev
```
Visit `http://localhost:3000` and test the authentication flow.

### Step 4: Deploy to Netlify
1. **Push your changes** to GitHub
2. **In Netlify dashboard**, go to "Site settings" → "Environment variables"
3. **Add all the environment variables** from above
4. **Redeploy** your site

### Step 5: Configure Custom Domain
1. **In Netlify**, go to "Domain settings"
2. **Add custom domain**: `tryinstallo.com`
3. **Follow DNS instructions** to point your domain to Netlify

## ✅ **Verification Checklist**

- [ ] New Clerk project created
- [ ] Environment variables updated locally
- [ ] Clerk dashboard configured with `tryinstallo.com`
- [ ] Redirect URLs added in Clerk
- [ ] Local testing successful
- [ ] Environment variables added to Netlify
- [ ] Site deployed to Netlify
- [ ] Custom domain configured
- [ ] Authentication flow tested on live site

## 🎯 **Expected Result**

After completing these steps:
- ✅ Authentication will work on `https://tryinstallo.com`
- ✅ Users can sign up and sign in
- ✅ Proper redirects after authentication
- ✅ No Vercel dependencies
- ✅ Full control over your authentication system

Your new Clerk project is ready to go! 🚀
