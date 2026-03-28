# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Jamie |
| **MISSION** | Automate Gmail Triage & Management |
| **DATE** | 2026-07-16 |
| **DEPLOYMENT** | Existing Mac |
| **CHANNEL** | Telegram (Assumed) |
| **MODEL** | Anthropic Claude Sonnet 4.6 (Assumed) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---
**This guide configures your OpenClaw agent to automatically triage your Gmail inbox — built to handle your personal and work emails without you lifting a finger.**

> ⚠️ **IMPORTANT:** Your interview did not specify your hardware or preferred messaging app. This guide assumes you are installing on your existing Mac and using Telegram. If this is incorrect, please stop and request a new guide for your specific setup.

## 🎯 Key Moments — What You Will Accomplish
*   You will have a running OpenClaw instance on your Mac, connected to you via Telegram.
*   You will install the necessary skills to securely connect and manage your Gmail account.
*   You will deploy a fully automated routine to check, summarize, and label your emails daily.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

Jamie, before you begin, make sure you have the following ready. This will make the setup process smooth and fast.

*   **[ ] Hardware & OS:** An Apple Silicon Mac (M1 or newer) running macOS Ventura or later.
*   **[ ] Software:** [Homebrew](https://brew.sh/) installed. We'll use it to install other tools.
*   **[ ] Telegram Account:** The Telegram app installed on your phone or computer.
*   **[ ] Anthropic API Key:** A valid API key from [Anthropic](https://console.anthropic.com/dashboard).
*   **[ ] Google Account:** The login for the Gmail account you want to automate.

---

## 01 | 💻 PLATFORM SETUP

These steps prepare your Mac to run OpenClaw reliably.

> 💡 **TIP:** Why this matters: OpenClaw runs on Node.js. Using `nvm` (Node Version Manager) prevents conflicts with other software on your Mac and makes upgrades simple.

1.  **Install NVM and Node.js:** Open the Terminal app and run these commands one by one.

    ```bash
    brew install nvm
    nvm install 24
    nvm use 24
    ```

    **Verify it worked:**
    ```
    $ node -v
    v24.x.x
    ```

2.  **Install Xcode Command Line Tools:** This is required for some skills to compile correctly.

    ```bash
    xcode-select --install
    ```
    A system dialog will pop up. Click "Install" and agree to the terms.

---

## 02 | 🚀 INSTALL OPENCLAW

Now, you will install the OpenClaw command-line interface (CLI) and initialize your agent's home directory.

1.  **Install the CLI:**
    ```bash
    npm install -g openclaw-cli
    ```

2.  **Initialize OpenClaw:** This creates the `.openclaw` directory in your home folder.
    ```bash
    openclaw init
    ```

    **Verify it worked:**
    ```
    $ openclaw status
    OpenClaw Status
    - Gateway: Inactive
    - Version: x.y.z
    - Config: /Users/jamie/.openclaw/config.yaml
    ```

---

## 03 | 💬 CONNECT YOUR CHANNEL

This step connects OpenClaw to Telegram so you can chat with it. This process has several steps, so they are broken out into a separate reference document.

> ✅ **ACTION:** Follow the detailed steps in the reference guide below to create your Telegram bot and connect it to OpenClaw.

**Reference Guide:** `reference_documents/telegram_bot_setup.md`

Once you complete that guide, your `config.yaml` file will be updated and you can start the gateway.

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

You need to give OpenClaw your Anthropic API key so it can think.

1.  **Set your API Key:** Replace `YOUR_ANTHROPIC_API_KEY` with your actual key.

    ```bash
    openclaw config set provider.anthropic.apiKey YOUR_ANTHROPIC_API_KEY
    ```

2.  **Set the Default Model:**
    ```bash
    openclaw config set model claude-sonnet-4-6
    ```

    **Verify it worked:**
    ```
    $ openclaw config get model
    claude-sonnet-4-6
    ```

---

## 05 | 🛠️ INSTALL SKILLS

Skills are the tools your agent uses. We will install the minimum required for security and email management.

> 🔒 **Data Handling Note:** The `gog` skill will request access to your Google account via OAuth. This is a secure, standard method that grants access without sharing your password. You can revoke this access at any time from your Google Account settings. Only grant the permissions it asks for (Gmail, specifically).

1.  **Install Skill Vetter (MANDATORY):** This skill vets other skills for security issues. Always install it first.

    ```bash
    clawhub install skill-vetter
    ```

2.  **Install Core Skills:** Now install the skills for Gmail and summarization.

    ```bash
    clawhub install gog
    clawhub install summarize
    ```

    **Verify it worked:**
    ```

    $ clawhub list
    Installed skills:
    - skill-vetter
    - gog
    - summarize
    ```

---

## 06 | ⚙️ CONFIGURE AUTOMATIONS

Here, we'll create the core automation: a scheduled task for your agent to check your email.

> 💡 **TIP:** Why this matters: This single command replaces the manual morning email check you want to eliminate. It runs automatically, so you don't have to think about it.

1.  **Add the Cron Job:** This command tells your agent to check your email at 8:00 AM every weekday. You will need your Telegram Chat ID from the `telegram_bot_setup.md` guide.

    ```bash
    openclaw cron add --name "daily-email-triage" --schedule "0 8 * * 1-5" --prompt "Review my Gmail inbox for any unread emails since yesterday. Summarize them, label them based on content (e.g., 'Invoice', 'Meeting', 'Spam'), and notify me of anything urgent. Do not reply to anything without my approval." --to YOUR_TELEGRAM_CHAT_ID
    ```

    **Verify it worked:**
    ```
    $ openclaw cron list
    - daily-email-triage: 0 8 * * 1-5
    ```

---

## 07 | ✨ INJECT YOUR SOUL

Your agent is set up. Now, you need to give it its purpose.

1.  **Start the OpenClaw Gateway:**
    ```bash
    openclaw start
    ```
2.  **Send the Prompts:** Open Telegram and start a chat with the bot you created. Copy and paste each prompt from the `prompts_to_send.md` file, one by one. Wait for the agent to confirm each one before sending the next.

---

## 08 | 🛡️ SECURITY HARDENING

Because OpenClaw is running on your daily-use Mac, these steps are critical.

1.  **Enable FileVault:** FileVault encrypts your Mac's hard drive. If your Mac is lost or stolen, your data (including your agent's keys and memory) remains secure.
    *   Go to **System Settings > Privacy & Security > FileVault**.
    *   Click **Turn On...** and follow the prompts.
    
2.  **Use a Standard User Account (Recommended):** For better security, create a new, non-administrator macOS account just for running OpenClaw. This limits its ability to change system-wide settings.

3.  **Review App Permissions:** After connecting your Google Account, go to **System Settings > Privacy & Security** and review which apps have permissions for "Full Disk Access" and "Files and Folders." Be restrictive.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

Before you rely on the agent, run this final check.

1.  **Run the Built-in Audit:** In your terminal, run:
    ```bash
    openclaw security audit --deep
    ```
    This will check for common security misconfigurations. Address any warnings it raises.

2.  **Verify Cron Job Safety:** Run `openclaw cron list` and confirm the email triage job is there and the schedule is correct. The prompt should explicitly state "Do not reply."

3.  **Check for Exposed Keys:** Run `cat ~/.openclaw/config.yaml`. Make sure your API keys are shown as `[env:OPENCLAW_PROVIDER_ANTHROPIC_APIKEY]` and not in plain text.

---

## 10 | 🆘 TROUBLESHOOTING & NEXT STEPS

*   **"Agent is not responding":** Make sure your Mac is not asleep. An "always-on" agent requires the Mac to be awake. You can adjust this in **System Settings > Energy Saver**.
*   **"Error: command not found: openclaw":** Your shell path might be misconfigured. Close and reopen the Terminal, or run `source ~/.zshrc`.
*   **Next Steps:** Once you're comfortable, you can explore adding more skills or more complex automations. Start by asking your agent, "What skills do you have?"

## QUICK REFERENCE
| Item | Details |
|---|---|
| **Web UI URL** | http://localhost:7070 |
| **Gateway Port** | 7070 |
| **Model Provider** | Anthropic |
| **Documentation** | https://docs.openclaw.ai |