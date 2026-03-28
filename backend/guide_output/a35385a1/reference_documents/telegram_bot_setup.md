# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | 💬 CONNECT YOUR CHANNEL
**When You Need This:** When setting up OpenClaw to communicate via Telegram for the first time.

This guide walks you through creating a Telegram "Bot" and finding the necessary credentials to connect it to OpenClaw.

## Prerequisites
*   A Telegram account.
*   The Telegram app installed on your phone or computer.

## Step-by-Step

### Part 1: Create Your Bot with BotFather

BotFather is the official Telegram bot that helps you create and manage other bots.

1.  **Start a chat with BotFather:**
    *   In your Telegram app, search for the user `@BotFather` (it has a blue verification checkmark).
    *   Start a chat with it and send the command `/start`.

2.  **Create a new bot:**
    *   Send the command `/newbot`.
    *   BotFather will ask you for a name for your bot. This is the friendly name users will see. For example: `My Operations Assistant`.
    *   Next, it will ask for a username. This must be unique and end in `bot`. For example: `MyOpsAssistantBot`.

3.  **Save Your Bot Token:**
    *   If the username is available, BotFather will congratulate you and provide a long string of characters. This is your **Bot Token**.
    *   It will look something like `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi`.
    *   **This token is a secret!** Treat it like a password. Copy it immediately and save it somewhere safe. You will need it for your `config.yaml` file.

### Part 2: Find Your Chat ID

OpenClaw needs to know which specific chat to send messages to. This is your Chat ID.

1.  **Start a chat with your new bot:**
    *   Find your new bot in Telegram by searching for its username (e.g., `@MyOpsAssistantBot`).
    *   Start a chat and send it a message, like `/start` or `hello`. This is essential for the next step to work.

2.  **Get your Chat ID from a helper bot:**
    *   In Telegram, search for the user `@userinfobot`.
    *   Start a chat with it and send the command `/start`.
    *   It will immediately reply with information about your account, including your `Id:`. This number is your **Chat ID**.

## Part 3: Configure OpenClaw

Now you have the two pieces of information OpenClaw needs.

1.  Open your `~/openclaw-agent/config.yaml` file.
2.  Find or add the `channels` section and configure it like this:

    ```yaml
    channels:
      telegram:
        enabled: true
        token: "PASTE_YOUR_BOT_TOKEN_HERE"
        chatId: "PASTE_YOUR_CHAT_ID_HERE"
    ```

3.  Replace `PASTE_YOUR_BOT_TOKEN_HERE` and `PASTE_YOUR_CHAT_ID_HERE` with the values you just obtained.

## Verification
*   After configuring `config.yaml` and starting OpenClaw with `openclaw start`, your agent should be running.
*   Send a message to your bot in Telegram (e.g., "hello").
*   OpenClaw should receive the message and respond. You will see activity in the `openclaw start` terminal window.

## Troubleshooting
*   **Bot doesn't respond:**
    *   Double-check that the `token` in your `config.yaml` is exactly what BotFather gave you.
    *   Ensure you have started a conversation with your bot first before trying to use it.
    *   Make sure the `chatId` is correct.
*   **"Unauthorized" errors in OpenClaw logs:** Your Bot Token is likely incorrect or has been revoked. You can get a new one from BotFather using the `/revoke` command.