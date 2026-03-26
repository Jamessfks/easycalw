# REFERENCE: Telegram Bot Setup for OpenClaw

This reference walks through the complete Telegram bot creation and OpenClaw pairing process. Follow this alongside Section 03 of the main setup guide.

---

## Part 1: Create Your Bot with BotFather

**Do this on your phone where Telegram is installed.**

1. Open Telegram
2. In the search bar, type `@BotFather`
3. Confirm the result has a **blue checkmark** — the real BotFather is verified
4. Tap **Start** (or send `/start`)
5. Send: `/newbot`
6. BotFather asks for a **display name** — this is what people see in chat. Choose something professional and memorable, e.g.:
   - `Atlas RE` (short, clean)
   - `Sarah's Agent`
   - `Friday Assistant`
7. BotFather asks for a **username** — this must:
   - End in `bot` (e.g. `sarah_re_agent_bot`)
   - Be globally unique across all of Telegram
   - Contain only letters, numbers, and underscores
8. BotFather sends a success message like:
   ```
   Done! Congratulations on your new bot. You will find it at t.me/sarah_re_agent_bot.

   Use this token to access the HTTP API:
   7891234567:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   Keep your token secure and store it safely...
   ```
9. **Copy the token immediately** and save it in your password manager.

> ⚠️ **WARNING:** Treat the bot token like a password. Anyone with this token can control your bot. Never paste it in a chat, email, or document that others can access.

---

## Part 2: Configure the Token in OpenClaw

On your Mac Mini, open Terminal:

```bash
openclaw config set channels.telegram.botToken "YOUR_TELEGRAM_BOT_TOKEN_HERE"
openclaw config set channels.telegram.dmPolicy "pairing"
openclaw gateway restart
```

Wait a few seconds, then verify:

```bash
openclaw channels status
```

Expected output:
```
telegram   ✓ connected   bot: @sarah_re_agent_bot
```

If you see an error, check:
- Did you paste the full token (includes the colon and numbers before it)?
- Is the gateway running? Run `openclaw gateway status`

---

## Part 3: Pair Your Phone

The pairing process connects your personal Telegram account to the bot as the authorized user.

**On the Mac Mini:**
```bash
openclaw pairing list telegram
```

**On your phone:**
- Open Telegram, find your bot (`@sarah_re_agent_bot`)
- Send any message to start a conversation (e.g. "hi")

**Back on the Mac Mini**, the pairing list will now show a pending code. Approve it:
```bash
openclaw pairing approve telegram <code>
```

Replace `<code>` with the pairing code shown in the `openclaw pairing list telegram` output.

> ⚠️ **WARNING:** Pairing codes expire after **1 hour**. Complete this step promptly.

**Verify it worked:** Send another message to your bot in Telegram. It should respond.

---

## Part 4: Find Your Telegram User ID (for Lockdown)

You need your numeric Telegram user ID to lock the bot to your account only.

**Method 1 — Read from logs (most private):**
```bash
openclaw logs --follow
```
Send a message to your bot in Telegram. In the log output, look for a line containing `from.id` — the number next to it is your Telegram user ID.

**Method 2 — Bot API call:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```
In the JSON response, find `"from": {"id": 123456789, ...}` — that number is your ID.

Save this number — you need it for Part 5.

---

## Part 5: Lock Down Access (Allowlist Mode)

Switch from pairing mode (which can be re-triggered) to allowlist mode (permanent, durable):

```bash
openclaw config set channels.telegram.dmPolicy "allowlist"
openclaw config set channels.telegram.allowFrom '["YOUR_NUMERIC_TELEGRAM_ID"]'
openclaw gateway restart
```

Example with a real ID:
```bash
openclaw config set channels.telegram.allowFrom '["123456789"]'
```

**Verify it worked:**
```bash
openclaw channels status
```
Expected:
```
telegram   ✓ connected   dmPolicy: allowlist   allowFrom: [123456789]
```

**Test the lockdown:** Ask someone else to message your bot. Their message should be silently ignored — no response, no error.

---

## Part 6: Get Your Chat ID (for Cron Automations)

The cron automations in Section 06 of the main guide need your Telegram Chat ID to know where to deliver messages.

Your Chat ID for a **direct message** with your bot is the same as your Telegram user ID — the number you found in Part 4.

To confirm:
```bash
openclaw logs --follow
```
Send a message to your bot. In the logs, look for `chat.id` — for a DM, this matches your user ID.

Use this number in the `--to` flag of all three `openclaw cron add` commands in Section 06.

---

## Troubleshooting

**Bot not responding after pairing**
- Check gateway is running: `openclaw gateway status`
- Check logs for errors: `openclaw logs --follow`
- Verify dmPolicy is not `disabled`: `openclaw config get channels.telegram.dmPolicy`

**"Unauthorized" error when gateway starts**
- The bot token is invalid or was regenerated. Go to @BotFather → `/mybots` → select your bot → API Token → Revoke/Generate. Update the token in OpenClaw config.

**Pairing code expired**
- Run `openclaw pairing list telegram` again. Send a new message to the bot to trigger a new code.

**Messages in allowlist mode being ignored unexpectedly**
- Check that your numeric ID is correctly set: `openclaw config get channels.telegram.allowFrom`
- The ID must be a string inside the JSON array: `["123456789"]` not `[123456789]`
- Run `openclaw doctor --fix` to resolve any legacy username entries

**BotFather username already taken**
- Telegram bot usernames are globally unique. Try variations: add your city, initials, or a number. The username only affects the bot's URL — the display name can be anything.

---

*Reference document for OPENCLAW ENGINE SETUP GUIDE — Real Estate (Austin TX)*
*Generated: 2026-03-26*
