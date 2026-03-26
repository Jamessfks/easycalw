# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL
**When You Need This:** When you are setting up OpenClaw to communicate via Telegram for the first time.

---

## Prerequisites
*   A Telegram account.
*   The Telegram app installed on your phone or desktop.

## Step-by-Step

This process involves talking to a special Telegram bot called "BotFather" to create your own bot.

1.  **Start a Chat with BotFather:**
    *   In your Telegram app, search for the user `@BotFather` (it should have a blue verified checkmark).
    *   Start a chat with it and click the `Start` button, or type `/start`.

2.  **Create a New Bot:**
    *   Type the command `/newbot` and send it to BotFather.
    *   BotFather will ask for a **name** for your bot. This is the friendly name people will see. For example: `My Design Assistant`.
    *   Next, it will ask for a **username** for your bot. This must be unique and end in `bot`. For example: `MyDesignAssistantBot`.

3.  **Copy Your Bot Token:**
    *   If the username is available, BotFather will congratulate you and provide you with a **token**.
    *   This token looks like a long string of numbers and letters, e.g., `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789`.
    *   **This token is a secret!** Do not share it publicly. Copy it to your clipboard.

4.  **Configure OpenClaw with Your Token:**
    *   Go back to your Mac's **Terminal** app.
    *   Run the following command to tell OpenClaw you are using Telegram:
        ```bash
        openclaw config set channel telegram
        ```
    *   Now, securely store your bot token using this command:
        ```bash
        openclaw secrets set TELEGRAM_BOT_TOKEN
        ```
    *   Paste the token you copied from BotFather when prompted, and press Enter.

5.  **Find Your Chat ID:**
    *   Your agent needs to know which Telegram user to send messages to (you!).
    *   In Telegram, search for the bot `@userinfobot` and start a chat with it.
    *   It will immediately reply with your user information. Copy the number next to `Id:`. This is your Chat ID.
    *   In your Terminal, run this command, replacing `<your_chat_id>` with the ID you just copied:
        ```bash
        openclaw config set channel.telegram.chatId <your_chat_id>
        ```

## Verification

You can now start your OpenClaw agent for the first time.

1.  **Start the Agent:** In your Terminal, run:
    ```bash
    openclaw start
    ```
2.  **Send a Test Message:**
    *   In Telegram, find the bot you created (e.g., "My Design Assistant") and send it a message like `Hello`.
    *   If everything is configured correctly, your agent should respond! You will also see activity in your Terminal window.

## Troubleshooting
*   **"Bot doesn't respond":** Double-check that you copied the bot token and your Chat ID correctly. A single character off will cause it to fail.
*   **"Error in terminal":** Make sure you have run `openclaw config set channel telegram` *before* setting the token and chat ID.