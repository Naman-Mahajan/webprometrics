# Quick Start: OAuth Integration Testing

## 🚀 Testing Your OAuth Integrations

### Prerequisites
1. ✅ All environment variables configured in `.env`
2. ✅ OAuth apps created in each platform's developer console
3. ✅ Redirect URIs configured correctly
4. ✅ Server running (`npm run dev` or production mode)

---

## 📝 Test Sequence

### 1. Google Ads
**Test User Flow:**
1. Navigate to Dashboard → **Overview** tab
2. Locate "Google Ads Performance" widget
3. Click **"Connect Google Ads"** button
4. OAuth popup opens → Sign in with Google
5. Grant permissions for Google Ads API
6. Popup closes automatically
7. ✅ Success toast: "Google Ads connected!"
8. Select customer ID from dropdown
9. Click **Refresh** to load live data

**Verify:**
- [ ] Customer list populates correctly
- [ ] Live metrics display (impressions, clicks, cost)
- [ ] Fallback to mock data if API fails gracefully

---

### 2. Google Search Console
**Test User Flow:**
1. Dashboard → **Overview** tab
2. Locate "Google Search Console" widget
3. Click **"Connect Search Console"** button
4. OAuth popup opens (reuses Google OAuth)
5. Grant Search Console permissions
6. Popup closes automatically
7. ✅ Success toast: "Google Search Console connected!"
8. Select site URL from dropdown
9. Click **Refresh** to load live SEO data

**Verify:**
- [ ] Site list populates correctly
- [ ] Live SEO metrics display (clicks, impressions, CTR, position)
- [ ] Fallback works if no data available

---

### 3. Meta (Facebook/Instagram)
**Test User Flow:**
1. Dashboard → **Overview** tab
2. Locate "Meta Ads (Facebook/Instagram)" widget
3. Click **"Connect Meta"** button
4. OAuth popup opens → Sign in to Facebook
5. Grant permissions for Ads API & Instagram
6. Popup closes automatically
7. ✅ Success toast: "Meta (Facebook/Instagram) connected!"
8. Select ad account from dropdown
9. Click **Refresh** to load live campaign data

**Verify:**
- [ ] Ad account list populates with account names
- [ ] Live metrics display (impressions, clicks, spend)
- [ ] Instagram data included if available
- [ ] Fallback works correctly

---

### 4. X (Twitter)
**Test User Flow:**
1. Dashboard → **Overview** tab
2. Locate "X (Twitter)" widget
3. Click **"Connect X"** button
4. OAuth popup opens → Authorize app on Twitter
5. PKCE flow completes (transparent to user)
6. Popup closes automatically
7. ✅ Success toast: "X (Twitter) connected!"
8. Widget automatically refreshes with live data

**Verify:**
- [ ] Twitter username/profile displayed
- [ ] Public metrics shown (followers, following, tweet count)
- [ ] No resource selector needed (uses user's own account)
- [ ] Fallback works if API unavailable

---

### 5. LinkedIn
**Test User Flow:**
1. Dashboard → **Overview** tab
2. Locate "LinkedIn" widget
3. Click **"Connect LinkedIn"** button
4. OAuth popup opens → Sign in to LinkedIn
5. Grant permissions for organization access
6. Popup closes automatically
7. ✅ Success toast: "LinkedIn connected!"
8. Select organization from dropdown
9. Click **Refresh** to load analytics

**Verify:**
- [ ] Organization list populates correctly
- [ ] Live metrics display (if available via API)
- [ ] Fallback to mock data works
- [ ] Multiple org support if user has access

---

## 🔧 Alternative Testing via Integration Tab

For each channel, you can also test from the **Integration** tab:

1. Navigate to Dashboard → **Integration** tab
2. Locate the integration card (Google Ads, Meta, X, LinkedIn)
3. Click **"Connect Account"** button
4. Follow same OAuth flow as above
5. Verify connection status shows as **"Connected"**

---

## 🐛 Troubleshooting

### OAuth Popup Blocked
- **Issue:** Browser blocks popup window
- **Solution:** Allow popups for your domain, or click connect button again

### Timeout Warning
- **Issue:** "Connection timed out. Please try again."
- **Solution:** OAuth flow took > 2 minutes, retry connection

### "Failed to start connection"
- **Issue:** Backend not responding or missing env vars
- **Solution:** Check server logs, verify `.env` configuration

### Empty Resource Lists
- **Issue:** Dropdown shows no accounts/sites/orgs
- **Solution:** User may not have access, check permissions in platform console

### Live Data Not Loading
- **Issue:** Widget shows mock data instead of live
- **Solution:** 
  - Check network tab for API errors
  - Verify OAuth tokens stored correctly in database
  - Check API rate limits in platform console
  - Fallback is working as designed (not a blocker)

---

## 📊 Database Verification

Check if tokens are stored correctly:

```sql
-- View encrypted tokens for a user
SELECT id, email, data FROM users WHERE email = 'test@example.com';

-- The 'data' column should contain encrypted OAuth tokens
-- Format: AES-256-GCM encrypted JSON with IV and authTag
```

**Expected token structure** (after decryption):
```json
{
  "googleTokens": { "access_token": "...", "refresh_token": "...", "scope": "..." },
  "metaTokens": { "access_token": "...", "token_type": "bearer", "expires_in": 5183944 },
  "twitterTokens": { "access_token": "...", "token_type": "bearer", "scope": "..." },
  "linkedInTokens": { "access_token": "...", "expires_in": 5184000 }
}
```

---

## ✅ Success Criteria

For each platform, verify:
1. ✅ OAuth popup opens without errors
2. ✅ User can authenticate successfully
3. ✅ Popup closes automatically after auth
4. ✅ Success toast notification appears
5. ✅ Connection status updates in UI
6. ✅ Resource list populates (if applicable)
7. ✅ Live data fetches successfully OR falls back gracefully
8. ✅ Manual refresh button works
9. ✅ No console errors or crashes

---

## 🎯 Expected Behavior

### When Connected
- Widget header shows **green checkmark** or "Connected" badge
- Resource selector appears (accounts, sites, orgs)
- Live data displays in widget cards
- Refresh button triggers new API call
- Integration tab shows "Disconnect" option

### When Not Connected
- Widget shows **banner with "Connect" button**
- No resource selector visible
- Mock/fallback data displays to prevent blank widgets
- Integration tab shows "Connect Account" button

---

## 📞 Production Checklist

Before going live:
- [ ] All environment variables set in production `.env`
- [ ] OAuth redirect URIs updated to production domain (HTTPS)
- [ ] SSL certificate valid and active
- [ ] CORS configured for production domain
- [ ] Database backups configured
- [ ] Error monitoring/logging enabled (Sentry, LogRocket, etc.)
- [ ] Rate limiting configured for API endpoints
- [ ] Load testing completed for concurrent OAuth flows
- [ ] User documentation updated with OAuth instructions
- [ ] Support team trained on troubleshooting OAuth issues

---

## 🚨 Security Reminders

1. **Never commit `.env` to Git** - Use `.env.example` instead
2. **Rotate OAuth secrets regularly** - Every 90 days recommended
3. **Monitor for suspicious OAuth activity** - Track failed auth attempts
4. **Use HTTPS only** - OAuth requires secure connections
5. **Implement token refresh** - Before access tokens expire
6. **Audit permissions** - Only request necessary scopes
7. **Encrypt database backups** - OAuth tokens are sensitive

---

## 📚 Additional Resources

- [ENV_SETUP.md](./ENV_SETUP.md) - Complete environment variable guide
- [OAUTH_INTEGRATION_COMPLETE.md](./OAUTH_INTEGRATION_COMPLETE.md) - Full implementation details
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Meta OAuth Docs](https://developers.facebook.com/docs/facebook-login/)
- [Twitter OAuth 2.0 Docs](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [LinkedIn OAuth Docs](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)

---

**Happy Testing! 🎉**
