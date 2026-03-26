# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL
**When You Need This:** This document guides you through creating a Telegram "bot" and getting the API token (secret key) required by OpenClaw.

## Prerequisites
- A Telegram account.
- The Telegram app installed on your phone or desktop.

## Step-by-Step

You'll be interacting with a special Telegram bot called "BotFather," which is Telegram's official bot for creating and managing other bots.

1.  **Start a chat with BotFather:**
    -   In your Telegram app, search for the user `@BotFather` (it should have a blue verified checkmark).
    -   Start a chat with it and send the command:
        ```
        /start
        ```

2.  **Create your new bot:**
    -   Send the following command to BotFather:
        ```
        /newbot
        ```
    -   BotFather will ask for a **name** for your bot. This is the friendly name users will see. You can enter something like "Scouts Coffee Ops".
    -   Next, it will ask for a **username**. This must be unique and end in `bot`. For example: `ScoutsCoffeeOpsBot`.

3.  **Copy your API Token:**
    -   If the username is available, BotFather will congratulate you and provide you with a long alphanumeric string. **This is your API Token.** It will look something like this:
        `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ-123456789`
    -   **This token is a secret!** Treat it like a password. Do not share it publicly.
    -   Copy this token to your clipboard. You will need it for the main setup guide.

![An image showing the conversation with BotFather in Telegram, highlighting the final message where the API token is provided.](templates/images/image5.png)

## Verification

You have successfully completed this step when you have a long API token saved securely. You can now return to **Section 03** of the main `OPENCLAW_ENGINE_SETUP_GUIDE.md` and use this token in the `openclaw config set` command.

## Troubleshooting

- **"Username is already taken":** The username you chose is not unique. Try a different variation, such as adding your city or a number to it.
- **Lost your token?** If you lose the token, you can go back to your chat with `@BotFather` and send the command `/token`. It will let you select your bot and generate a new token for it. If you generate a new one, the old one will stop working.