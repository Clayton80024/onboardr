# Fix Google OAuth Redirect URI Mismatch Error

## 🚨 **Error Analysis**
**Error**: `redirect_uri_mismatch`  
**Cause**: Google OAuth is not configured with your production domain `tryinstallo.com`

## 🔧 **Solution Steps**

### Step 1: Configure Google OAuth Console
1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project** (or create one if needed)
3. **Navigate to "APIs & Services" → "Credentials"**
4. **Find your OAuth 2.0 Client ID** (used by Clerk)

### Step 2: Update Authorized Redirect URIs
In your Google OAuth client configuration, add these URLs:

#### **For Production:**
```
https://tryinstallo.com/api/auth/callback/google
https://tryinstallo.com/api/auth/callback/google?redirect_url=https://tryinstallo.com/onboarding
```

#### **For Development (if needed):**
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/google?redirect_url=http://localhost:3000/onboarding
```

### Step 3: Update Authorized JavaScript Origins
Add these origins to your Google OAuth client:

#### **For Production:**
```
https://tryinstallo.com
```

#### **For Development:**
```
http://localhost:3000
```

## 🎯 **Clerk-Specific Configuration**

### Step 1: Update Clerk Dashboard
1. **Go to your Clerk dashboard**
2. **Navigate to "User & Authentication" → "Social Connections"**
3. **Find Google OAuth configuration**
4. **Update the following:**

#### **Redirect URLs:**
```
https://tryinstallo.com/api/auth/callback/google
```

#### **Authorized Origins:**
```
https://tryinstallo.com
```

### Step 2: Verify Clerk Environment Variables
Make sure your production environment has the correct Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret
```

## 🔍 **Common Issues & Solutions**

### Issue 1: Missing HTTPS
**Problem**: Google OAuth requires HTTPS in production  
**Solution**: Ensure your domain `tryinstallo.com` has SSL certificate

### Issue 2: Trailing Slash
**Problem**: URL mismatch due to trailing slashes  
**Solution**: Be consistent with trailing slashes in all URLs

### Issue 3: Case Sensitivity
**Problem**: URLs are case-sensitive  
**Solution**: Ensure exact case matching in all configurations

## 🚀 **Step-by-Step Fix**

### 1. Google Cloud Console
```
1. Go to Google Cloud Console
2. Select your project
3. APIs & Services → Credentials
4. Edit your OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - https://tryinstallo.com/api/auth/callback/google
6. Add authorized JavaScript origins:
   - https://tryinstallo.com
7. Save changes
```

### 2. Clerk Dashboard
```
1. Go to Clerk dashboard
2. User & Authentication → Social Connections
3. Configure Google OAuth
4. Update redirect URLs to match Google console
5. Save configuration
```

### 3. Test the Fix
```
1. Clear browser cache
2. Try Google sign-in again
3. Verify redirect works properly
4. Test on different browsers
```

## ⚠️ **Important Notes**

### Security Considerations:
- **Never commit OAuth secrets** to version control
- **Use environment variables** for all sensitive data
- **Regularly rotate OAuth credentials**

### Testing:
- **Test in incognito mode** to avoid cached credentials
- **Test on different devices** to ensure compatibility
- **Monitor error logs** for any remaining issues

## 🆘 **If Still Having Issues**

### Debug Steps:
1. **Check browser console** for additional error details
2. **Verify SSL certificate** is valid on your domain
3. **Test with different Google accounts**
4. **Check Clerk logs** for authentication errors

### Contact Support:
- **Google OAuth**: Check Google Cloud Console error logs
- **Clerk**: Contact Clerk support with your project details
- **Netlify**: Verify domain configuration is correct

## 📞 **Quick Checklist**

- [ ] Google OAuth redirect URIs updated
- [ ] Google OAuth JavaScript origins updated
- [ ] Clerk dashboard configuration updated
- [ ] Production environment variables set
- [ ] SSL certificate valid on domain
- [ ] Browser cache cleared
- [ ] Tested in incognito mode

This should resolve the `redirect_uri_mismatch` error and allow users to sign in with Google on your production site!



