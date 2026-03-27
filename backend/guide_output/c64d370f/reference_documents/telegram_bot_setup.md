# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL
**When You Need This:** This document walks you through creating a Telegram "Bot User" to get the API Token required by OpenClaw.

## Prerequisites
*   A Telegram account.
*   The Telegram app installed on your phone or desktop.

## Step-by-Step

### 1. Find "BotFather"
BotFather is the official Telegram bot that helps you create and manage other bots.

*   In your Telegram app, search for the user `@BotFather` (it should have a blue verified checkmark).
*   Start a chat with BotFather.

### 2. Create a New Bot
*   In your chat with BotFather, type `/newbot` and send it.
*   BotFather will ask for a **name** for your bot. This is the friendly name users will see. You can call it something like "Real Estate Assistant".
*   Next, BotFather will ask for a **username**. This must be unique and must end in `bot`. For example: `AustinRE_bot` or `MyRealEstateBot`.

### 3. Save Your API Token
*   If the username is available, BotFather will congratulate you and provide you with a long alphanumeric string. This is your **API Token**.
*   It will look something like this: `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`.
*   **Treat this token like a password.** Do not share it publicly.
*   Copy this token. You will need it for the `openclaw config set channels.telegram.token` command in the main guide.

### 4. Get Your Personal Chat ID
OpenClaw needs to know which Telegram chat to send messages to. For this personal setup, you'll use your own personal chat ID.

*   In your Telegram app, search for the user `@userinfobot`.
*   Start a chat with it. It will immediately reply with a message containing your user information.
*   Find the line that says `Id:`. The number next to it is your **Chat ID**.
*   Copy this Chat ID. You will need it for the `openclaw config set channels.telegram.chatIds` command.

### 5. Start a Conversation with Your New Bot
*   Search for your bot's username (e.g., `@AustinRE_bot`) in Telegram.
*   Start a conversation with it by sending it a message, like `/start` or `hello`.
*   **This step is important.** Your bot cannot initiate a conversation with you. You must message it first.

## Verification
You now have the two pieces of information needed for the main guide:
1.  **Bot Token**
2.  **Your Chat ID**

You can now return to **Section 03** of the main `OPENCLAW_ENGINE_SETUP_GUIDE.md` and run the configuration commands.