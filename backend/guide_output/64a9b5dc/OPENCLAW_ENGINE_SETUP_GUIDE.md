# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Valued User |
| **MISSION** | Automate Gmail Sorting & Response Drafting |
| **DATE** | 2026-07-16 |
| **DEPLOYMENT** | Existing Mac |
| **CHANNEL** | Telegram (Assumed) |
| **MODEL** | Anthropic Claude Sonnet 4.6 (Recommended) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

This guide configures your OpenClaw agent to automatically sort your business Gmail and draft responses — built around your workflow and the tools you already use.

## 🎯 Key Moments — What You Will Accomplish

*   **A Running Assistant:** Your OpenClaw instance will be running on your Mac, securely connected to you via Telegram.
*   **Your First Automation:** You will deploy a daily email triage routine that sorts new messages and drafts replies for your approval, saving you valuable time.
*   **Business-Grade Guardrails:** You will configure security rules to ensure your agent handles your communications safely and never acts without permission.

> ⚠️ **IMPORTANT ASSUMPTION:** Your interview did not specify your hardware or preferred messaging channel. This guide assumes you are installing on your **existing Mac** and connecting via **Telegram**. If this is incorrect, please request a new guide specifying your setup.

## 00 | ✅ PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready. This will make the setup process smooth and fast.

-   **[ ] Hardware & OS:** An Apple Silicon (M1 or newer) Mac running macOS Ventura or later.
-   **[ ] Admin Access:** You have administrator permissions on your Mac to install software.
-   **[ ] Homebrew:** The [Homebrew](https://brew.sh/) package manager is installed.
-   **[ ] Telegram Account:** You have the Telegram app on your phone or desktop.
-   **[ ] Anthropic API Key:** Create an account at [Anthropic](https://console.anthropic.com/) and generate an API key. We recommend a starting budget of $20/month.
-   **[ ] Google Account:** The Gmail account you want to automate. You will authenticate via OAuth (a secure browser pop-up) later.

## 01 | PLATFORM SETUP

These steps prepare your Mac's environment for OpenClaw. We'll use `nvm` to manage Node.js, which prevents conflicts with other system software.

> 💡 **TIP:** Why this matters: Using `nvm` (Node Version Manager) lets you run the specific version of Node.js that OpenClaw is tested on, ensuring stability, without affecting other applications on your Mac.

1.  **Install NVM (Node Version Manager):**
    ```bash
    brew install nvm
    ```

2.  **Configure NVM:** Add the following lines to your shell profile (`~/.zshrc`, `~/.bash_profile`, etc.) and then restart your terminal.
    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
    [ -s "/opt/homebrew/opt/nvm/bash_completion" ] && \. "/opt/homebrew/opt/nvm/bash_completion"
    ```

3.  **Install and Use Node.js:**
    ```bash
    nvm install 24
    nvm use 24
    ```
    **Verify it worked:**
    ```
    $ node -v
    v24.x.x
    ```

## 02 | INSTALL OPENCLAW

With your platform ready, you can now install the OpenClaw Command Line Interface (CLI) and initialize your agent's home directory.

1.  **Install the OpenClaw CLI:**
    ```bash
    npm install -g openclaw-cli
    ```
    **Verify it worked:**
    ```
    $ openclaw --version
    openclaw-cli/x.y.z ...
    ```

2.  **Initialize Your OpenClaw Instance:** This creates the `~/.openclaw` directory where your agent's configuration, memory, and skills will live.
    ```bash
    openclaw init
    ```
    **Verify it worked:**
    ```
    $ openclaw init
    ✔ OpenClaw home directory created at /Users/yourname/.openclaw
    ✔ Default configuration created.
    Next steps:
      1. Set your model provider API key: openclaw config set model.providers.anthropic.apiKey YOUR_API_KEY
      2. Configure a channel (e.g., Telegram): openclaw config set channels.telegram.enabled true
      3. Start the gateway: openclaw start
    ```

## 03 | CONNECT YOUR CHANNEL

This step connects your agent to Telegram so you can communicate with it.

> ✅ **ACTION:** This process involves several steps within the Telegram app. For clarity, we've moved the detailed instructions to a separate reference document.

**Please open and follow the steps in: [`reference_documents/telegram_bot_setup.md`](reference_documents/telegram_bot_setup.md)**

Once you have your Bot Token and Chat ID from that guide, run these commands:
```bash
openclaw config set channels.telegram.enabled true
openclaw config set channels.telegram.token YOUR_TELEGRAM_BOT_TOKEN
openclaw config set channels.telegram.chatId YOUR_TELEGRAM_CHAT_ID
```

## 04 | CONFIGURE YOUR MODEL PROVIDER

Now, connect OpenClaw to your Anthropic account using the API key from the pre-flight checklist.

1.  **Set the Provider:**
    ```bash
    openclaw config set model.provider anthropic
    ```

2.  **Set the API Key:**
    ```bash
    openclaw config set model.providers.anthropic.apiKey YOUR_ANTHROPIC_API_KEY
    ```

3.  **Set the Model:** We recommend `claude-sonnet-4-6` for the best balance of speed, intelligence, and cost for your email tasks.
    ```bash
    openclaw config set model.anthropic.model claude-sonnet-4-6
    ```
    **Verify it worked:**
    ```
    $ openclaw doctor
    ...
    [OK] Model provider is set to 'anthropic'.
    [OK] API key for 'anthropic' is set.
    ...
    ```

## 05 | INSTALL SKILLS

Skills give your agent abilities. For your goal, we'll install skills for security vetting, Google Workspace access, and summarizing content.

> 🔒 **Data Handling Note:** The `gog` skill will request access to your Google account via a secure OAuth pop-up the first time you use it. It will have permission to read and draft emails, but per our guardrails, it will not send anything without your final approval.

Run the following command in your terminal. This will be reinforced by a prompt you send to the agent later.
```bash
clawhub install skill-vetter gog summarize
```
**Verify it worked:**
```
$ clawhub list
Installed skills:
- skill-vetter
- gog
- summarize
```

## 06 | CONFIGURE AUTOMATIONS

Let's create the core automation you asked for: a daily email triage. This `cron` job will run every weekday morning.

> 💡 **TIP:** Why this matters: This single command replaces the manual morning email check you currently perform. It will scan, sort, and prepare draft responses, turning 20 minutes of work into 2 minutes of review.

```bash
openclaw cron add --name "daily-email-triage" --schedule "0 8 * * 1-5" --prompt "Triage my Gmail inbox. Scan for unread emails from the last 24 hours. Categorize them, summarize the important ones, and draft replies for any urgent inquiries. Send me a report for approval. Do not send any emails." --to YOUR_TELEGRAM_CHAT_ID
```
**Verify it worked:**
```
$ openclaw cron list
- id: 1
  name: daily-email-triage
  schedule: 0 8 * * 1-5
  prompt: Triage my Gmail inbox...
```

## 07 | INJECT YOUR SOUL

Your agent's environment is now configured. The final step is to give it its purpose, rules, and workflows.

1.  **Start your OpenClaw agent for the first time:**
    ```bash
    openclaw start
    ```
    You should receive a "Gateway is online" message in your Telegram chat.

2.  **Send the Initialization Prompts:**
    Open the file `prompts_to_send.md`. Copy and paste each prompt into your Telegram chat with the agent, one by one. Wait for the agent to confirm understanding ("Acknowledged", "Understood", etc.) before sending the next. This will load its identity, skills, and safety guardrails.

## 08 | SECURITY HARDENING

Running an agent on your daily-use Mac requires careful security practices.

*   **Enable FileVault:** If not already enabled, go to `System Settings > Privacy & Security > FileVault` and turn it on. This encrypts your Mac's hard drive, protecting your agent's data and API keys if the machine is ever lost or stolen.
*   **Check Permissions:** Periodically review which apps have access to your data in `System Settings > Privacy & Security`. Be mindful of what OpenClaw and its skills can access.
*   **Avoid Running as Root:** Never run OpenClaw with `sudo`. It is designed to run with standard user permissions.

## 09 | SECURITY AUDIT CHECKLIST

Before using your agent for real work, perform this final audit. Send the last prompt from `prompts_to_send.md` which instructs the agent to run these checks.

-   **[ ]** Run `openclaw security audit --deep` in your terminal and ensure all checks pass.
-   **[ ]** Confirm FileVault is enabled.
-   **[ ]** Run `clawhub list` and verify only the expected skills are installed.
-   **[ ]** Run `openclaw cron list` and verify the autonomy tier is appropriate (defaulting to suggest/notify, not execute).

## 10 | TROUBLESHOOTING & NEXT STEPS

*   **"My agent doesn't respond."** Your Mac may have gone to sleep. By default, OpenClaw will pause when your Mac sleeps. For 24/7 operation, consider a dedicated machine like a Mac Mini or use a third-party app like Amphetamine to prevent sleep.
*   **"A skill isn't working."** Check the logs for errors by running `openclaw logs`. Often, this is due to a missing API key or incorrect permissions.
*   **Next Steps:** Explore more skills on [ClawHub](https://clawhub.ai). You can install skills to manage your calendar (`gog`), browse the web (`agent-browser`), or connect to other services you use.

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | http://localhost:8128 (when running) |
| **Gateway Port** | 8128 |
| **Config Location** | `~/.openclaw/config.yaml` |
| **Documentation** | https://docs.openclaw.ai |