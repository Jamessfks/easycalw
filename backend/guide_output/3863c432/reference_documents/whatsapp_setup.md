```markdown
# Connecting OpenClaw to WhatsApp — Detailed Reference
**Parent Guide Section:** 03 | CONNECT YOUR CHANNEL
**When You Need This:** When setting up WhatsApp for the first time, as it requires several steps on the Meta (Facebook) developer website.

---

## Prerequisites
- A Facebook account.
- A phone number that is **not** currently registered with a personal or business WhatsApp account. You can use a new SIM card or a virtual number service.

## Step-by-Step

### 1. Set Up Your Meta App

1.  Go to [developers.facebook.com](https://developers.facebook.com/), log in, and click `My Apps`.
2.  Click `Create App`.
    *   Select `Other` for the use case, then click `Next`.
    *   Select `Business` as the app type, then click `Next`.
    *   Give your app a name (e.g., "FoodTruckBot") and provide your contact email. Click `Create App`.
3.  You'll be taken to the App Dashboard. In the sidebar, find `WhatsApp` and click `Set up`.

### 2. Configure WhatsApp and Get Credentials

1.  You'll be asked to link a Business Account. You can create a new one if you don't have one.
2.  Once set up, you'll be on the `API Setup` page. You'll see a temporary **Access Token** and a **Phone Number ID**. Keep this tab open; you'll need these in a moment.
3.  **Add a "To" phone number.** This is your personal phone number where the agent will send test messages. Enter your number and verify it with the code they send you.

### 3. Connect OpenClaw to WhatsApp

Now, we'll give OpenClaw the credentials it needs. Open your `Terminal` app on your Mac.

1.  Navigate to your OpenClaw directory:
    ```bash
    cd my-openclaw-agent
    ```
2.  Run the interactive WhatsApp setup command:
    ```bash
    openclaw channel configure whatsapp
    ```
3.  The command will ask you for three things from the Meta API Setup page:
    *   **Phone Number ID:** Copy this from the Meta page.
    *   **Access Token:** Copy the temporary access token.
    *   **App Secret:** Go to `App Settings > Basic` on the Meta developer site to find your App Secret.
    *   **Webhook Verify Token:** The command will generate one for you. Copy this value.

### 4. Set Up the Webhook

The webhook is how Meta tells OpenClaw about new messages.

1.  **Start OpenClaw.** Before Meta can verify the webhook, your agent needs to be running. In your Terminal, run:
    ```bash
    openclaw start
    ```
    You will see a line that says `Webhook URL: https://<some-random-name>.trycloudflare.com`. **Copy this URL.**
2.  Go back to the Meta `API Setup` page. Find the `Webhook` section and click `Edit`.
3.  Paste the **Webhook URL** you copied into the `Callback URL` field.
4.  Paste the **Webhook Verify Token** from the previous step into the `Verify token` field.
5.  Click `Verify and Save`.

### 5. Subscribe to Message Events

After verifying, still in the Webhook section, click `Manage`. Subscribe to the `messages` event. This tells Meta to forward all incoming messages to your agent.

## Verification

Send a message from your personal WhatsApp to the business phone number provided by Meta. You should get a response from your agent!

## Troubleshooting

-   **"Verification failed."** Make sure your OpenClaw agent is running (`openclaw start`) *before* you click "Verify and Save". Also, ensure you copied the URL and token correctly.
-   **"Messages not coming through."** Double-check that you subscribed to the `messages` event in the webhook configuration.
```