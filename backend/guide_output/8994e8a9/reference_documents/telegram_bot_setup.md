# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL (TELEGRAM)
**When You Need This:** When you want step-by-step screenshots and explanations for every Telegram bot creation step, or if you get stuck during Section 03 of the main guide.

---

## Prerequisites

- Telegram installed on your phone (https://telegram.org)
- OpenClaw installed and the gateway running (`openclaw gateway status` shows "running")
- Your Anthropic model configured (`openclaw models status` shows "active")

---

## Step-by-Step

### Step 1: Create Your Bot with BotFather

BotFather is Telegram's official bot manager. It creates bots and issues tokens.

1. Open Telegram on your phone or desktop
2. In the search bar, type `@BotFather` — make sure the handle is **exactly** `@BotFather` (there are imposters)
3. Tap the verified account (it has a blue checkmark) and start a conversation
4. Send this message: `/newbot`
5. BotFather asks for a **display name** — this is what people see. Enter something like: `My Email Assistant`
6. BotFather asks for a **username** — this must end in `bot` and be unique. Try: `EightEmailBot` or `MyInboxBot2026`
7. BotFather replies with your **bot token** — it looks like this:

```
1234567890:ABCDefGhIJKlmNoPQRstuVWXyz-abc123
```

**Copy this token immediately.** Store it in your password manager. You will never see it again (you can regenerate it, but that invalidates the old one).

### Step 2: Store the Token Securely in OpenClaw

Never paste your token directly into a config file — use the Keychain backend:

```bash
openclaw secret set telegram_token "1234567890:ABCDefGhIJKlmNoPQRstuVWXyz-abc123"
```

Replace the token value with your actual token (keep the quotes).

**Verify it was stored:**
```
$ openclaw secret list
telegram_token   ✓ stored (keychain)
```

### Step 3: Configure OpenClaw to Use the Bot

Apply the Telegram channel configuration:

```bash
openclaw config patch '{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "${{ secret.telegram_token }}",
      "dmPolicy": "pairing"
    }
  }
}'
```

Restart the gateway to apply:

```bash
openclaw gateway restart
```

**Verify the bot connected:**
```
$ openclaw channel test telegram
telegram   ✓ connected   bot: @YourBotName
```

If you see an error like `401 Unauthorized`, your bot token is wrong. Go back to BotFather, send `/mybots`, select your bot, and choose **API Token** to see the token again.

### Step 4: Pair Your Phone

"Pairing" tells OpenClaw that your Telegram account is the authorized operator.

1. Open Telegram on your phone
2. Search for your bot's username (e.g., `@EightEmailBot`)
3. Send it any message — for example, "hello"
4. In Terminal on your Mac, run:

```bash
openclaw pairing list telegram
```

You should see a pending pairing request from your Telegram account.

5. Approve it:

```bash
openclaw pairing approve telegram
```

**Verify pairing worked:** Send another message to your bot in Telegram. It should respond.

### Step 5: Find Your Telegram User ID

You need your numeric Telegram user ID to lock down access so only you can send commands.

**Method (safest — no third-party bots):**

1. Send any message to your bot in Telegram
2. In Terminal, run: `openclaw logs --follow`
3. Look for a line containing `from.id` — the number after it is your user ID. It looks like: `from.id: 987654321`
4. Write down that number
5. Press **Ctrl+C** to stop the log

### Step 6: Lock Down to Allowlist Mode

Replace `pairing` with `allowlist` and add your user ID:

```bash
openclaw config patch '{
  "channels": {
    "telegram": {
      "dmPolicy": "allowlist",
      "allowFrom": ["YOUR_NUMERIC_USER_ID_HERE"]
    }
  }
}'
openclaw gateway restart
```

Replace `YOUR_NUMERIC_USER_ID_HERE` with the number from Step 5 (no quotes needed inside the array).

**Verify lockdown worked:**
```
$ openclaw channel list
telegram   ✓ connected   dmPolicy: allowlist   allowFrom: [YOUR_ID]
```

### Step 7: Test the Connection

Send your bot a test message from Telegram:

> "Hello, can you hear me?"

It should respond. If it does not:

1. Check gateway: `openclaw gateway status`
2. Check channel: `openclaw channel test telegram`
3. Check logs: `openclaw logs --follow` (watch for errors)

---

## Verification

A correctly configured Telegram channel shows all of these:

```
$ openclaw channel list
telegram   ✓ connected   dmPolicy: allowlist   allowFrom: 1 user(s)

$ openclaw channel test telegram
telegram   ✓ ping OK   latency: 120ms
```

And your bot responds to messages in Telegram.

---

## Troubleshooting

**Bot does not respond after pairing**
- Restart the gateway: `openclaw gateway restart`
- Check logs for errors: `openclaw logs --follow`
- Verify your user ID is in the allowlist

**"401 Unauthorized" error**
- Your bot token is invalid or has been regenerated
- Go to BotFather → `/mybots` → your bot → API Token
- Re-run `openclaw secret set telegram_token "NEW_TOKEN"`
- Restart gateway

**Messages are queued but slow to arrive**
- This happens when your Mac was asleep — Telegram queues messages server-side
- When your Mac wakes, the gateway reconnects and delivers queued messages
- This is expected behavior for a non-dedicated Mac setup

**Bot responds to wrong person**
- Check your allowlist: `openclaw config validate`
- Ensure only your numeric user ID is in `allowFrom`
- If a group was accidentally added, review `channels.telegram.groups` in your config

**Pairing code expired**
- Pairing codes expire after 1 hour
- Start over: send a new message to your bot and run `openclaw pairing list telegram` again

---

## Configuration Reference (What Your Final Config Should Look Like)

```yaml
# ~/.openclaw/config.yaml — Telegram section
channels:
  telegram:
    enabled: true
    botToken: ${{ secret.telegram_token }}
    dmPolicy: allowlist
    allowFrom:
      - "YOUR_NUMERIC_TELEGRAM_USER_ID"
    groups:
      require_mention: true
      allowed_groups: []
```

This config:
- Enables the Telegram channel
- Reads the bot token from the macOS Keychain (secure)
- Only allows direct messages from your user ID
- Ignores all group chats

---

*Return to the main guide at Section 03D when complete.*
