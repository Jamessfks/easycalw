# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Business.**

| | |
|---|---|
| **PREPARED FOR** | Alex, Owner of Scouts Coffee |
| **MISSION** | Automate staff scheduling & supplier orders |
| **DATE** | October 26, 2026 |
| **DEPLOYMENT** | Dedicated Mac Mini |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude 3 Sonnet |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to streamline staff scheduling and automate supplier orders for Scouts Coffee — built around your Telegram workflow and the tools you already use.**

## 🎯 Key Moments — What You Will Accomplish

*   **Activate a 24/7 Operations Assistant:** Your Mac Mini will be transformed into a dedicated, always-on agent that you can securely message through Telegram.
*   **Automate Your Weekly Grind:** You will set up routines to remind you of supplier deadlines and help draft weekly staff schedules, freeing you up from manual administrative tasks.
*   **Build a Secure Foundation:** You will implement security best practices from day one, ensuring your business data is protected on your own hardware.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

Alex, before we begin, let's gather everything you'll need. As you're technically intermediate, most of this should be straightforward.

- [ ] **Hardware:** An Apple Silicon Mac Mini (M1 or newer) connected to power and the internet.
- [ ] **Accounts:**
    - A dedicated Apple ID for the Mac Mini (do not use your personal one).
    - A dedicated Google Account for the agent (for calendar/sheets access).
    - An account with [Anthropic](https://www.anthropic.com) to access the Claude 3 Sonnet model.
- [ ] **API Keys & Tokens:**
    - **Anthropic API Key:** Get this from your Anthropic account dashboard.
    - **Telegram Bot Token:** You will generate this using Telegram's "BotFather" in Section 03.

---

## 01 | 🖥️ PLATFORM SETUP

We'll configure your Mac Mini to be a secure, dedicated home for OpenClaw.

> 💡 **TIP:** Why this matters: Creating a separate user account isolates the agent from your personal data and gives it a clean environment to work in, which is a critical security step.

1.  **Create a Dedicated User Account:**
    *   On your Mac Mini, go to `System Settings > Users & Groups`.
    *   Click `Add Account...` (you may need to unlock with your admin password).
    *   Create a new **Standard** user named `openclaw` or something similar. Do not make it an Administrator.
    *   Log out of your main account and log into this new `openclaw` account. You will perform the rest of this setup from there.

2.  **Enable Full Disk Encryption:**
    *   Go to `System Settings > Privacy & Security`.
    *   Find **FileVault** and turn it on. This will encrypt the Mac Mini's entire drive.
    *   **This is non-negotiable.** If the machine is ever stolen, your business data and API keys will be unreadable.

3.  **Install Developer Tools:**
    *   Open the `Terminal` app (you can find it in `Applications/Utilities` or search with Spotlight).
    *   Run the following command to install Xcode Command Line Tools, which are required for OpenClaw's dependencies.
        ```bash
        xcode-select --install
        ```

4.  **Install Node.js via Homebrew:**
    *   First, install Homebrew (if you haven't already) by pasting this command into your terminal:
        ```bash
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        ```
    *   Next, install `nvm` (Node Version Manager), which lets you easily manage Node.js versions:
        ```bash
        brew install nvm
        ```
    *   Finally, install and use the recommended version of Node.js:
        ```bash
        nvm install 24
        nvm use 24
        ```
    **Verify it worked:**
    ```
    $ node -v
    v24.x.x
    ```

---

## 02 | 📥 INSTALL OPENCLAW

Now we'll install the OpenClaw engine itself.

1.  **Install OpenClaw Globally:**
    *   In your terminal, run the `npm` (Node Package Manager) command to install OpenClaw.
        ```bash
        npm install -g openclaw
        ```

2.  **Initialize Your OpenClaw Instance:**
    *   This command creates the necessary configuration files in your user's home directory (`~/.openclaw`).
        ```bash
        openclaw init
        ```
    **Verify it worked:**
    ```
    $ openclaw init
    ✅ OpenClaw initialized. Configuration files are at /Users/openclaw/.openclaw
    ```

---

## 03 | 💬 CONNECT YOUR CHANNEL

This step connects your agent to Telegram so you can chat with it. The process of creating a bot and getting a token can be tricky, so we've moved the detailed steps to a separate reference document.

> ✅ **ACTION:** Open the reference document below and follow the instructions. You will get a **Bot Token** and your personal **Chat ID**. You need both for the next step.
>
> **Reference Guide:** [Detailed Telegram Bot Setup](reference_documents/telegram_bot_setup.md)

Once you have your token and chat ID from the guide, secure them in the OpenClaw config:

```bash
# Paste your Bot Token from BotFather
openclaw config set channels.telegram.botToken 'YOUR_TELEGRAM_BOT_TOKEN'

# Paste your personal Chat ID
openclaw config set channels.telegram.chatId 'YOUR_PERSONAL_CHAT_ID'
```

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

Here, we'll connect OpenClaw to Anthropic's Claude model.

> 🍽️ **Food Safety Note:** Your agent's "memory" is sent to third-party services like Anthropic. Avoid discussing sensitive information like employee health details or specific food safety violation reports. Keep that data in secure, local documents that you can ask the agent to summarize or reference by filename only.

1.  **Set the API Key:**
    *   Take the API key you got from your Anthropic dashboard.
    *   Run this command, replacing the placeholder with your actual key:
        ```bash
        openclaw config set provider.anthropic.apiKey 'YOUR_ANTHROPIC_API_KEY'
        ```

2.  **Set the Default Model:**
    *   We recommend `claude-3-5-sonnet-20240620` for the best balance of speed, cost, and intelligence.
        ```bash
        openclaw config set model claude-3-5-sonnet-20240620
        ```
    **Verify it worked:**
    ```
    $ openclaw config get model
    claude-3-5-sonnet-20240620
    ```

---

## 05 | 🛠️ INSTALL SKILLS

Skills are the tools your agent uses. We'll install a starter set tailored for your coffee shop's needs.

> ⚠️ **WARNING:** Always install `skill-vetter` first. It's a security tool that scans other skills before they are installed to ensure they are safe.

Run these commands one by one in your terminal:

```bash
# 1. Install the security vetter (MANDATORY FIRST STEP)
clawhub install skill-vetter

# 2. Install Google Workspace integration (for Calendar and Sheets)
clawhub install gog

# 3. Install AI-powered web search
clawhub install tavily-web-search

# 4. Install a tool for summarizing documents and web pages
clawhub install summarize
```

---

## 06 | ⚙️ CONFIGURE AUTOMATIONS

Alex, here's where we automate the specific tasks you mentioned. We'll create two "cron jobs" — scheduled tasks for your agent.

> 💡 **TIP:** Why this matters: These automations replace the manual reminders and administrative overhead of running your weekly operations. We are starting them at "Notify" level, meaning the agent will prompt you, not act on its own.

1.  **Weekly Supplier Order Reminder:**
    *   This job will run every Thursday at 10:00 AM and send you a message on Telegram to place your weekly orders.
        ```bash
        openclaw cron add --schedule "0 10 * * 4" --name "weekly-order-reminder" --prompt "It's Thursday morning. Time to check inventory and place the weekly orders for coffee beans, milk, and pastries. Shall I draft the usual order list in a Google Sheet?" --to YOUR_PERSONAL_CHAT_ID
        ```

2.  **Sunday Staff Schedule Drafting:**
    *   This job will run every Sunday at 11:00 AM to kick off the scheduling process for the upcoming week.
        ```bash
        openclaw cron add --schedule "0 11 * * 0" --name "schedule-draft-reminder" --prompt "It's Sunday morning. The new week's schedule needs to be created. Can you provide the staff availability notes so I can generate a draft schedule?" --to YOUR_PERSONAL_CHAT_ID
        ```
    **Verify it worked:**
    ```
    $ openclaw cron list
    ┌─────────────────────────┬─────────────────────┬───────────┐
    │ Name                    │ Schedule            │ Next Run  │
    ├─────────────────────────┼─────────────────────┼───────────┤
    │ weekly-order-reminder   │ 0 10 * * 4          │ ...       │
    │ schedule-draft-reminder │ 0 11 * * 0          │ ...       │
    └─────────────────────────┴─────────────────────┴───────────┘
    ```

---

## 07 | ✨ INJECT YOUR SOUL

Now it's time to teach your agent about you and your business.

1.  **Start the Agent:**
    *   In your terminal, run:
        ```bash
        openclaw start
        ```
    *   You should see log output, and your Telegram bot will come online.

2.  **Send the Initialization Prompts:**
    *   Open Telegram and find your bot.
    *   Open the file `prompts_to_send.md`.
    *   Copy and paste the content of each prompt, one by one, into the chat with your bot. Wait for it to confirm understanding ("✅ Acknowledged.") before sending the next one. This is how you give your agent its core identity and instructions.

---

## 08 | 🔒 SECURITY HARDENING

With the agent running, let's lock it down.

1.  **Set API Spending Limits:**
    *   Log in to your Anthropic account dashboard.
    *   Go to `Billing` settings and set a hard monthly spending limit (e.g., $25). This prevents any runaway automations from causing surprise bills.

2.  **Review macOS Permissions:**
    *   The first time your agent tries to use a skill that needs system access (like screen reading or accessibility), macOS will pop up a permissions dialog.
    *   Go to `System Settings > Privacy & Security` and carefully review which permissions you grant to `Terminal` or `OpenClaw`. Be conservative.

3.  **Use Strong, Unique Passwords:**
    *   Ensure the `openclaw` macOS user account has a strong, unique password, as does the dedicated Google Account you created.

---

## 09 | 🛡️ SECURITY AUDIT CHECKLIST

Run this final check before using your agent for real work.

> ✅ **ACTION:** Send a message to your agent with the content of the "Security Audit" prompt from `prompts_to_send.md`. It will guide you through the final verification steps. The most important command is:

```bash
openclaw security audit --deep
```

This command will check for common security misconfigurations. Address any warnings it reports.

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

*   **"My agent doesn't respond."**
    *   Check the terminal window where `openclaw start` is running. Look for any error messages.
    *   Ensure your Mac Mini has not gone to sleep. Go to `System Settings > Energy Saver` and set "Prevent automatic sleeping when the display is off" to ON.
*   **"I can't see the agent's browser."**
    *   If you run the Mac Mini "headless" (without a monitor), macOS can have trouble with GUI-based automation. It is highly recommended to use an **HDMI dummy plug** (around $10 online) to trick macOS into thinking a display is always connected.

Your agent is now ready. Start by asking it simple things like "What's on my calendar today?" or "Summarize this article: [link]".

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `http://localhost:3000` (run `openclaw ui` to start) |
| **Gateway Port** | `8080` |
| **Model Provider** | Anthropic |
| **Documentation** | https://docs.openclaw.ai |