# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | Connect Your Channel
**When You Need This:** Follow these steps to create a Telegram bot and connect it to OpenClaw before returning to the main guide.

---

## Prerequisites

- A Telegram account on your phone (free — download the Telegram app from the App Store if you haven't already)
- Your OpenClaw gateway running (you'll have completed Section 02 before this)

---

## Step-by-Step

### Step 1 — Open BotFather in Telegram

1. Open the Telegram app on your phone (or Telegram desktop at https://web.telegram.org)
2. In the search bar at the top, type **@BotFather**
3. Tap the result that shows a blue checkmark ✅ — this confirms it's the official Telegram bot
4. Tap **START** at the bottom if prompted

### Step 2 — Create Your New Bot

1. Type and send: `/newbot`
2. BotFather will ask: *"Alright, a new bot. How are we going to call it? Please choose a name for your bot."*
3. Type a display name for your bot — this is what people see. Example: **Sarah's Real Estate Assistant**
4. BotFather will ask: *"Good. Now let's choose a username for your bot."*
5. Type a username — must end in `bot` and be unique. Example: **SarahRealtyAssistBot**
   - If the username is taken, try adding your city or initials: **SarahAustinRealtyBot**
6. BotFather will respond with a message containing your **API Token** — it looks like: `1234567890:ABCDEFabcdef1234567890abcdef`

### Step 3 — Copy Your Bot Token

**⚠ Important:** Copy the entire token including the numbers before the colon. Do not share this token with anyone.

> Your Bot Token: ____________________________________

Paste it somewhere safe (Notes app or a text file) temporarily. You'll use it in the next step.

### Step 4 — Store the Token Securely in OpenClaw

In your Mac Terminal, run:

```bash
openclaw secret set telegram_token "YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with your actual token (keep the quotes). Example:
```bash
openclaw secret set telegram_token "1234567890:ABCDEFabcdef1234567890abcdef"
```

You should see: `✓ Secret stored: telegram_token`

### Step 5 — Add the Token to Your Config File

Open your config file:
```bash
open ~/.openclaw/config.yaml
```

This opens the file in TextEdit. Find the `channels:` section (or add it if it doesn't exist) and update it to look like this:

```yaml
channels:
  telegram:
    enabled: true
    bot_token: ${{ secret.telegram_token }}
    dmPolicy: "allowlist"
```

Save the file (⌘S) and close TextEdit.

### Step 6 — Restart the Gateway

```bash
openclaw gateway restart
```

Wait a few seconds, then check it's connected:
```bash
openclaw channel test telegram
```

You should see: `✓ Telegram channel connected`

### Step 7 — Find Your Telegram User ID

You need your numeric Telegram user ID to create an allowlist (so only you can talk to your bot).

1. Open Telegram and search for your new bot by its username (e.g., **@SarahAustinRealtyBot**)
2. Send it any message — type "hello"
3. In your Terminal, run:
   ```bash
   openclaw logs --follow
   ```
4. Look for a line containing `from.id` — the number next to it is your Telegram user ID
5. Press Ctrl+C to stop the log stream
6. Note your ID: ____________________________________

### Step 8 — Set Up the Allowlist (Security Step)

Update your config to restrict who can message your bot:

```bash
open ~/.openclaw/config.yaml
```

Update the `channels.telegram` section:

```yaml
channels:
  telegram:
    enabled: true
    bot_token: ${{ secret.telegram_token }}
    dmPolicy: "allowlist"
    allowFrom:
      - "YOUR_NUMERIC_TELEGRAM_ID"
```

Replace `YOUR_NUMERIC_TELEGRAM_ID` with the number you found in Step 7.

Save, then restart:
```bash
openclaw gateway restart
```

### Step 9 — Approve the Pairing

Send a message to your bot in Telegram. OpenClaw will send a pairing code. Approve it:
```bash
openclaw pairing list telegram
openclaw pairing approve telegram
```

You're now connected! 🎉

---

## Verification

Send a test message to your bot in Telegram:
> "Hello! Are you there?"

Your OpenClaw agent should respond within a few seconds.

You can also verify from the terminal:
```bash
openclaw channel list
```
Look for `telegram: ✓ connected`

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Bot doesn't respond | Run `openclaw gateway status` — check it's running |
| "Unauthorized" error | Double-check your token in `openclaw secret set telegram_token` |
| Can't find your user ID | Try `curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"` after sending a message |
| Bot says it doesn't recognize you | Run `openclaw pairing approve telegram` |
| Token error on restart | Verify token format: `numbers:letters` (no spaces) |

---

*Return to **Section 03** of your main setup guide when Telegram says "Hello!" back to you.*
