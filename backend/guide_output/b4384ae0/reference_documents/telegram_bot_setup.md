# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | 💬 CONNECT YOUR CHANNEL
**When You Need This:** When setting up OpenClaw to use Telegram as its communication channel for the first time.

This guide walks you through creating a Telegram Bot and finding the necessary credentials to connect it to your OpenClaw instance.

---

## Prerequisites
*   A Telegram account.
*   The Telegram desktop or mobile app installed.

---

## Step 1: Create Your Bot with BotFather

"BotFather" is the official Telegram bot that you use to create and manage other bots.

1.  **Start a chat with BotFather:**
    *   In your Telegram app, search for the user `@BotFather` (it will have a blue verified checkmark).
    *   Start a chat with it and click the `Start` button or type `/start`.

2.  **Create a new bot:**
    *   Send the command `/newbot`.
    *   BotFather will ask for a display name for your bot. This is a friendly name, like `Marco's Dev Assistant`.
    *   Next, it will ask for a username. This must be unique and end in `bot`. For example, `MarcoDevBot` or `marcos_dev_bot`.

3.  **Save your Bot Token:**
    *   Upon successful creation, BotFather will send you a message containing your **HTTP API token**. It will look something like `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ-123456789`.
    *   **This token is your primary secret.** Copy it and save it somewhere secure. You will need it for the `openclaw config` command in the main guide.

## Step 2: Find Your Chat ID

OpenClaw needs to know which specific chat to send messages to. This is your `Chat ID`.

1.  **Start a chat with your new bot:**
    *   Find your bot in Telegram using the username you just created (e.g., `@MarcoDevBot`).
    *   Start a chat with it and send it any message, like "hello". The bot won't reply yet, but this is a necessary step to initialize the chat.

2.  **Get your Chat ID from a helper bot:**
    *   The easiest way is to use a helper bot. In Telegram, search for `@userinfobot`.
    *   Start a chat with `@userinfobot` and it will immediately reply with a message containing your user information, including your `Id`.
    *   Your `Chat ID` is the number next to `Id`. It is typically a 9 or 10-digit number.

    > **Note:** This ID is for your personal chat with the bot. If you want the bot to message a group, you must add the bot to the group, send a message to the group, and then use a more advanced method to find the group's ID (which will be a negative number). For personal use, your user ID is sufficient.

## Verification

You have successfully gathered your credentials if you have:
*   A Bot Token (a long alphanumeric string).
*   Your Chat ID (a multi-digit number).

You can now return to **Section 03** of the main `OPENCLAW_ENGINE_SETUP_GUIDE.md` to configure your instance.

## Troubleshooting

*   **"Bot name/username is already taken"**: Usernames must be globally unique. Try a different variation.
*   **Can't find `@userinfobot`**: Ensure you are searching for the correct username. There are many similar bots; use the one with that exact name.
*   **Bot doesn't respond after setup**:
    *   Double-check that the `botToken` in your OpenClaw config is correct and has no typos.
    *   Ensure you have restarted the OpenClaw gateway after setting the configuration.
    *   Check the OpenClaw logs (`~/.openclaw/logs/`) for any error messages related to Telegram.