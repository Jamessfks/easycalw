# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | 💬 CONNECT YOUR CHANNEL
**When You Need This:** This is a required step to connect OpenClaw to the Telegram messaging platform.

---

## Prerequisites
*   A Telegram account.
*   The Telegram app installed on your phone or desktop.

## Step-by-Step

This process involves talking to a special bot on Telegram called "BotFather" to register your new bot.

### 1. Find BotFather
*   In the Telegram app, search for the user `@BotFather` (it will have a blue verification checkmark).
*   Start a chat with BotFather.

### 2. Create Your Bot
*   In your chat with BotFather, type `/newbot` and send it.
*   BotFather will ask for a name for your bot. This is the display name (e.g., "Jamie's Assistant"). Send the name you want.
*   Next, it will ask for a username. This must be unique and end in `bot` (e.g., `JamieTriageBot`). Send the username.

### 3. Save Your Bot Token
*   If the username is available, BotFather will reply with a confirmation message that includes a **token**. It will look something like this: `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ-123456`.
*   This token is your bot's password. Keep it secure.

    > ⚠️ **WARNING:** Do not share this token with anyone. Anyone who has it can control your bot.

### 4. Find Your Chat ID
*   OpenClaw needs to know your personal Telegram Chat ID to send you messages.
*   In the Telegram app, search for the user `@userinfobot` and start a chat.
*   Send the command `/start`.
*   The bot will reply with your user information, including your **ID**. This is your Chat ID. It will be a number (e.g., `987654321`).
*   Save this Chat ID.

### 5. Configure OpenClaw
*   Now, go back to your Mac's Terminal.
*   Run the following commands, replacing the placeholders with the token and Chat ID you just saved.

    ```bash
    # Set the channel to telegram
    openclaw config set channel telegram

    # Set your bot's token
    openclaw config set channels.telegram.botToken <paste-your-token-here>
    
    # Set your personal chat ID
    openclaw config set channels.telegram.chatId <paste-your-chat-id-here>
    ```

## Verification
You have successfully configured the Telegram channel. When you run `openclaw start` in the main guide, OpenClaw will use this token to connect to Telegram and listen for your messages. You can verify the settings were saved correctly:

```bash
$ openclaw config get channel
telegram

$ openclaw config get channels.telegram.chatId
<your-chat-id-here>
```

## Troubleshooting
*   **"Bot not responding":** Double-check that you copied the bot token exactly right. Even one character off will cause it to fail.
*   **"I'm not getting messages":** Make sure you set your `chatId` correctly in the config. Also, you must send your bot a message first to initiate the conversation before it can message you back.