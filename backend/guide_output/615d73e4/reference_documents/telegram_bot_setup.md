# Creating Your Telegram Bot — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL
**When You Need This:** This guide is for the one-time setup of a Telegram "bot user," which OpenClaw uses to send and receive messages.

## Prerequisites
*   A Telegram account.
*   The Telegram app installed on your phone or desktop.

## Step-by-Step

### 1. Find BotFather
BotFather is the official Telegram bot that helps you create and manage other bots.

*   In the Telegram app, search for the user `BotFather` (it should have a blue verified checkmark).
*   Start a chat with BotFather.

![BotFather Search](templates/images/image7.png)

### 2. Create a New Bot
*   In your chat with BotFather, type the command and send it:
    `/newbot`

### 3. Name Your Bot
*   BotFather will ask for a name for your bot. This is the friendly name that users will see in their contact list.
*   Choose a name, for example: `Jamie's Assistant`
*   Send the name.

### 4. Choose a Username
*   Next, BotFather will ask for a username for your bot. This username must be unique and must end in `bot`.
*   For example: `JamieAssistantBot` or `Jami3sWorkBot`.
*   Send the username.

### 5. Copy Your API Token
*   If the username is available, BotFather will respond with a confirmation message that includes your **API Token**.
*   The token is a long string of numbers and letters, like `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`.

![API Token Example](templates/images/image8.png)

> ⚠️ **WARNING:** Treat this token like a password. Anyone who has it can control your bot. Do not share it publicly.

## Verification
You have successfully completed this step when you have copied the API token. You will paste this token into the command line as instructed in Section 03 of the main setup guide.