# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

## Required for Production

```env
# Server Configuration
PORT=8080
NODE_ENV=production

# JWT Configuration
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
# Comma-separated list of allowed origins (e.g., https://example.com,https://app.example.com)
ALLOWED_ORIGINS=https://reports.corporatedigitalmarketing.agency

# Encryption Key for storing OAuth tokens
# Generate: openssl rand -hex 32
ENCRYPTION_KEY=your-64-character-hex-encryption-key-here

# Google OAuth (for Google Ads, Search Console, Analytics)
# Create credentials at: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=https://reports.corporatedigitalmarketing.agency/api/oauth/google/callback

# Meta (Facebook/Instagram) OAuth
# Create app at: https://developers.facebook.com/apps/
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=https://reports.corporatedigitalmarketing.agency/api/oauth/meta/callback

# X (Twitter) OAuth 2.0
# Create app at: https://developer.twitter.com/en/portal/projects-and-apps
TWITTER_CLIENT_ID=your-twitter-oauth2-client-id
TWITTER_CLIENT_SECRET=your-twitter-oauth2-client-secret
TWITTER_REDIRECT_URI=https://reports.corporatedigitalmarketing.agency/api/oauth/x/callback

# LinkedIn OAuth
# Create app at: https://www.linkedin.com/developers/apps
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=https://reports.corporatedigitalmarketing.agency/api/oauth/linkedin/callback
```

## Optional

```env
# Gemini API (if needed)
GEMINI_API_KEY=your-gemini-api-key-here

# Frontend API URL (optional, defaults to /api)
VITE_API_URL=/api

# Development Admin User (development only)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Quick Setup

1. Copy this template to `.env`:
   ```bash
   cp ENV_SETUP.md .env
   # Then edit .env with your actual values
   ```

2. Generate secure secrets:
   ```bash
   # JWT Secret
   openssl rand -base64 32
   
   # Encryption Key (for OAuth tokens)
   openssl rand -hex 32
   ```

3. Create OAuth applications for each platform:
   - **Google**: https://console.cloud.google.com/apis/credentials
     - Enable APIs: Google Ads API, Search Console API, Analytics API
     - Scopes: `https://www.googleapis.com/auth/adwords`, `https://www.googleapis.com/auth/webmasters.readonly`, `https://www.googleapis.com/auth/analytics.readonly`
   
   - **Meta**: https://developers.facebook.com/apps/
     - Add products: Facebook Login, Instagram Basic Display
     - Scopes: `ads_read`, `pages_read_engagement`, `instagram_basic`, `instagram_manage_insights`
   
   - **X (Twitter)**: https://developer.twitter.com/en/portal/projects-and-apps
     - OAuth 2.0 with PKCE enabled
     - Scopes: `tweet.read`, `users.read`, `follows.read`, `offline.access`
   
   - **LinkedIn**: https://www.linkedin.com/developers/apps
     - Products: Sign In with LinkedIn, Advertising API
     - Scopes: `r_liteprofile`, `r_organization_social`, `r_ads`

4. Update redirect URIs in each platform's developer console to match your `.env` settings.

5. Update the `.env` file with your generated secrets and OAuth credentials.

## Security Notes

- **Never commit `.env` files** - they are automatically ignored by git
- **Use strong, random secrets** in production
- **Restrict CORS origins** to only your production domains
- **Rotate secrets** periodically in production

