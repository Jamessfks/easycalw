# Telegram Bot Setup — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL
**When You Need This:** When setting up OpenClaw to use Telegram for the first time.

This guide walks you through creating a Telegram Bot and finding the necessary credentials to connect it to OpenClaw.

## Prerequisites
*   A Telegram account.
*   The Telegram application installed on your phone or desktop.

## Step-by-Step

1.  **Find BotFather:**
    *   In your Telegram app, search for the user `@BotFather` (it will have a blue checkmark).
    *   Start a chat with BotFather.

2.  **Create a New Bot:**
    *   Send the command `/newbot` to BotFather.
    *   It will ask for a name for your bot. This is the display name, like "My Business Assistant". Choose any name you like.
    *   Next, it will ask for a username. This must be unique and end in `bot`. For example: `MyBizAssistantBot`.

3.  **Save Your Bot Token:**
    *   Upon successful creation, BotFather will send a message containing your **Bot Token**. It will look something like `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789`.
    *   **This is a secret!** Do not share it publicly. Copy it and save it somewhere safe for the next step in the main guide.

4.  **Find Your Chat ID:**
    *   In your Telegram app, search for the user `@userinfobot`.
    *   Start a chat with this bot. It will immediately reply with a message containing your user information, including your `Id:`. This number is your **Chat ID**.
    *   Copy your Chat ID.

## Verification

You now have the two pieces of information needed by OpenClaw:
*   **Bot Token:** From BotFather.
*   **Chat ID:** From @userinfobot.

You can now return to Section 03 of the main setup guide and use these values in the `openclaw config set` commands.

## Troubleshooting

*   **"I can't find BotFather."**: Ensure you are searching for the exact username `@BotFather` and that it has the official verified checkmark.
*   **"My bot username is taken."**: Bot usernames are unique globally. Try a different variation until you find one that is available.
*   **"I lost my Bot Token."**: Send the `/token` command to BotFather. It will let you select your bot and generate a new token. If you do this, remember to update the token in your OpenClaw config.