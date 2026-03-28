# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Valued User |
| **MISSION** | Automate Business Email Triage |
| **DATE** | 2026-07-16 |
| **DEPLOYMENT** | Existing Mac (Assumed) |
| **CHANNEL**| Telegram (Assumed) |
| **MODEL** | Anthropic Claude Sonnet 4.6 (Recommended) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

This guide configures your OpenClaw agent to automatically sort and draft responses for your business Gmail account — built for your workflow on the Mac you already use.

## 🎯 Key Moments — What You Will Accomplish
*   **A Running Agent:** You will install and run the OpenClaw engine directly on your Mac.
*   **Automated Inbox:** You will connect your business Gmail and set up a recurring task to triage new emails every 15 minutes, summarizing key messages and drafting replies for your approval.
*   **Secure Connection:** You will establish a secure connection to your agent through Telegram, allowing you to manage your inbox from anywhere.

> ⚠️ **IMPORTANT ASSUMPTIONS:** Your interview did not specify your computer or preferred messaging app. This guide assumes you are setting up on an **existing Mac** and will use **Telegram** for messaging. If this is incorrect, please request a new guide for your specific platform (e.g., Windows, Docker, VPS) or channel (e.g., WhatsApp, iMessage).

## 00 | ✅ PRE-FLIGHT CHECKLIST
Before you begin, ensure you have the following ready.

*   **[ ] Hardware:** An Apple Silicon Mac (M1 or newer) running macOS Ventura or later.
*   **[ ] Software:** The Xcode Command Line Tools. Open `Terminal.app` and run `xcode-select --install`.
*   **[ ] Accounts:**
    *   A Google account (for Gmail).
    *   A Telegram account.
*   **[ ] API Keys:**
    *   An **Anthropic API Key** for the AI model. Get one from the [Anthropic Console](https://console.anthropic.com/).

## 01 | 💻 PLATFORM SETUP
These steps prepare your Mac for a secure OpenClaw installation.

> 💡 **TIP:** Why this matters: Isolating software installations with a version manager like `nvm` prevents conflicts with other applications on your Mac and makes upgrades safer.

1.  **Install Homebrew:** Homebrew is a package manager that simplifies installing software on macOS.
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
    **Verify it worked:**
    ```
    $ brew --version
    Homebrew 4.3.x
    ```

2.  **Install NVM (Node Version Manager):** This tool manages your Node.js versions.
    ```bash
    brew install nvm
    ```

3.  **Configure NVM:** Add NVM to your shell profile so it loads automatically.
    ```bash
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
    echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
    source ~/.zshrc
    ```
    **Verify it worked:**
    ```
    $ command -v nvm
    nvm
    ```

4.  **Install Node.js:** Install and use the recommended version of Node.js.
    ```bash
    nvm install 24
    nvm use 24
    ```
    **Verify it worked:**
    ```
    $ node -v
    v24.x.x
    ```

## 02 | 🚀 INSTALL OPENCLAW
With your platform ready, you can now install the OpenClaw engine.

1.  **Install the OpenClaw CLI:**
    ```bash
    npm install -g openclaw-cli
    ```
    **Verify it worked:**
    ```
    $ openclaw --version
    openclaw-cli/2.x.x
    ```

2.  **Initialize Your OpenClaw Instance:** This command creates the necessary configuration files in a new `openclaw` directory.
    ```bash
    mkdir ~/openclaw-agent
    cd ~/openclaw-agent
    openclaw init
    ```
    **Verify it worked:**
    The command will guide you through a setup wizard. Select the defaults for now; you will configure them in the next steps. It should create a `config.yaml` file and other directories.

## 03 | 💬 CONNECT YOUR CHANNEL
You will connect OpenClaw to Telegram to send and receive messages.

> ✅ **ACTION:** The process of creating a Telegram bot involves several steps with a bot called "BotFather". For clarity, these instructions are in a separate reference document.
>
> **Please open and follow the detailed steps here:** [**Detailed Telegram Bot Setup Guide**](./reference_documents/telegram_bot_setup.md)

Once you have your **Bot Token** and **Chat ID** from the guide, add them to your `config.yaml` file.

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER
Connect OpenClaw to Anthropic's Claude model.

1.  **Set your API Key:** OpenClaw uses environment variables for security. Add your Anthropic API key to your shell profile.
    ```bash
    echo "export ANTHROPIC_API_KEY='YOUR_ANTHROPIC_API_KEY'" >> ~/.zshrc
    source ~/.zshrc
    ```
    > ⚠️ **WARNING:** Replace `YOUR_ANTHROPIC_API_KEY` with your actual key. Do not share this key or commit it to public code repositories.

2.  **Configure the Model in OpenClaw:** In your `~/openclaw-agent/config.yaml` file, set the provider and model:
    ```yaml
    provider: "anthropic"
    model: "claude-3-5-sonnet-20240620"
    ```

## 05 | 🛠️ INSTALL SKILLS
Skills give your agent the ability to interact with other services. For your goal, you need the Google Workspace skill.

> 🔒 **Data Handling Note:** By installing the `gog` skill, you are granting your OpenClaw agent permission to access your Google account data, including reading emails and files. Use a dedicated business account and share only the necessary information with it.

1.  **Install the Security Vetter Skill (Mandatory First Step):**
    ```bash
    clawhub install skill-vetter
    ```
    **Verify it worked:**
    ```
    $ clawhub install skill-vetter
    ✔ skill-vetter was installed successfully.
    ```

2.  **Install Core Skills:**
    ```bash
    clawhub install gog
    clawhub install summarize
    clawhub install clawsec-suite
    ```
    *   **gog:** The essential skill for full Google Workspace (Gmail, Drive, Calendar) integration.
    *   **summarize:** To condense long email threads into actionable summaries.
    *   **clawsec-suite:** For ongoing security monitoring of your agent's activity.

## 06 | ⚙️ CONFIGURE AUTOMATIONS
This step creates the recurring task to check your Gmail.

> 💡 **TIP:** Why this matters: This automation replaces the manual morning schedule check and continuous inbox monitoring you described. It runs every 15 minutes to ensure you're always up to date.

*   **Add the Cron Job:** This command tells OpenClaw to run the `/email_triage` command (which you will define in the next step) every 15 minutes and send the results to your Telegram chat.
    ```bash
    openclaw cron add --schedule "*/15 * * * *" --action "/email_triage" --to your_telegram_chat_id
    ```
    > ✅ **ACTION:** Replace `your_telegram_chat_id` with the Chat ID you obtained in Section 03.

## 07 | 👻 INJECT YOUR SOUL
Your agent is installed. Now, you must give it its purpose and rules.

1.  **Start OpenClaw:** In your terminal, navigate to your agent directory and start the engine.
    ```bash
    cd ~/openclaw-agent
    openclaw start
    ```
    ![OpenClaw Starting Up](templates/images/image4.png)

2.  **Send Initialization Prompts:** Open your Telegram app and find the bot you created. You will now send it a series of prompts to configure its personality and instructions.

    **Open this file and paste each prompt into Telegram, one by one:** [**Initialization Prompts to Send**](./prompts_to_send.md)

## 08 | 🛡️ SECURITY HARDENING
An agent with access to your email must be secured properly.

1.  **Enable FileVault:** FileVault encrypts the entire disk on your Mac. If the computer is lost or stolen, your data (including API keys and agent memory) remains secure.
    *   Go to **System Settings > Privacy & Security > FileVault**.
    *   Click **Turn On...** and follow the instructions.
    
2.  **Review Skill Permissions:** Check which permissions your installed skills require.
    ```bash
    openclaw security audit --permissions
    ```
    Ensure no skill has more access than it needs. The `gog` skill will require network access and token storage, which is expected.

## 09 | 🔍 SECURITY AUDIT CHECKLIST
Before using your agent for real work, perform this final check. Send this message to your agent in Telegram: `/run_security_audit`. The final prompt in `prompts_to_send.md` configures this command.

This will verify:
- [ ] Authentication is enabled.
- [ ] Installed skills are the ones you expect.
- [ ] The cron job is scheduled correctly.
- [ ] No secrets are stored in plain text.
- [ ] FileVault is enabled on your Mac.

Do not proceed if any check fails.

## 10 | 🆘 TROUBLESHOOTING & NEXT STEPS
*   **Agent doesn't respond:** If your Mac goes to sleep, OpenClaw will stop responding. Go to **System Settings > Energy Saver** and adjust sleep settings. For laptops, this setup only works when the lid is open and the machine is awake.
*   **`gog` skill authentication errors:** Google's authentication can sometimes expire. You may need to re-authenticate by running `openclaw auth gog`.
*   **See agent logs:** To see what your agent is doing, run: `openclaw logs --follow`.

## QUICK REFERENCE
| Item | Details |
|---|---|
| **Web UI URL** | http://localhost:7070 |
| **Gateway Port** | 7070 |
| **Model Provider** | Anthropic |
| **Configuration File** | `~/openclaw-agent/config.yaml` |
| **Documentation** | https://docs.openclaw.ai |