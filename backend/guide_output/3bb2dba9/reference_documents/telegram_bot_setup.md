# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL
**When You Need This:** When you need to create a new Telegram bot and get the API Token and Chat ID required for OpenClaw.

---

## Prerequisites
- A Telegram account.
- The Telegram app installed on your phone or desktop.

## Step-by-Step

### Part 1: Create Your Bot with BotFather

BotFather is the official Telegram bot that helps you create and manage other bots.

1.  **Start a chat with BotFather:**
    *   In your Telegram app, search for the user `@BotFather` (it has a blue verification checkmark).
    *   Start a chat with it and send the command `/start`.

2.  **Create a new bot:**
    *   Send the command `/newbot`.
    *   BotFather will ask for a **name** for your bot. This is the friendly name users will see. You can enter something like "Scouts Ops Bot".
    *   Next, it will ask for a **username**. This must be unique and end in `bot`. For example: `ScoutsOpsBot` or `ScoutsCoffeeHelperBot`.

3.  **Save Your Bot Token:**
    *   If the username is available, BotFather will congratulate you and provide a **token**. It looks like a long string of numbers and letters, e.g., `123456:ABC-DEF1234ghIkl-zyx57W2v1u123456789`.
    *   **This token is your bot's password. Treat it like a secret.** Copy it immediately and store it somewhere safe. You will need it for the main setup guide.

    ![BotFather Token Example](templates/images/image5.png)

### Part 2: Get Your Personal Chat ID

Your agent needs to know which user to send messages to. This is your personal Chat ID.

1.  **Start a chat with your new bot:**
    *   Find the bot you just created in Telegram by searching for its username (e.g., `@ScoutsOpsBot`).
    *   Send it a message. Anything will work, just `/start` or "hello". **You must do this first** for the bot to see your chat.

2.  **Find your Chat ID:**
    *   Open your web browser and paste the following URL, replacing `YOUR_BOT_TOKEN` with the actual token you just saved:
        ```
        https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
        ```
    *   For example: `https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123456789/getUpdates`
    *   You will see some text on the page in a format called JSON. Look for a section that says `"chat":{"id":...}`. The number that follows is your Chat ID. It will be a long number, e.g., `987654321`.
    *   Copy this Chat ID.

    ```json
    {
      "ok": true,
      "result": [
        {
          "update_id": 8393,
          "message": {
            "message_id": 1,
            "from": {
              "id": 987654321,  // <-- THIS IS YOUR CHAT ID
              "is_bot": false,
              "first_name": "Alex",
              "language_code": "en"
            },
            "chat": {
              "id": 987654321,  // <-- THIS IS YOUR CHAT ID
              "first_name": "Alex",
              "type": "private"
            },
            "date": 1678886400,
            "text": "hello"
          }
        }
      ]
    }
    ```

## Verification

You now have the two pieces of information needed by the main setup guide:
- **Bot Token:** e.g., `123456:ABC-DEF1234ghIkl-zyx57W2v1u123456789`
- **Chat ID:** e.g., `987654321`

You can now return to **Section 03** of the `OPENCLAW_ENGINE_SETUP_GUIDE.md` and use these values in the `openclaw config set` commands.