# Telegram Bot Setup — Detailed Reference

**Parent Guide Section:** 03 | Connect Your Channel (Telegram)
**When You Need This:** Use this document if the quick steps in Section 03 of the main guide weren't detailed enough, or if you hit an error during bot creation.

---

## Prerequisites

- Telegram app installed on your phone (iPhone or Android)
- Your Mac Mini running and connected to the internet
- Terminal open on your Mac Mini
- OpenClaw installed and verified (`openclaw --version`)

---

## Step-by-Step

### Part 1 — Create Your Bot in Telegram (On Your Phone)

**Step 1:** Open the Telegram app on your phone.

**Step 2:** In the search bar at the top, search for `@BotFather`.

**Step 3:** Confirm it's the real BotFather — look for the **blue verification checkmark** next to its name. There are impersonators. Only the verified @BotFather with the checkmark is legitimate.

**Step 4:** Tap **Start** at the bottom of the chat.

**Step 5:** Type `/newbot` and send it.

**Step 6:** BotFather will ask: *"Alright, a new bot. How are we going to call it? Please choose a name for your bot."*

Type a friendly name for your coffee shop agent. Examples:
- `Coffee Shop Assistant`
- `My Shop Bot`
- Your actual shop name (e.g. `Sunrise Coffee Bot`)

**Step 7:** BotFather will ask for a username. The username must:
- End in the word `bot` (e.g. `sunrisecoffeebot`, `mycoffeeshopbot`)
- Be globally unique across all of Telegram
- Use only letters, numbers, and underscores

Try your shop name + "bot". If it's taken, add your city or a number (e.g. `sunrisecoffeeseattlebot`).

**Step 8:** BotFather replies with a success message that looks like this:

```
Done! Congratulations on your new bot. You will find it at t.me/yourbotname.
You can now add a description, about section and profile picture for your bot,
see /help for a list of commands. By the way, when you've finished creating
your cool bot, ping our Bot Support if you want a better username for it.
But first, let's talk about the token for your new bot.

Use this token to access the HTTP API:
7234819203:AAHkjklXXXXXXXXXXXXXXXXXXXXXXXXXXX

Keep your token secure and store it safely, it can be used by anyone to control your bot.

For a description of the Bot API, see this page: https://core.telegram.org/bots/api
```

**Copy that token carefully** — the long string after the colon. It looks like:
`1234567890:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

This is your **bot token**. Treat it like a password.

---

### Part 2 — Connect the Bot to OpenClaw (In Terminal)

**Step 1:** In Terminal on your Mac Mini, run:

```bash
openclaw channels add telegram
```

When prompted, paste your bot token.

**Step 2:** Restart the gateway to apply the new channel:

```bash
openclaw gateway restart
```

**Step 3:** Initiate pairing:

```bash
openclaw pairing list telegram
```

This will show a pairing code. Then approve it:

```bash
openclaw pairing approve telegram <code>
```

Replace `<code>` with the actual pairing code shown.

**Step 4:** On your phone, open your new bot in Telegram and send it any message (e.g. "hello").

**Step 5:** In Terminal, check the logs to confirm the message arrived:

```bash
openclaw logs --follow
```

You should see your message appear in the log. Press **Ctrl+C** to stop following logs when done.

---

### Part 3 — Find Your Telegram Numeric User ID

You need this for the allowlist configuration in Step 3C of the main guide. This number identifies your Telegram account uniquely.

**Method 1 (Recommended — No Third-Party Bots):**

1. Send a DM to your new bot from your phone
2. In Terminal, run: `openclaw logs --follow`
3. Look for a line containing `from.id` — the number next to it is your user ID
4. Example: `"from": {"id": 987654321, "first_name": "Alex"}` → your ID is `987654321`

**Method 2 (Alternative):**

In Telegram, search for `@userinfobot` (a third-party utility bot) and send it `/start`. It will reply with your numeric ID. Note: this involves a third-party service — Method 1 is more private.

---

## Verification

When everything is working, this command should show your bot as connected:

```bash
openclaw channels status
```

Expected output:
```
telegram   ✓ connected   bot: @yourbotname
```

Send a test message to your bot from Telegram. It should respond within a few seconds.

---

## Troubleshooting

**Bot exists but OpenClaw says "token invalid"**
- Double-check you copied the full token (it has a colon in the middle: `123456789:AAFxxx...`)
- Re-run `openclaw channels add telegram` and paste carefully

**Pairing code expired**
- Pairing codes expire after 1 hour
- Run `openclaw pairing list telegram` again to get a fresh code

**Bot responds in Telegram but then stops**
- Check if the gateway is still running: `openclaw gateway status`
- If it stopped: `openclaw gateway start`
- Check if Mac Mini went to sleep (verify Amphetamine is running in menu bar)

**"setMyCommands failed" error in logs**
- This is usually a network hiccup — Telegram's API was briefly unreachable
- Run `openclaw gateway restart` and it typically resolves
- If persistent, check your internet connection on the Mac Mini

**Message arrives in logs but no response is sent**
- Make sure your Anthropic API key is valid: `openclaw models status`
- Check your spending limit hasn't been hit: [console.anthropic.com](https://console.anthropic.com) → Billing

---

*Return to the main guide: [OPENCLAW_ENGINE_SETUP_GUIDE.md](../OPENCLAW_ENGINE_SETUP_GUIDE.md) — Section 03.*
