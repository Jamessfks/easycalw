# Gmail OAuth Setup — Step-by-Step Reference

> **When to use this doc:** Referenced from OPENCLAW_ENGINE_SETUP_GUIDE.md Section 05 (Install Skills → Authenticate Gmail). Follow this if you have never set up Google OAuth credentials before, or if the `openclaw auth refresh google` command fails.

---

## Overview

The `gog` skill needs permission to read your Gmail inbox, apply labels, create drafts, and check your Google Calendar. Google enforces this through OAuth 2.0 — a consent flow where you explicitly grant these permissions to your OpenClaw instance.

You will need:
- A Google account (the one whose Gmail inbox you want to triage)
- Access to Google Cloud Console (free — uses your Google account login)

---

## Part 1: Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click the project dropdown at the top → **New Project**
3. Name it `openclaw-email-triage` (or any name you'll recognize)
4. Click **Create**
5. Make sure this new project is selected in the dropdown before continuing

---

## Part 2: Enable the Gmail API

1. In the left sidebar, go to **APIs & Services → Library**
2. Search for **"Gmail API"**
3. Click **Gmail API** → click **Enable**
4. Repeat for **Google Calendar API** (the `gog` skill also uses Calendar for draft reply suggestions)

**Verify:** In APIs & Services → Enabled APIs, you should see both Gmail API and Google Calendar API listed.

---

## Part 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. If prompted to configure a consent screen first, click **Configure Consent Screen**:
   - User type: **External** (even though it's just for you)
   - App name: `OpenClaw Email Triage`
   - User support email: your email address
   - Developer contact: your email address
   - Click Save and Continue through the remaining screens
   - On Scopes: click **Add or Remove Scopes** → add:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.labels`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/gmail.compose`
     - `https://www.googleapis.com/auth/calendar.readonly`
   - Click Save and Continue
   - On Test Users: add your own Gmail address
   - Click Save and Continue → Back to Dashboard
4. Now go back to **Credentials → + Create Credentials → OAuth client ID**
5. Application type: **Desktop app**
6. Name: `openclaw-mac`
7. Click **Create**
8. Download the JSON file — save it as `~/.openclaw/google_credentials.json`

> ⚠️ **WARNING:** The downloaded JSON file contains your OAuth client secret. Treat it like a password — do not commit it to git, do not share it, do not put it in a public folder.

---

## Part 4: Authenticate OpenClaw with Gmail

```bash
openclaw auth refresh google
```

This command:
1. Reads your credentials from `~/.openclaw/google_credentials.json`
2. Opens a browser window to Google's OAuth consent screen
3. You log in and click "Allow"
4. Google returns an authorization code
5. OpenClaw exchanges it for an access + refresh token and stores it securely

**Verify it worked:**
```
$ openclaw auth list
google   ✓ authenticated   account: your.email@gmail.com   expires: [date]
```

---

## Part 5: Token Maintenance

Google OAuth access tokens expire after 1 hour. OpenClaw automatically refreshes them using the stored refresh token. However, refresh tokens can be revoked if:
- You change your Google account password
- You revoke app access in your Google account security settings
- The token has not been used for 6 months

**If the agent stops reading your inbox**, the most likely cause is an expired or revoked token:

```bash
# Re-authenticate
openclaw auth refresh google

# Check auth status
openclaw auth list
```

**Set up an auth monitor cron job (optional but recommended):**

```bash
openclaw cron add \
  --name "gmail_auth_monitor" \
  --cron "0 8 * * *" \
  --message "Check if the Google OAuth token is valid by making a lightweight Gmail API call. If authentication fails, send me a Telegram alert: 'Gmail auth needs refresh. Run: openclaw auth refresh google'"
```

---

## Troubleshooting

**"redirect_uri_mismatch" error during OAuth flow**
- Go back to Cloud Console → Credentials → your OAuth client
- Verify Application Type is set to "Desktop app" (not "Web application")
- Delete the credential and recreate it as Desktop app type

**"access_denied" during consent screen**
- Make sure your Gmail address is added as a Test User in the OAuth consent screen settings
- Google limits unverified apps to 100 test users — you only need one (yourself)

**"insufficient_scope" error from gog skill**
- Your OAuth credentials were created without all required scopes
- Go to APIs & Services → OAuth consent screen → Edit → Scopes
- Add the missing scopes listed in Part 3 above
- Re-authenticate: `openclaw auth refresh google`

**"Token has been expired or revoked"**
```bash
openclaw auth refresh google
```
Follow the browser consent flow again. This generates a new refresh token.

---

*This document supports OPENCLAW_ENGINE_SETUP_GUIDE.md — Eight's Gmail Triage Setup.*
