# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Marco |
| **MISSION** | Autonomous developer assistant for monitoring projects and automating daily briefings. |
| **DATE** | 2026-07-23 |
| **DEPLOYMENT** | Dedicated Mac Mini |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude 3.5 Sonnet |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

Marco, this guide configures your OpenClaw agent to act as an autonomous developer assistant — summarizing your daily tasks, monitoring your GitHub repositories, and keeping you updated via Telegram.

## 🎯 Key Moments — What You Will Accomplish

*   **Launch a 24/7 Agent:** A persistent, always-on instance of OpenClaw running on your dedicated Mac Mini, securely connected to your Telegram account.
*   **Automate Your Workflow:** Your agent will be equipped with automations to deliver a morning briefing with your daily tasks and monitor your GitHub projects for new pull requests.
*   **Deploy with Confidence:** You will install a suite of developer-centric skills and implement security best practices for a hardened, production-ready agent.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready. This will make the setup process smooth and fast.

*   **[ ] Hardware Ready:** Your dedicated Mac Mini is powered on and connected to the internet. For headless operation, an HDMI dummy plug is highly recommended to ensure full GPU acceleration and prevent GUI-related issues.
*   **[ ] Dedicated macOS Account:** You have created a new, non-administrator user account on the Mac Mini exclusively for OpenClaw. **Do not run the agent on your personal or admin account.**
*   **[ ] FileVault Enabled:** Full-disk encryption is enabled on your Mac Mini. You can check this in `System Settings > Privacy & Security > FileVault`.
*   **[ ] Homebrew Installed:** The Homebrew package manager is installed. If not, run this command in your Terminal:
    `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
*   **[ ] API Keys & Tokens:**
    *   **Anthropic API Key:** For connecting to the Claude 3.5 Sonnet model.
    *   **Telegram Bot Token:** From Telegram's "BotFather".
    *   **GitHub Personal Access Token (PAT):** With `repo` and `read:org` scopes.

---

## 01 | 🖥️ PLATFORM SETUP

Marco, these steps prepare your Mac Mini's environment for a secure, isolated OpenClaw installation. We'll use `nvm` to manage Node.js versions, which is a best practice.

1.  **Install NVM (Node Version Manager):**
    ```bash
    brew install nvm
    ```
    **Verify it worked:**
    ```bash
    $ command -v nvm
    nvm
    ```

2.  **Configure NVM:** Add the following lines to your `~/.zshrc` file.
    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$(brew --prefix nvm)/nvm.sh" ] && \. "$(brew --prefix nvm)/nvm.sh"
    [ -s "$(brew --prefix nvm)/etc/bash_completion.d/nvm" ] && \. "$(brew --prefix nvm)/etc/bash_completion.d/nvm"
    ```
    Now, source your profile to apply the changes: `source ~/.zshrc`.

3.  **Install Node.js:** We'll install the latest LTS version, which is recommended for OpenClaw.
    ```bash
    nvm install --lts
    ```
    **Verify it worked:**
    ```bash
    $ node -v
    v22.5.1 # or the latest LTS version
    ```

---

## 02 | 🚀 INSTALL OPENCLAW

With the environment ready, you can now install the OpenClaw engine.

1.  **Install the OpenClaw CLI globally:**
    ```bash
    npm install -g openclaw-cli
    ```
    **Verify it worked:**
    ```bash
    $ openclaw --version
    openclaw-cli v2.8.1 # or latest version
    ```

2.  **Initialize your OpenClaw instance:** This creates the necessary configuration files in `~/.openclaw`.
    ```bash
    openclaw init
    ```
    **Verify it worked:** The command will guide you through a short setup wizard. You will see a success message and a new `~/.openclaw` directory.

3.  **Start the OpenClaw gateway:**
    ```bash
    openclaw start
    ```
    **Verify it worked:** You will see log output indicating the gateway is running, typically on port 8080.
    ```
    [GATEWAY] OpenClaw Gateway is running at http://localhost:8080
    [GATEWAY] Authentication is enabled. UI token is <your-secure-token>
    ```
    Keep this terminal window open. You'll need it for the next steps.

---

## 03 | 💬 CONNECT YOUR CHANNEL

Your agent needs a way to communicate with you. We'll connect it to Telegram.

> 💡 **TIP:** The process of creating a Telegram bot involves several steps with a special bot called "BotFather". We've moved the detailed instructions to a separate reference document to keep this main guide clean.

> ✅ **ACTION:** Open and follow the instructions in **`reference_documents/telegram_bot_setup.md`**. Once you have your Bot Token and Chat ID, return here and run the configuration command.

1.  **Configure OpenClaw with your Telegram credentials:**
    ```bash
    openclaw config set channel.provider telegram
    openclaw config set channel.telegram.botToken 'YOUR_TELEGRAM_BOT_TOKEN'
    ```
    > ⚠️ **WARNING:** Replace `YOUR_TELEGRAM_BOT_TOKEN` with the actual token you received from BotFather.

2.  **Restart the gateway** to apply the channel settings:
    Press `CTRL+C` in the gateway terminal, then run `openclaw start` again.

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

Let's connect OpenClaw to Anthropic's Claude 3.5 Sonnet model.

1.  **Set the model provider and API key:**
    ```bash
    openclaw config set model.provider anthropic
    openclaw config set model.anthropic.apiKey 'YOUR_ANTHROPIC_API_KEY'
    openclaw config set model.anthropic.model 'claude-3-5-sonnet-20240620'
    ```
    **Verify it worked:**
    ```bash
    $ openclaw config get model
    {
      "provider": "anthropic",
      "anthropic": {
        "apiKey": "YOUR_ANTHROPIC_API_KEY",
        "model": "claude-3-5-sonnet-20240620"
      }
    }
    ```

2.  **Test the connection:** Send a "hello" message to your bot in Telegram. It should respond!

---

## 05 | 🛠️ INSTALL SKILLS

Now we install the tools your agent will use. We'll start with security skills, then add productivity and developer-focused ones.

> 👨‍💻 **DevOps Note:** For a solo developer, OpenClaw can act as your personal SRE. The automations we'll set up for PR monitoring are a starting point. Consider adding standing orders for dependency updates or running tests on new commits.

1.  **Install the mandatory security vetter:** This skill inspects other skills before they're installed.
    ```bash
    clawhub install skill-vetter
    ```

2.  **Install core and developer skills:**
    ```bash
    clawhub install clawsec-suite
    clawhub install gog
    clawhub install github
    clawhub install gh-issues
    clawhub install summarize
    clawhub install tavily-web-search
    ```

> 💡 **TIP:** While a dedicated skill for Linear does not currently exist in the main registry, you can often interact with such services using a generic browser automation skill. Consider installing `agent-browser` later to build custom workflows for it.

---

## 06 | ⚙️ CONFIGURE AUTOMATIONS

Let's create the two core automations you requested: a morning briefing and a PR monitor.

> 💡 **Why this matters:** These automations replace the manual checks you'd typically perform at the start of your day and throughout, freeing you up to focus on coding.

1.  **Add the Morning Briefing Cron Job:** This will run at 8 AM on weekdays.
    ```bash
    openclaw cron add "0 8 * * 1-5" "Provide my morning briefing. Summarize tasks from my primary Google Calendar for today and list all open GitHub PRs assigned to me across my repositories." --to "YOUR_TELEGRAM_CHAT_ID" --tag="morning-briefing"
    ```
    > ✅ **ACTION:** Replace `YOUR_TELEGRAM_CHAT_ID` with the ID you retrieved in Step 03.

2.  **Add the GitHub PR Monitor:** This runs every 15 minutes.
    ```bash
    openclaw cron add "*/15 * * * *" "Scan my connected GitHub repositories for any new or updated pull requests in the last 15 minutes. If found, provide a concise summary of each and send it to me." --to "YOUR_TELEGRAM_CHAT_ID" --tag="pr-monitor"
    ```

3.  **Verify the cron jobs were added:**
    ```bash
    $ openclaw cron list
    - id: 1, schedule: '0 8 * * 1-5', tag: 'morning-briefing', nextRun: ...
    - id: 2, schedule: '*/15 * * * *', tag: 'pr-monitor', nextRun: ...
    ```

---

## 07 | ✨ INJECT YOUR SOUL

Your agent is set up. Now it's time to give it its purpose, context, and rules.

> ✅ **ACTION:** Open the file `prompts_to_send.md`. Copy and paste each prompt into your Telegram chat with the agent, one at a time. Wait for the agent to confirm understanding of each prompt before sending the next. This process will initialize its core identity and operating instructions.

---

## 08 | 🛡️ SECURITY HARDENING

A 24/7 agent requires robust security. Since this is a dedicated machine, we can lock it down effectively.

1.  **Use Environment Variables for Secrets:** Instead of storing API keys in the config file, move them to your shell profile (`~/.zshrc`).
    ```bash
    # Add these to ~/.zshrc
    export OPENCLAW_MODEL_ANTHROPIC_APIKEY='YOUR_ANTHROPIC_API_KEY'
    export OPENCLAW_CHANNEL_TELEGRAM_BOTTOKEN='YOUR_TELEGRAM_BOT_TOKEN'
    export GITHUB_TOKEN='YOUR_GITHUB_PAT'
    ```
    Then, remove them from the config: `openclaw config unset model.anthropic.apiKey` and `openclaw config unset channel.telegram.botToken`. OpenClaw will automatically use the environment variables.

2.  **Enable macOS Firewall:**
    Go to `System Settings > Network > Firewall` and ensure it is turned **On**. In `Options...`, make sure `node` is allowed to accept incoming connections if needed, but deny by default.

3.  **Regularly Rotate API Keys:** Set a calendar reminder to rotate your Anthropic, GitHub, and Telegram keys every 90 days.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

Run these final checks before relying on the agent for critical tasks.

1.  **Run the Deep Security Audit:**
    ```bash
    openclaw security audit --deep
    ```
    This command checks for common misconfigurations, exposed endpoints, and insecure permissions. Address any warnings it raises.

2.  **Review Skill Permissions:**
    ```bash
    clawhub list --permissions
    ```
    Verify that only the skills you expect have network or file system access.

3.  **Confirm Automations:**
    ```bash
    openclaw cron list
    ```
    Double-check the schedules and the actions to ensure they are not overly aggressive.

---

## 10 | 🆘 TROUBLESHOOTING & NEXT STEPS

*   **Headless Mode Issues:** If you experience problems with skills that require a GUI (like screen capture or browser automation), ensure your HDMI dummy plug is connected.
*   **Permissions Errors:** macOS is aggressive with its permissions. You may be prompted to grant Terminal (or OpenClaw) access to `Contacts`, `Calendar`, or `Automation` controls in `System Settings > Privacy & Security`.
*   **Keep it Running:** To ensure the agent runs 24/7, even after a reboot, consider setting it up as a `launchd` service on macOS. This is an advanced topic, but essential for true persistence.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | http://localhost:8080 |
| **Gateway Port** | `8080` |
| **Config File** | `~/.openclaw/config.yaml` |
| **Logs** | `~/.openclaw/logs/` |
| **Documentation** | https://docs.openclaw.ai |

You are now ready to begin working with your autonomous developer assistant.