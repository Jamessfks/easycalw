# Connecting to Telegram — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL
**When You Need This:** When you are setting up your OpenClaw agent for the first time and want to communicate with it via the Telegram app.

This guide will walk you through creating a Telegram "Bot User" and connecting it to your OpenClaw instance.

## Prerequisites
*   The Telegram app installed on your smartphone.
*   Your OpenClaw instance should be running on your Mac Mini.

## Step-by-Step

### 1. Find "BotFather" in Telegram
BotFather is the official Telegram bot that helps you create and manage other bots.
*   Open Telegram on your phone.
*   In the search bar, type `BotFather` (it should have a blue checkmark next to it).
*   Tap on it to start a chat.

### 2. Create Your New Bot
*   In your chat with BotFather, type `/newbot` and press send.
*   BotFather will ask you for a name for your bot. This is the friendly name people will see. Choose something like `My Coffee Shop Assistant`.
*   Next, it will ask for a username. This must be unique and end in `bot`. For example: `MyCoffeeShopBot` or `MikesCafeBot`.

### 3. Save Your API Token
Once you choose a valid username, BotFather will send you a confirmation message that includes your **API Token**. This token is very important and secret.
*   It will look something like `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ-1234567`.
*   Copy this token carefully.

> ⚠️ **WARNING:** Treat this token like a password. Anyone who has it can control your bot. Do not share it publicly.

### 4. Configure OpenClaw with the Token
Now, let's give the token to OpenClaw.
*   Go to the Terminal window on your Mac Mini where OpenClaw is running.
*   Stop the agent if it's currently running by pressing `Control + C`.
*   Run the following command, pasting your token where indicated:
    ```bash
    openclaw config set telegram_token YOUR_COPIED_API_TOKEN
    ```

### 5. Restart OpenClaw
*   Start the agent again with the new configuration:
    ```bash
    openclaw start
    ```

## Verification
You're almost done! Now you just need to start a conversation.
1.  In the confirmation message from BotFather, there was a link to your new bot (e.g., `t.me/MyCoffeeShopBot`). Tap on it.
2.  This will open a chat with your bot in Telegram.
3.  Tap the `Start` button or send a message like `Hello`.

Your OpenClaw agent running on your Mac Mini should receive the message and respond to you in the chat!

## Troubleshooting
*   **No response from the bot:**
    *   Double-check that you copied the Telegram token correctly in Step 4.
    *   Ensure your OpenClaw agent is running on the Mac Mini (`openclaw start`).
    *   Make sure your Mac Mini has a stable internet connection.