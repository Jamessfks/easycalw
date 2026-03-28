# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Jamie |
| **MISSION** | To manage a personal work Gmail account efficiently. |
| **DATE** | 2026-07-16 |
| **DEPLOYMENT** | Existing Mac |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude Sonnet 4.6 |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

This guide configures your OpenClaw agent to manage your Gmail from any device — built for a focused, no-nonsense workflow.

> ⚠️ **IMPORTANT:** Your interview did not specify hardware or a preferred messaging app. This guide assumes you are installing on your **existing Mac** and connecting via **Telegram**. If this is incorrect, stop here and request a new guide.

## 🎯 Key Moments — What You Will Accomplish

*   **A Secure Agent:** A running OpenClaw instance, installed securely on your Mac.
*   **A Direct Line:** Your agent connected to Telegram, ready for your commands 24/7.
*   **An Email Assistant:** The core skill installed to let your agent read, summarize, and draft emails on your behalf.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following. This will take approximately 15 minutes to gather.

*   **[ ] Hardware & OS:** An Apple Silicon (M1 or newer) Mac running macOS Ventura or later.
*   **[ ] System Tools:** Homebrew installed. If you don't have it, open Terminal and run:
    `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
*   **[ ] Telegram Account:** An active Telegram account on your phone or desktop.
*   **[ ] Anthropic Account:** An account at [claude.ai](https://claude.ai) to access the Sonnet 4.6 model.
*   **[ ] Anthropic API Key:**
    > ✅ **ACTION:** Go to your Anthropic Account Settings -> API Keys and create a new key. Copy it somewhere safe. You will need it in Section 04.
*   **[ ] Google Account:** The personal work Gmail account you want the agent to manage.

---

## 01 | 💻 PLATFORM SETUP

Jamie, these steps prepare your Mac's environment for OpenClaw. We will use Homebrew to install Node.js, the runtime OpenClaw is built on.

1.  **Install Node.js Version Manager (nvm):**
    ```bash
    brew install nvm
    ```

2.  **Configure your shell for nvm.** Add the following lines to your shell profile (`~/.zshrc`, `~/.bash_profile`, etc.) and then restart your Terminal.
    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
    [ -s "/opt/homebrew/opt/nvm/bash_completion" ] && \. "/opt/homebrew/opt/nvm/bash_completion"
    ```

3.  **Install and use Node.js v22:**
    ```bash
    nvm install 22
    nvm use 22
    ```
    **Verify it worked:**
    ```
    $ node -v
    v22.16.0
    ```

---

## 02 | ⚙️ INSTALL OPENCLAW

With the platform ready, you can now install the OpenClaw Command Line Interface (CLI).

1.  **Install the OpenClaw CLI globally:**
    ```bash
    npm install -g openclaw-cli
    ```

2.  **Initialize your OpenClaw instance:**
    ```bash
    openclaw init my-agent
    cd my-agent
    ```
    This creates a new directory named `my-agent` with the necessary configuration files.

    **Verify it worked:**
    ```
    $ ls
    AGENTS.md   config.yaml   memory.json   sessions.json   skills/
    ```

---

## 03 | 💬 CONNECT YOUR CHANNEL

This step connects your agent to Telegram so you can communicate with it.

> 💡 **TIP:** Why this matters: Creating a Telegram bot keeps your personal account separate from the agent's operations, providing a clean and secure channel for giving commands.

1.  **Create a Telegram Bot and get your API Token.** This process involves talking to a special bot called "BotFather". For a step-by-step walkthrough, follow this reference guide:
    *   **Reference Guide: `reference_documents/telegram_bot_setup.md`**

2.  **Configure OpenClaw with your token.** Replace `YOUR_TELEGRAM_BOT_TOKEN` with the token you just received.
    ```bash
    openclaw config set channels.telegram.token YOUR_TELEGRAM_BOT_TOKEN
    ```

3.  **Start the OpenClaw gateway:**
    ```bash
    openclaw start
    ```
    Your agent is now live and listening for messages on Telegram.

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

Now, connect OpenClaw to Anthropic's AI model.

1.  **Set your Anthropic API key.** Use the key you created during the pre-flight check.
    ```bash
    openclaw config set providers.anthropic.apiKey YOUR_ANTHROPIC_API_KEY
    ```

2.  **Set the default model:**
    ```bash
    openclaw config set model claude-sonnet-4-6
    ```

    **Verify it worked:**
    ```
    $ openclaw config get model
    claude-sonnet-4-6
    ```
    You may need to restart the agent (`Ctrl+C` then `openclaw start`) for the changes to take effect.

---

## 05 | 🛠️ INSTALL SKILLS

Skills give your agent abilities. These are the essential skills for security and Gmail management. Install them in this order.

> 🔒 **Data Handling Note:** The `gog` skill requires OAuth access to your Google Account. OpenClaw stores this token securely on your local machine, but be aware you are granting an application access to your email. Review its permissions carefully during the first-use authentication flow.

1.  **Install the Security Vetting Skill (MANDATORY):** This skill automatically reviews other skills before they are installed.
    ```bash
    clawhub install skill-vetter
    ```

2.  **Install the Security Monitoring Suite:** This provides advisory monitoring during operation.
    ```bash
    clawhub install clawsec-suite
    ```

3.  **Install the Google Workspace Skill:** This provides the core functionality for managing Gmail, Calendar, and Drive.
    ```bash
    clawhub install gog
    ```

    **Verify it worked:**
    ```
    $ clawhub list
    Installed skills:
    - skill-vetter
    - clawsec-suite
    - gog
    ```

---

## 07 | 👤 INJECT YOUR SOUL

Your agent is running, but it doesn't know its purpose yet. You will now provide its core identity and instructions.

Open your Telegram chat with your new bot and send the prompts from the `prompts_to_send.md` file, one by one.

> ✅ **ACTION:** Copy and paste each prompt from **`prompts_to_send.md`** into your Telegram chat. Wait for the agent to confirm understanding ("Acknowledged" or similar) before sending the next one.

---

## 08 | 🛡️ SECURITY HARDENING

Because OpenClaw is running on your primary Mac, securing the machine is critical.

1.  **Enable Full-Disk Encryption (FileVault):** This encrypts your Mac's hard drive, protecting your agent's data and API keys if the machine is ever lost or stolen.
    *   Go to **System Settings > Privacy & Security > FileVault**.
    *   Click **Turn On...** and follow the prompts.
    *   **Do not lose your recovery key.** Store it in a password manager or a secure physical location.

2.  **Review App Permissions:**
    *   Go to **System Settings > Privacy & Security**.
    *   Periodically review which apps have access to "Files and Folders", "Full Disk Access", and "Automation". Ensure only trusted applications (like Terminal) have the permissions they need.

---

## 09 | 🔎 SECURITY AUDIT CHECKLIST

Before using your agent for real work, run this final verification.

1.  **Run the built-in security audit:**
    ```bash
    openclaw security audit --deep
    ```
    This command checks for common misconfigurations like exposed gateway ports or insecure permissions. Address any warnings it raises.

2.  **Confirm your installed skills:**
    ```bash
    clawhub list
    ```
    Ensure the list only contains `skill-vetter`, `clawsec-suite`, and `gog`.

3.  **Review configuration for exposed secrets:**
    ```bash
    openclaw config list
    ```
    Confirm that no API keys are visible in plain text in the output. They should be stored securely.

Do not proceed until all checks pass.

---

## 10 | 💡 TROUBLESHOOTING & NEXT STEPS

*   **Agent is unresponsive?** Your Mac might be asleep. OpenClaw on an "existing Mac" setup only works when the computer is awake. To prevent sleep, go to **System Settings > Displays > Advanced...** and enable "Prevent automatic sleeping on power adapter when the display is off".
*   **Next Steps:** Once you are comfortable giving your agent manual commands, you can explore automations. For example, you can set up a cron job to get a daily summary of your inbox.
    *   `openclaw cron add "0 8 * * *" "Using the gog skill, summarize my unread emails from the last 24 hours and send me the summary." --to <your_telegram_chat_id>`

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | http://localhost:8840 |
| **Gateway Port** | 8840 (local access only) |
| **Model Provider** | Anthropic |
| **Primary Skill** | `gog` (Google Workspace) |
| **Documentation** | https://docs.openclaw.ai |