# Reference: Telegram Access Control for Single-Owner Bots

**Context:** This document covers the access control configuration for the bakery Telegram bot. Refer to this if you need to change who can talk to your bot, add a group, or troubleshoot unauthorized access.

---

## The Two Policies

OpenClaw's Telegram channel supports four DM policies:

| Policy | Who Can DM the Bot |
|---|---|
| `pairing` (default) | Anyone who completes a pairing handshake |
| `allowlist` | Only specific numeric Telegram user IDs you list |
| `open` | Anyone at all — do not use this |
| `disabled` | Nobody |

**For your bakery: use `allowlist`.** It locks the bot to your account only and is durable — it survives gateway restarts, config reloads, and pairing store resets.

---

## Finding Your Telegram User ID

Option 1 (most private):
1. Send any DM to your bot
2. Run `openclaw logs --follow` in Terminal
3. Look for `from.id` in the log output — that number is your user ID

Option 2 (official):
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```
Look for `"id"` inside the `"from"` object.

---

## The Config Block

Edit `~/.openclaw/config.json5` and add this inside the `channels.telegram` section:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_BOT_TOKEN",
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_USER_ID"],
    },
  },
}
```

Replace `YOUR_NUMERIC_TELEGRAM_USER_ID` with the number you found above. It will look like `8734062810` — a plain integer, no quotes around the number inside the array (but the array element itself is a string).

After editing, restart the gateway:
```bash
openclaw gateway stop && openclaw gateway start
```

---

## Verifying Access Is Locked

Test by having a friend try to DM your bot. It should not respond. Then DM it yourself — it should respond normally.

Check current config is active:
```bash
openclaw channels status
```

Check logs for blocked attempts:
```bash
openclaw logs --follow
```
Blocked DMs appear as `dmPolicy: allowlist — sender not in allowFrom, dropping`.

---

## If You Need to Add a Trusted Person Temporarily

Add their numeric Telegram ID to `allowFrom`:

```json5
allowFrom: ["YOUR_ID", "THEIR_ID"],
```

Remove it when done. Do not leave extra IDs in the allowlist permanently.

---

## Telegram Privacy Mode Warning

By default, Telegram bots in **group chats** only receive messages that directly mention the bot. This is Privacy Mode.

For your bakery bot (personal DM only), this does not matter — you are not adding it to groups.

If you ever add the bot to a group (e.g., to coordinate with staff), you will need to either:
- Disable Privacy Mode via BotFather: `/setprivacy` → Disable, then remove and re-add the bot to the group
- Or make the bot a group admin

Do not do this until you have read the full Telegram channel documentation at `https://docs.openclaw.ai/channels/telegram`.

---

## Related Commands

```bash
# Check channel status
openclaw channels status

# Watch live logs (see who is trying to DM your bot)
openclaw logs --follow

# Run doctor to catch config issues
openclaw doctor --fix
```
