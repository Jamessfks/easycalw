# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Business.**

| | |
|---|---|
| **PREPARED FOR** | Owner, Scouts Coffee |
| **MISSION** | Automate staff scheduling and supplier orders. |
| **DATE** | 2026-07-23 |
| **DEPLOYMENT** | Dedicated Mac Mini |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude Sonnet 4.6 |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

This guide configures your OpenClaw agent to automate staff scheduling and supplier ordering for Scouts Coffee — built around your cafe's workflow and the tools you already use.

## 🎯 Key Moments — What You Will Accomplish

*   **A 24/7 Operations Assistant:** A running OpenClaw instance on your dedicated Mac Mini, securely connected to you via Telegram.
*   **Tailored Cafe Automations:** Your agent will be equipped to draft weekly staff schedules and prepare daily supplier purchase orders for your approval.
*   **Business-Grade Guardrails:** You will establish clear rules for handling sensitive employee data and supplier information, ensuring the agent acts as a trusted assistant.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready. This will make the setup process smooth and quick.

- [ ] **Dedicated Mac Mini:** An Apple Silicon (M1 or newer) Mac Mini that will be always on.
- [ ] **Dedicated macOS User Account:** You have created a new, non-admin user account on the Mac Mini exclusively for OpenClaw. **Do not run this on your personal account.**
- [ ] **Anthropic API Key:** A valid API key from [Anthropic](https://console.anthropic.com/dashboard). We recommend setting a usage limit (e.g., $30/month) in your Anthropic billing settings to prevent unexpected costs.
- [ ] **Telegram Account:** Your personal Telegram account, accessible on your phone or desktop.

---

## 01 | ⚙️ PLATFORM SETUP

These steps prepare your Mac Mini to be a reliable, 24/7 host for your OpenClaw agent.

> 💡 **TIP:** Since you're running this on a dedicated machine that might not have a monitor connected ("headless"), we recommend an **HDMI Dummy Plug**. It's a small, $10 device that tricks macOS into thinking a display is attached, which prevents issues with screen-related permissions later on.

1.  **Install Homebrew:** If you don't have it, open Terminal and install the standard macOS package manager.
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
2.  **Install `nvm` and Node.js:** We'll use `nvm` (Node Version Manager) to install and manage Node.js. This is more flexible than a direct install.
    ```bash
    brew install nvm
    ```
    Now, add `nvm` to your shell profile.
    ```bash
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
    echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
    echo '[ -s "/opt/homebrew/opt/nvm/bash_completion" ] && \. "/opt/homebrew/opt/nvm/bash_completion"' >> ~/.zshrc
    ```
    Close and reopen your Terminal, then install the recommended Node.js version.
    ```bash
    nvm install 24
    ```
    **Verify it worked:**
    ```
    $ node -v
    v24.x.x
    ```

---

## 02 | 🚀 INSTALL OPENCLAW

Now you'll install the OpenClaw Command Line Interface (CLI), which is your primary tool for managing the agent.

1.  **Install OpenClaw:**
    ```bash
    npm install -g openclaw-cli
    ```
2.  **Initialize your OpenClaw instance:** This creates the necessary configuration files in your home directory (`~/.openclaw`).
    ```bash
    openclaw init
    ```
    **Verify it worked:** You should see a success message. Now, start the agent for the first time.
    ```bash
    openclaw start
    ```
    You will see logs appear in your terminal. This is your agent's "heartbeat." You can press `Ctrl+C` to stop it for now. We'll set it up to run in the background later.

---

## 03 | 💬 CONNECT YOUR CHANNEL

This step connects your agent to Telegram so you can chat with it. The process of creating a Telegram bot involves a few steps with their "BotFather" bot.

> ✅ **ACTION:** We've moved the detailed steps to a separate reference document to keep this guide clean.
>
> **Please follow the instructions here:** [**Detailed Telegram Bot Setup Guide**](./reference_documents/telegram_bot_setup.md)
>
> Once you have your Telegram Bot Token from that guide, proceed to the next step.

1.  **Set your Telegram Bot Token in OpenClaw:**
    ```bash
    openclaw config set channels.telegram.botToken YOUR_TELEGRAM_BOT_TOKEN
    ```
2.  **Enable the Telegram channel:**
    ```bash
    openclaw config set channels.telegram.enabled true
    ```
    **Verify it worked:**
    ```
    $ openclaw config get channels.telegram.enabled
    true
    ```

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

You need to give your agent a "brain." We're configuring it to use Anthropic's Claude model, which offers a great balance of intelligence and cost.

1.  **Set your Anthropic API Key:**
    ```bash
    openclaw config set providers.anthropic.apiKey YOUR_ANTHROPIC_API_KEY
    ```
2.  **Set Claude Sonnet 4.6 as the default model:**
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

Skills are the tools your agent uses to perform actions. We'll install a starter pack tailored for your cafe's needs.

> 💡 **TIP:** We always install `skill-vetter` first. It's a security tool that scans other skills before you install them to ensure they are safe.

Run these commands one by one:

```bash
# Security Tools (Install these first!)
clawhub install skill-vetter
clawhub install clawsec-suite

# Core Productivity & Cafe Operations
clawhub install gog                     # For Google Calendar (scheduling) & Gmail (orders)
clawhub install agent-browser           # For automating web-based supplier portals
clawhub install tavily-web-search       # For AI-powered web searches (e.g., finding new suppliers)
clawhub install summarize               # For summarizing long emails or articles
clawhub install weather                 # For checking daily weather for patio seating, etc.
```
**Verify it worked:**
```
$ clawhub list
(You should see a list of the 7 skills you just installed)
```

---

## 06 | 🔁 CONFIGURE AUTOMATIONS

Here, we'll set up two core routines for your business: drafting schedules and preparing supplier orders.

> 💡 **Why this matters:** These automations directly address the key tasks you wanted to offload. They run on a schedule, check for necessary information, and then *notify you for approval* rather than acting on their own. You always have the final say.

1.  **Draft Weekly Staff Schedule:** This cron job will run every Thursday at 10 AM, look at the next week's calendar, and prepare a draft schedule.
    ```bash
    openclaw cron add --name "Draft Weekly Schedule" --schedule "0 10 * * 4" --prompt "Review next week's staff availability from the shared Google Calendar. Draft a shift schedule in a new Google Doc based on our standard staffing levels. Send me the link to the draft for approval." --to <your-chat-id>
    ```
2.  **Check Suppliers & Draft Orders:** This job runs every evening, checks for low-stock alerts (you'll teach it what to look for), and drafts order emails.
    ```bash
    openclaw cron add --name "Draft Supplier Orders" --schedule "0 20 * * *" --prompt "Check my 'Supplier Updates' Gmail label for any new low-stock alerts from our vendors (e.g., milk, coffee beans, paper goods). Draft a purchase order email for each. Do not send them. Show me the drafts for approval." --to <your-chat-id>
    ```
> ⚠️ **WARNING:** Replace `<your-chat-id>` with your actual Telegram Chat ID. You can find this by sending the `/chatid` command to your bot once it's running.

---

## 07 | ✨ INJECT YOUR SOUL

Your agent is set up. Now, it's time to give it its purpose and personality.

> ✅ **ACTION:** Start your agent by running `openclaw start` in your Terminal. Then, open your conversation with your new bot in Telegram.
>
> **Paste each prompt from this file, one by one:** [**Initialization Prompts**](./prompts_to_send.md)
>
> Wait for the agent to confirm understanding of each prompt before sending the next. This process loads its core instructions.

---

## 08 | 🔒 SECURITY HARDENING

A dedicated Mac Mini is a great start. These final steps ensure it's locked down.

1.  **Enable FileVault:** This encrypts the Mac Mini's entire hard drive. If the machine is ever stolen, your data (API keys, business info) is unreadable. Go to **System Settings > Privacy & Security > FileVault** and turn it on.
2.  **Enable Firewall:** Go to **System Settings > Network > Firewall** and turn it on. This blocks unauthorized incoming connections.
3.  **Review Skill Permissions:** Your agent will ask for permission the first time a skill needs to access something sensitive (like your calendar or files). Be mindful of what you approve. Only grant permissions that are necessary for a task.
4.  **Set Up Background Service (Optional but Recommended):** To ensure OpenClaw runs 24/7 and restarts automatically if it crashes or the Mac reboots, set it up to run with `pm2`.
    ```bash
    npm install pm2 -g
    pm2 start "openclaw start" --name openclaw-agent
    pm2 save
    pm2 startup
    ```
    Follow the command output from `pm2 startup` to complete the setup.

> 🍽️ **Food Safety & PII Note:** Your agent will handle potentially sensitive data like supplier invoices and employee schedules. The guardrails you'll set in the prompts file are critical. **Never instruct the agent to store unencrypted employee contact information or payment details in its memory files.** Treat the agent's access like you would a new manager's.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

Before you rely on the agent for real work, perform this final audit.

1.  **Run the deep scan:**
    ```bash
    openclaw security audit --deep
    ```
    This command checks for common security misconfigurations.
2.  **Confirm no secrets are exposed:**
    ```bash
    openclaw config list
    ```
    Confirm that your API keys and tokens show as `[hidden]`.
3.  **Review scheduled jobs:**
    ```bash
    openclaw cron list
    ```
    Verify that the two cron jobs are correct and that neither is set to act fully autonomously without your approval.

---

## 10 | 🛠️ TROUBLESHOOTING & NEXT STEPS

- **Agent isn't responding:** Ensure the `openclaw start` (or `pm2`) process is running in the Terminal. Check its logs for any error messages.
- **"Permission Denied" errors:** Your agent needs explicit permission for many macOS features. Go to **System Settings > Privacy & Security** and ensure Terminal (or your chosen shell) has **Full Disk Access** and any other permissions it has requested.

Your agent is now ready. Start by giving it small, specific tasks related to your business to build its understanding of your workflows.

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | http://localhost:7100 (accessible on the Mac Mini) |
| **Gateway Port** | 7100 |
| **Model Provider** | Anthropic (claude-sonnet-4-6) |
| **Documentation** | https://docs.openclaw.ai |