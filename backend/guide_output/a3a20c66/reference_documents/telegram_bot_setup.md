# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | Connect Your Channel (Telegram)
**When You Need This:** If you want detailed step-by-step Telegram setup, want to add a staff group later, or need to troubleshoot your bot connection.

---

## Prerequisites

- Telegram app installed on your phone (iOS or Android)
- OpenClaw installed and gateway running (`openclaw gateway status` shows "running")
- Your Anthropic API key configured (`openclaw models status` shows active)

---

## Part 1: Create Your Bot via BotFather

### Step 1 — Find BotFather

1. Open Telegram on your phone
2. Tap the search icon (magnifying glass)
3. Search for: `@BotFather`
4. **Important:** Make sure it has a blue verified checkmark — there are fake BotFather accounts

### Step 2 — Create a New Bot

1. Tap **Start** (or type `/start` and send)
2. Type `/newbot` and send
3. When asked for a **display name** (this is what appears in the chat header), type:
   ```
   Scouts Agent
   ```
4. When asked for a **username** (this is the @handle), type something ending in `bot`:
   ```
   ScoutsCoffeeBot
   ```
   If that's taken, try: `ScoutsCoffeeSFBot`, `ScoutsAgentBot`, etc.

5. BotFather will respond with a success message containing your **bot token**, which looks like:
   ```
   123456789:ABCdefGHIjklMNOpqrSTUvwxyz
   ```

   **Copy this token immediately** and save it in your password manager. You will not see it again unless you ask BotFather for it with `/mybots`.

### Step 3 — Optional: Set a Bot Description and Photo

While still in BotFather:
- Type `/setdescription` and follow the prompts to add "Scouts Coffee AI assistant"
- Type `/setuserpic` to upload a profile photo (use your Scouts Coffee logo)

---

## Part 2: Connect Bot to OpenClaw

### Step 4 — Run Channel Setup

On your Mac Mini terminal (SSH in if headless):

```bash
openclaw onboard --channel telegram
```

Paste your bot token when prompted.

### Step 5 — Start Gateway and Pair Your Account

```bash
openclaw gateway
```

In a new terminal tab:

```bash
openclaw pairing list telegram
```

You'll see a pairing code like `ABCD-1234`.

Now message your bot in Telegram (search for `@ScoutsCoffeeBot` and tap Start). The bot won't respond yet — that's normal.

Back in the terminal:

```bash
openclaw pairing approve telegram <code>
```

Replace `<code>` with the code from `pairing list`.

> ⚠️ **WARNING:** Pairing codes expire after 1 hour. If yours expires, run `openclaw pairing list telegram` again to generate a fresh one.

### Step 6 — Verify the Connection

```bash
openclaw channels status
```

**Expected output:**
```
telegram   ✓ connected   dmPolicy: pairing
```

Now send a test message to your bot in Telegram. It should respond within a few seconds.

---

## Part 3: Lock Down Access (Security-Critical)

Right now, your bot uses `dmPolicy: pairing` — meaning anyone who finds your bot can message it after going through the pairing flow. For a single-operator business assistant, you want `allowlist` mode instead.

### Step 7 — Find Your Numeric Telegram User ID

1. Message your bot from Telegram (send "hello")
2. On your Mac Mini: `openclaw logs --follow`
3. Look for a line containing `from.id:` — the number after it is your Telegram user ID
   ```
   from.id: 123456789
   ```
4. Press `Ctrl+C` to stop following logs

### Step 8 — Update Config to Allowlist Mode

Open your config file:
```bash
nano ~/.openclaw/config.json5
```

Find the `channels.telegram` section and update it to:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_BOT_TOKEN",
      dmPolicy: "allowlist",
      allowFrom: ["123456789"],  // replace with YOUR numeric ID from Step 7
    },
  },
}
```

Save the file (`Ctrl+X`, then `Y`, then `Enter` in nano).

Restart the gateway to apply changes:
```bash
openclaw gateway stop
openclaw gateway start
```

**Verify it worked:**
```bash
openclaw channels status
```
```
telegram   ✓ connected   dmPolicy: allowlist
```

Test: try messaging the bot from a *different* Telegram account (a friend's phone). It should not respond.

---

## Part 4: Optional — Staff Group Setup

Once your personal bot setup is stable (after 2+ weeks), you can add the bot to a private Scouts Coffee staff group. This lets your staff ask the agent questions about the schedule without having access to your personal messages.

### Step 9 — Create a Staff Telegram Group

1. In Telegram, create a new group called "Scouts Coffee Staff"
2. Add your 8 staff members
3. Add your bot (`@ScoutsCoffeeBot`) to the group

### Step 10 — Configure Group Access

You need to get the group's chat ID. After adding the bot:

```bash
openclaw logs --follow
```

Send a message in the group. Look for `chat.id:` in the logs — it will be a negative number like `-1001234567890`.

Update your config to allow the group:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_BOT_TOKEN",
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_ID"],
      groups: {
        "-1001234567890": {
          groupPolicy: "open",
          requireMention: true,
        },
      },
    },
  },
}
```

With `requireMention: true`, staff must @mention the bot to get a response (e.g. "@ScoutsCoffeeBot what are my shifts next week?"). This prevents the bot from responding to every group message.

> 💡 **TIP:** Keep the staff group's agent access limited. You can restrict which skills are available in the group by adding a `skills: ["gog", "weather"]` list to the group config — this means the bot in the group can only answer schedule and weather questions, not access your supplier emails.

### Step 11 — Restart Gateway

```bash
openclaw gateway stop
openclaw gateway start
openclaw channels status
```

---

## Verification

After completing all steps:

- [ ] Bot responds to your DMs on Telegram
- [ ] Bot does NOT respond to messages from other accounts (allowlist working)
- [ ] `openclaw channels status` shows `dmPolicy: allowlist`
- [ ] Your numeric Telegram ID is in the `allowFrom` array
- [ ] (Optional) Staff group bot responds only when @mentioned

---

## Troubleshooting

**Bot not responding after setup**
- Verify gateway is running: `openclaw gateway status`
- Check the bot token is correct: `openclaw channels status`
- Check logs for errors: `openclaw logs --follow`
- Confirm your Telegram ID is in `allowFrom` (if using allowlist mode)

**"unauthorized" errors in logs**
- Your Telegram user ID is not in `allowFrom`. Re-run Step 7 to get the correct ID.
- Make sure you're saving the numeric ID, not your @username.

**Bot responds to everyone (not locked down)**
- You're still on `dmPolicy: pairing`. Complete Steps 7–8 above.

**Group messages not working**
- Verify the bot is an admin in the group (or has privacy mode disabled)
- In BotFather: `/setprivacy` → select your bot → choose "Disable" to allow it to see all group messages
- Then remove and re-add the bot to the group for the change to take effect

**Pairing code expired**
```bash
openclaw pairing list telegram
# A new code will be generated
openclaw pairing approve telegram <new-code>
```

---

*For more Telegram configuration options, see the full docs at: https://docs.openclaw.ai/channels/telegram*
