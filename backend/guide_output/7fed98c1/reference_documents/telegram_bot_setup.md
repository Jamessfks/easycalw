# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 04 | CONNECT YOUR TELEGRAM CHANNEL
**When You Need This:** Full step-by-step walkthrough for creating your Telegram bot and connecting it to OpenClaw.

---

## Prerequisites

- Telegram installed on your phone (iOS or Android)
- OpenClaw installed on your Mac Mini and the onboarding wizard running or completed through Step 2 (model provider configured)
- Terminal open on your Mac Mini

---

## Step-by-Step

### Part 1 — Create Your Bot with BotFather (on your phone)

1. Open Telegram on your phone.
2. In the search bar, type **@BotFather**.
3. Look for the account with the **blue verified checkmark** — this is the real BotFather. Tap it.
4. Tap **Start** to begin the conversation.
5. Send the command: `/newbot`
6. BotFather will ask: *"Alright, a new bot. How are we going to call it? Please choose a name for your bot."*
   - Enter a friendly display name, e.g.: `Chicago Dental Assistant`
7. BotFather will ask: *"Good. Now let's choose a username for your bot. It must end in `bot`."*
   - Enter a unique username, e.g.: `ChicagoDentalAssistantBot` or `MyDentalAgentBot`
   - Usernames must be globally unique. If yours is taken, try adding your city or practice name.
8. BotFather will respond with a success message that includes your **bot token** — a long string that looks like: `7823456789:AAGhfkdjHKJHkjhKJHKJhkjhkjhkjhkjh`
9. **Copy this token and keep it safe.** Treat it like a password — anyone with this token can control your bot.

### Part 2 — Configure the Bot Token in OpenClaw

There are two ways to provide the token:

**Option A — During the onboarding wizard (recommended):**
When the wizard asks "Which channels would you like to configure?" select Telegram and paste your bot token when prompted.

**Option B — After onboarding (via config):**
Edit your OpenClaw config to add the token:
```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_TELEGRAM_BOT_TOKEN",
      dmPolicy: "pairing",
    },
  },
}
```

Then restart the gateway:
```bash
openclaw gateway restart
```

### Part 3 — Pair Your Telegram Account with the Bot

In Terminal on your Mac Mini:

```bash
# List any pending pairing codes
openclaw pairing list telegram

# Approve your pairing code (replace <code> with the code you see)
openclaw pairing approve telegram <code>
```

Alternatively, message your bot in Telegram with `/start` and follow the pairing flow it presents.

### Part 4 — Test the Connection

Send a message to your bot in Telegram. It should respond.

If it doesn't:
1. Run `openclaw gateway status` — make sure the gateway is running
2. Run `openclaw logs --follow` — watch for incoming message logs
3. Make sure your bot token is correctly set

### Part 5 — Lock Down Access (Security — Do This)

For a single-owner bot, you should restrict DM access to only your Telegram account. This prevents anyone who finds your bot from messaging it.

**Find your Telegram numeric user ID:**
1. Message your bot in Telegram
2. In Terminal, run: `openclaw logs --follow`
3. Look for a line containing `from.id` — that number is your Telegram user ID
4. Note it down (it looks like: `987654321`)

**Update your config to use allowlist mode:**
```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_TELEGRAM_BOT_TOKEN",
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_USER_ID"],
    },
  },
}
```

Restart the gateway after this change:
```bash
openclaw gateway restart
```

### Part 6 — (Optional) Disable Bot Privacy Mode for Group Use

If you want to add your bot to a Telegram group (e.g., a staff group for your practice), you need to disable Privacy Mode so the bot can see all group messages:

1. In BotFather, send: `/setprivacy`
2. Select your bot
3. Select **Disable**
4. Remove and re-add the bot to any existing groups — Telegram requires this for the change to take effect

---

## Verification

After setup, verify the channel is connected:

```bash
openclaw channels status
```

You should see Telegram listed as "connected" with no errors.

Send a test message to your bot:
```bash
openclaw message send --channel telegram --target YOUR_NUMERIC_TELEGRAM_USER_ID --message "Hello from OpenClaw setup!"
```

You should receive the message in Telegram within a few seconds.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Bot doesn't respond to messages | Run `openclaw gateway status` — ensure the gateway is running. Then try `openclaw gateway start`. |
| "Unauthorized" error | Your bot token is invalid. Re-check it from BotFather and update your config. |
| Can't find @BotFather | Search for exactly `@BotFather` — don't add spaces. Look for the blue checkmark. |
| Username already taken | Try adding your location or a number: `ChicagoDental2Bot`, `MyDentalAssistant2026Bot` |
| Messages not delivered from cron | Ensure your `--to` value is a numeric chat ID, not a username. Get it from `openclaw logs --follow`. |
| Pairing code expired | Pairing codes expire after 1 hour. Start the pairing process again. |
| "BOT_COMMANDS_TOO_MUCH" error | You have too many skills with Telegram menu commands. Disable some native menus or reduce installed skills. |

---

## Related Docs

- [OpenClaw Telegram documentation](https://docs.openclaw.ai/channels/telegram)
- [Channel pairing](https://docs.openclaw.ai/channels/pairing)
- Parent guide: `OPENCLAW_ENGINE_SETUP_GUIDE.md` — Section 04
