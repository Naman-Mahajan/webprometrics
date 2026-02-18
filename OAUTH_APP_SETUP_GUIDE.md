# OAuth Application Setup Guide

Complete step-by-step instructions for creating OAuth applications in each platform's developer console.

---

## 🔵 1. Google Cloud Console (Ads + Search Console + Analytics)

### Prerequisites
- Google Account with admin access
- Access to the Google Ads/Search Console properties you want to connect

### Step-by-Step Setup

#### A. Create a Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click the project dropdown at the top
   - Click **"New Project"**
   - Project name: `WebMetricsPro` (or your app name)
   - Click **"Create"**

#### B. Enable Required APIs

1. **Navigate to APIs & Services**
   - From the hamburger menu → **APIs & Services** → **Library**

2. **Enable these APIs** (search and enable each):
   - ✅ **Google Ads API**
   - ✅ **Google Search Console API**
   - ✅ **Google Analytics Data API**
   
   For each API:
   - Search for the API name
   - Click on it
   - Click **"Enable"**

#### C. Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - APIs & Services → **OAuth consent screen**

2. **Choose User Type**
   - Select **"External"** (unless you have Google Workspace)
   - Click **"Create"**

3. **App Information**
   - **App name:** `WebMetricsPro` (your app name)
   - **User support email:** your-email@example.com
   - **App logo:** (optional) Upload your logo
   - **Application home page:** https://yourdomain.com
   - **Application privacy policy:** https://yourdomain.com/privacy
   - **Application terms of service:** https://yourdomain.com/terms
   - **Authorized domains:** yourdomain.com
   - **Developer contact email:** your-email@example.com
   - Click **"Save and Continue"**

4. **Add Scopes**
   - Click **"Add or Remove Scopes"**
   - Add these scopes manually:
     ```
     https://www.googleapis.com/auth/adwords
     https://www.googleapis.com/auth/webmasters.readonly
     https://www.googleapis.com/auth/analytics.readonly
     ```
   - Search for each scope, check the box, click **"Update"**
   - Click **"Save and Continue"**

5. **Test Users** (if app is in testing mode)
   - Add your email and any test users
   - Click **"Save and Continue"**

6. **Summary**
   - Review settings
   - Click **"Back to Dashboard"**

#### D. Create OAuth Credentials

1. **Go to Credentials**
   - APIs & Services → **Credentials**

2. **Create OAuth Client ID**
   - Click **"+ Create Credentials"**
   - Select **"OAuth client ID"**

3. **Configure Client**
   - **Application type:** Web application
   - **Name:** `WebMetricsPro OAuth Client`
   
4. **Authorized Redirect URIs**
   - Click **"+ Add URI"**
   - Add: `https://yourdomain.com/api/oauth/google/callback`
   - For local testing: `http://localhost:8080/api/oauth/google/callback`
   - Click **"Create"**

5. **Save Credentials**
   - Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
   - Copy the **Client Secret**
   - Click **"OK"**

#### E. Update .env File

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/oauth/google/callback
```

#### F. Request Production Access (Optional)

If you want to allow any Google user to connect:
1. Go to **OAuth consent screen**
2. Click **"Publish App"**
3. Submit for verification (may take 1-2 weeks)

---

## 🟣 2. Meta for Developers (Facebook + Instagram)

### Prerequisites
- Facebook account
- Facebook Page (for Instagram Business integration)

### Step-by-Step Setup

#### A. Create a Meta App

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/apps/
   - Click **"Create App"**

2. **Choose App Type**
   - Select **"Business"** or **"Consumer"**
   - Click **"Next"**

3. **App Details**
   - **App name:** `WebMetricsPro`
   - **App contact email:** your-email@example.com
   - Click **"Create App"**

#### B. Add Products

1. **Add Facebook Login**
   - From the dashboard, find **"Facebook Login"**
   - Click **"Set Up"**
   - Choose **"Web"** platform
   - Site URL: `https://yourdomain.com`
   - Click **"Save"**

2. **Add Instagram Basic Display** (Optional)
   - Find **"Instagram Basic Display"**
   - Click **"Set Up"**
   - Click **"Create New App"**

#### C. Configure Facebook Login Settings

1. **Navigate to Settings**
   - Left sidebar → **Facebook Login** → **Settings**

2. **Valid OAuth Redirect URIs**
   - Add: `https://yourdomain.com/api/oauth/meta/callback`
   - For testing: `http://localhost:8080/api/oauth/meta/callback`
   - Click **"Save Changes"**

#### D. Configure App Settings

1. **Go to App Settings → Basic**
   - Copy your **App ID**
   - Click **"Show"** for **App Secret** and copy it

2. **Add App Domains**
   - App Domains: `yourdomain.com`
   - Privacy Policy URL: `https://yourdomain.com/privacy`
   - Terms of Service URL: `https://yourdomain.com/terms`
   - Click **"Save Changes"**

#### E. Request Advanced Permissions

1. **App Review → Permissions and Features**
   - Request these permissions:
     - ✅ `ads_read` - Read ads insights and manage ad accounts
     - ✅ `pages_read_engagement` - Read page content
     - ✅ `instagram_basic` - Read Instagram profile info
     - ✅ `instagram_manage_insights` - Read Instagram insights
   
2. **Submit for Review**
   - Fill out use case details
   - Provide screencast showing OAuth flow
   - Wait for approval (typically 1-3 days)

#### F. Update .env File

```env
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=https://yourdomain.com/api/oauth/meta/callback
```

#### G. Switch to Live Mode

1. **App Mode Toggle** (top right)
   - Switch from **"Development"** to **"Live"**
   - Only do this after permissions are approved

---

## 🔷 3. Twitter/X Developer Portal

### Prerequisites
- X/Twitter account
- Verified email address

### Step-by-Step Setup

#### A. Sign Up for Developer Account

1. **Go to Twitter Developer Portal**
   - Visit: https://developer.twitter.com/en/portal/dashboard
   - Click **"Sign up"** if you don't have access
   - Complete the developer application form

2. **Create a Project**
   - Click **"+ Create Project"**
   - **Project name:** `WebMetricsPro`
   - **Use case:** Choose the most appropriate option
   - Click **"Next"**

#### B. Create an App

1. **Add App to Project**
   - **App name:** `WebMetricsPro OAuth`
   - Click **"Complete"**

2. **Save API Keys** (shown once)
   - Copy **API Key** (you won't need this for OAuth 2.0)
   - Copy **API Secret Key** (you won't need this for OAuth 2.0)
   - Click **"App Settings"**

#### C. Configure OAuth 2.0

1. **Navigate to User Authentication Settings**
   - From app dashboard → **"Set up"** under User authentication settings

2. **OAuth 2.0 Settings**
   - ✅ Enable **OAuth 2.0**
   - **Type of App:** Web App
   - **App permissions:** Read
   
3. **App Info**
   - **Callback URI / Redirect URL:**
     - Add: `https://yourdomain.com/api/oauth/x/callback`
     - For testing: `http://localhost:8080/api/oauth/x/callback`
   - **Website URL:** `https://yourdomain.com`
   - **Organization name:** Your Company Name
   - **Organization website:** `https://yourdomain.com`
   - **Terms of service:** `https://yourdomain.com/terms`
   - **Privacy policy:** `https://yourdomain.com/privacy`

4. **Save Settings**

#### D. Get OAuth 2.0 Credentials

1. **Keys and Tokens Tab**
   - Click **"OAuth 2.0 Client ID and Client Secret"**
   - Copy **Client ID**
   - Copy **Client Secret**
   - Store these securely

#### E. Update .env File

```env
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_REDIRECT_URI=https://yourdomain.com/api/oauth/x/callback
```

#### F. Request Elevated Access (Optional)

For higher rate limits:
1. **Developer Portal → Products**
2. Apply for **"Elevated"** access
3. Fill out use case form
4. Wait for approval

---

## 🔵 4. LinkedIn Developers

### Prerequisites
- LinkedIn account (preferably with a Company Page)
- Admin access to LinkedIn Company Page (for organization APIs)

### Step-by-Step Setup

#### A. Create a LinkedIn App

1. **Go to LinkedIn Developers**
   - Visit: https://www.linkedin.com/developers/apps
   - Click **"Create app"**

2. **App Details**
   - **App name:** `WebMetricsPro`
   - **LinkedIn Page:** Select your company page
   - **App logo:** Upload your logo (square, min 300x300px)
   - Check **"I have read and agree to these terms"**
   - Click **"Create app"**

#### B. Verify Your App

1. **Verify Tab**
   - You'll need to verify your app to access certain APIs
   - Click **"Generate URL"**
   - Add the verification URL to your website
   - Click **"Verify"**

#### C. Configure Auth Settings

1. **Auth Tab**
   - Copy your **Client ID**
   - Copy your **Client Secret**

2. **OAuth 2.0 Settings**
   - Under **"Authorized redirect URLs for your app"**
   - Click **"Add redirect URL"**
   - Add: `https://yourdomain.com/api/oauth/linkedin/callback`
   - For testing: `http://localhost:8080/api/oauth/linkedin/callback`
   - Click **"Update"**

#### D. Request Products & Permissions

1. **Products Tab**
   - Request access to:
     - ✅ **Sign In with LinkedIn** (basic profile access)
     - ✅ **Advertising API** (for ad insights)
     - ✅ **Marketing Developer Platform** (for organization analytics)

2. **For Each Product:**
   - Click **"Request access"**
   - Fill out use case details
   - Submit for review (typically instant for Sign In, 1-2 weeks for Ads API)

#### E. Configure OAuth Scopes

1. **Auth Tab → OAuth 2.0 scopes**
   - These scopes should be available after product approval:
     - ✅ `r_liteprofile` - Basic profile info
     - ✅ `r_emailaddress` - Email address
     - ✅ `r_organization_social` - Organization insights
     - ✅ `r_ads` - Ad account access
     - ✅ `r_ads_reporting` - Ad performance data

#### F. Update .env File

```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=https://yourdomain.com/api/oauth/linkedin/callback
```

#### G. Test Your Integration

1. **Use LinkedIn's OAuth Test Tool**
   - Auth tab → **"OAuth 2.0 tools"**
   - Test authorization flow
   - Verify scopes are granted correctly

---

## ✅ Final Checklist

### For Each Platform:

- [ ] **OAuth app created** in developer console
- [ ] **Client ID and Secret** saved to `.env`
- [ ] **Redirect URIs** configured correctly
- [ ] **Required scopes/permissions** requested and approved
- [ ] **App domains** added (where applicable)
- [ ] **Privacy policy & Terms** URLs added
- [ ] **Testing mode** enabled for initial development
- [ ] **Production/Live mode** enabled when ready to deploy

### Security Reminders:

- ✅ Never commit `.env` file to Git
- ✅ Use different OAuth apps for staging vs production
- ✅ Rotate client secrets every 90 days
- ✅ Monitor OAuth usage in each platform's analytics
- ✅ Implement rate limiting to avoid API quotas
- ✅ Enable 2FA on all developer accounts
- ✅ Regularly audit authorized redirect URIs

---

## 🔧 Testing Your OAuth Apps

After creating all apps, test each integration:

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Dashboard:**
   - Go to http://localhost:8080 (or your domain)
   - Log in to your account

3. **Test each connection:**
   - Click "Connect Google Ads" → Verify OAuth flow
   - Click "Connect Meta" → Verify OAuth flow
   - Click "Connect X" → Verify OAuth flow
   - Click "Connect LinkedIn" → Verify OAuth flow

4. **Verify in developer consoles:**
   - Check analytics/usage tabs in each platform
   - Confirm API calls are being made
   - Monitor for errors or rate limit warnings

---

## 📞 Support & Documentation

### Official Documentation:
- **Google:** https://developers.google.com/identity/protocols/oauth2
- **Meta:** https://developers.facebook.com/docs/facebook-login/
- **Twitter:** https://developer.twitter.com/en/docs/authentication/oauth-2-0
- **LinkedIn:** https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication

### Common Issues:

**"Redirect URI mismatch"**
- Ensure redirect URI in code matches exactly what's in developer console
- Check for trailing slashes, http vs https

**"Invalid client credentials"**
- Verify client ID and secret in `.env` are correct
- Check for extra spaces or newlines

**"Access denied" or "Insufficient permissions"**
- Request required scopes in developer console
- Some scopes require app review/approval

**"App not verified"**
- Google requires verification for production apps
- Meta requires permissions review for certain scopes
- This is normal; follow each platform's verification process

---

**Setup Complete! 🎉**

Once all OAuth apps are configured and credentials added to `.env`, your 360° marketing platform is ready for live data integration!
