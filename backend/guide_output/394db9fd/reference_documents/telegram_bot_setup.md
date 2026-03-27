# Telegram Bot Setup — Step-by-Step Reference

**For:** Diana Chen — Scouts Coffee, Mission District SF
**Purpose:** Create and configure the Telegram bot that OpenClaw uses to communicate with you and your staff team.

---

## Overview

You will create a Telegram bot using @BotFather (Telegram's official bot creation service), then link it to your OpenClaw instance. Your staff will interact with the bot in the existing team group chat.

**Time required:** 10–15 minutes

---

## Part 1: Create the Bot via @BotFather

### Step 1: Open @BotFather

1. Open Telegram (phone or desktop)
2. In the search bar, type `@BotFather`
3. Select the account with the blue checkmark and the name **BotFather** — this is the official Telegram service, not an impersonator

### Step 2: Create a New Bot

Send the following command to BotFather:

```
/newbot
```

BotFather will ask:

**"Alright, a new bot. How are we going to call it? Please choose a name for your bot."**

Reply with:
```
Scouts Coffee Assistant
```

**"Good. Now let's choose a username for your bot. It must end in `bot`. Like this, for example: TetrisBot or tetris_bot."**

Reply with something like:
```
ScoutsCoffeeBot
```

> 💡 **TIP:** Usernames must be unique across all of Telegram. If `ScoutsCoffeeBot` is taken, try `ScoutsCoffeeSFBot` or `ScoutsMissionBot`.

### Step 3: Save Your Bot Token

BotFather will reply with a message like:

```
Done! Congratulations on your new bot. You will find it at t.me/ScoutsCoffeeBot.
You can now add a description, about section and profile picture for your bot...

Use this token to access the HTTP API:
7234891023:AAFxyz123abcDEFghiJKLmno456pqrSTUvw

Keep your token secure and store it safely, it can be used by anyone to control your bot.
```

**Copy that token immediately** and store it in your password manager. It looks like:
`1234567890:ABCdefGHIjklMNOpqrSTUvwXYZ`

---

## Part 2: Configure Privacy Mode for Group Use

By default, Telegram bots in Privacy Mode only receive messages that directly mention them. Since Diana wants the bot to help coordinate in the group chat, you need to disable Privacy Mode.

### Step 1: Disable Privacy Mode

In BotFather, send:
```
/setprivacy
```

Select your bot: `@ScoutsCoffeeBot` (or whatever you named it)

BotFather will ask which setting. Select:
```
Disable
```

BotFather confirms: "Privacy mode is disabled for ScoutsCoffeeBot..."

### Step 2: Remove and Re-add Bot in Group

Telegram only applies privacy mode changes when a bot is re-added to a group. After disabling privacy mode:

1. Open your staff team group in Telegram
2. Tap the group name at the top → "Edit" → "Members"
3. Find your bot and remove it
4. Re-add it: "Add Members" → search for `@ScoutsCoffeeBot`

---

## Part 3: Find Your Telegram User ID and Group Chat ID

OpenClaw needs numeric IDs (not usernames) for the access control configuration.

### Find Your Personal User ID

1. Start the OpenClaw gateway if it's not running: `openclaw gateway start`
2. DM your bot from your personal Telegram account (just send "hello")
3. In Terminal on your Mac Mini, run:

```bash
openclaw logs --follow
```

4. Look for a log entry that contains `from.id` — it will be a number like `8734062810`
5. That number is your Telegram user ID — save it
6. Press Ctrl+C to stop following logs

### Find Your Team Group Chat ID

1. In your staff team group in Telegram, send any message (or have a staff member send one)
2. Check `openclaw logs --follow` again
3. Look for `chat.id` — group IDs are negative numbers like `-1001234567890`
4. Save that number

---

## Part 4: Store the Bot Token Securely

**Never put your bot token in plain text.** Use the macOS Keychain via OpenClaw's secret manager:

```bash
openclaw secret set telegram_token "YOUR_BOT_TOKEN_HERE"
```

Replace `YOUR_BOT_TOKEN_HERE` with the actual token from BotFather.

**Verify it stored correctly:**
```bash
openclaw secret list
```

Expected output:
```
telegram_token   (stored in keychain)
```

---

## Part 5: Update Your OpenClaw Config

Open your config file:

```bash
nano ~/.openclaw/config.yaml
```

Update or add the channels section with the IDs you found above:

```yaml
channels:
  telegram:
    enabled: true
    bot_token: ${{ secret.telegram_token }}
    dmPolicy: "allowlist"
    allowFrom:
      - "YOUR_NUMERIC_USER_ID"
    groups:
      "YOUR_TEAM_GROUP_CHAT_ID":
        groupPolicy: "open"
        requireMention: true
```

**Replace:**
- `YOUR_NUMERIC_USER_ID` → the number you found in Step 3 (e.g., `8734062810`)
- `YOUR_TEAM_GROUP_CHAT_ID` → the negative number for your group (e.g., `-1001234567890`)

Save the file: Ctrl+O, Enter, Ctrl+X

Restart the gateway:

```bash
openclaw gateway restart
```

---

## Part 6: Test the Connection

```bash
openclaw channel test telegram
openclaw channels status
```

Expected output:
```
telegram   ✓ connected
```

**Test from Telegram:**
1. DM your bot from your personal Telegram: send "hello"
2. The bot should respond (OpenClaw's default greeting)
3. In your team group, mention the bot: `@ScoutsCoffeeBot hello`
4. The bot should respond in the group

---

## Part 7: Cron Delivery Targets

When you set up automated cron jobs (Section 06 of the main guide), use these formats for the `--to` flag:

| Destination | Format |
|---|---|
| Your personal DM | Your numeric user ID: `8734062810` |
| Team group chat | Your group chat ID: `-1001234567890` |

---

## Troubleshooting

**Bot created but not responding in group**
- Verify privacy mode is disabled (Part 2)
- Verify you removed and re-added the bot after changing privacy mode
- Check: `openclaw channels status`

**"Unauthorized" error in logs**
- Token may be incorrect — verify with: `openclaw secret list`
- Re-run: `openclaw secret set telegram_token "CORRECT_TOKEN"`

**Bot responds to DMs but not in group**
- Verify group chat ID is correctly entered in config (negative number)
- Check group policy: should be `open` for your team group
- Run `openclaw config validate` to check for syntax errors

**Access denied — wrong user**
- Check that your numeric user ID is in `allowFrom`
- Find your correct ID via `openclaw logs --follow` + DM the bot

---

## Summary

| Item | Value |
|---|---|
| Bot Name | Scouts Coffee Assistant |
| Bot Username | `@ScoutsCoffeeBot` (or your chosen name) |
| Secret Key | `telegram_token` (stored in macOS Keychain) |
| DM Policy | `allowlist` — only you |
| Group Policy | `open` — all team members in your specific group |
| Privacy Mode | Disabled (so bot sees all group messages) |

Return to Section 03 of the main setup guide when complete.
