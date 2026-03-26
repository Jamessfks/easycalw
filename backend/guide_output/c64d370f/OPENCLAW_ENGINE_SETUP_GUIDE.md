# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Austin Real Estate Agent |
| **MISSION** | Automate client follow-ups, market reports, and scheduling |
| **DATE** | July 17, 2026 |
| **DEPLOYMENT** | Dedicated Mac Mini |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude 3.5 Sonnet |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

This guide configures your OpenClaw agent to automate client follow-ups, generate market reports, and manage your schedule — built around your real estate workflow and the Google tools you already use.

## 🎯 Key Moments — What You Will Accomplish

*   **A 24/7 assistant:** You will have an always-on agent running on your dedicated Mac Mini, ready to handle tasks anytime via Telegram.
*   **Automated client communication:** You will set up workflows that automatically generate weekly client market reports and draft follow-up emails after property showings.
*   **A secure, private system:** You will implement industry-standard security practices to ensure your client data is handled safely on hardware you control.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

Before you begin, please ensure you have the following ready. This will make the setup process much smoother.

*   [ ] **Dedicated macOS User Account:** On your Mac Mini, create a new, non-admin user account exclusively for OpenClaw. Do not run this on your personal account. Go to `System Settings > Users & Groups > Add Account`.
*   [ ] **Anthropic API Key:** Create an account at [anthropic.com](https://anthropic.com) and generate an API key. We recommend starting with Claude 3.5 Sonnet for the best balance of speed and intelligence.
*   [ ] **Telegram Bot Token:** You will need to create a new bot in Telegram to get an API token. See the reference document for a step-by-step walkthrough.
*   [ ] **Homebrew Installed:** If you don't have it, open Terminal and run:
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

## 01 | 💻 PLATFORM SETUP: YOUR MAC MINI

These steps prepare your Mac Mini to be a reliable, secure, 24/7 server for your agent.

> 💡 **TIP:** Why this matters: A dedicated, isolated environment prevents the agent from accessing your personal files and ensures it doesn't interfere with other applications.

1.  **Log In to the Dedicated Account:** Log out of your personal account and log in to the new account you created for OpenClaw. All subsequent steps should be performed from this account.

2.  **Enable FileVault Disk Encryption:** This is critical. FileVault encrypts the entire hard drive, protecting your agent's memory, API keys, and client data if the Mac Mini is ever physically stolen.
    *   Go to `System Settings > Privacy & Security`.
    *   Scroll down and turn on `FileVault`. The initial encryption may take 30-60 minutes.

3.  **Adjust Energy Saver Settings:** To ensure the Mac Mini runs 24/7 and doesn't go to sleep.
    *   Go to `System Settings > Energy Saver`.
    *   Enable "Prevent your Mac from automatically sleeping when the display is off".
    *   (Optional) If you are running it headless (without a monitor), consider purchasing an inexpensive HDMI dummy plug. This tricks macOS into thinking a display is connected, preventing potential graphics-related issues with automation tools.

## 02 | 🚀 INSTALL OPENCLAW

Now, let's install the OpenClaw engine itself using Node.js and npm.

1.  **Install `nvm` and `node`:** We'll use `nvm` (Node Version Manager) to install and manage Node.js. This is the recommended approach.
    ```bash
    brew install nvm
    ```
    Now, add `nvm` to your shell profile.
    ```bash
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
    echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
    echo '[ -s "/opt/homebrew/opt/nvm/bash_completion" ] && \. "/opt/homebrew/opt/nvm/bash_completion"' >> ~/.zshrc
    ```
    Close and reopen your Terminal, then install the latest Node.js.
    ```bash
    nvm install --lts
    nvm use --lts
    ```
    **Verify it worked:**
    ```
    $ node -v
    v22.5.1 # or the latest LTS version
    ```

2.  **Install the OpenClaw CLI:**
    ```bash
    npm install -g @openclaw/cli
    ```
    **Verify it worked:**
    ```
    $ openclaw --version
    openclaw-cli/x.y.z # shows the installed version
    ```

3.  **Initialize Your OpenClaw Instance:**
    ```bash
    openclaw init my-agent
    cd my-agent
    ```
    This creates a new directory `my-agent` with all the necessary configuration files.

## 03 | 💬 CONNECT YOUR CHANNEL: TELEGRAM

To talk to your agent, you need to connect it to Telegram. This process involves creating a "Bot" on Telegram's platform.

> ✅ **ACTION:** The steps to get a bot token from Telegram's "BotFather" are detailed. To keep this guide clean, please follow the separate reference document.
>
> **➡️ Open `reference_documents/telegram_bot_setup.md` and complete those steps.**

Once you have your **Bot Token** and **Chat ID** from the reference guide, run this command:
```bash
openclaw config set channels.telegram.enabled true
openclaw config set channels.telegram.token "YOUR_TELEGRAM_BOT_TOKEN"
openclaw config set channels.telegram.chatIds "YOUR_TELEGRAM_CHAT_ID"
```
Replace the placeholders with the actual values you obtained.

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

This tells your agent which AI brain to use. We'll configure Anthropic's Claude 3.5 Sonnet.

1.  **Set the provider and model:**
    ```bash
    openclaw config set llm.provider anthropic
    openclaw config set llm.model "claude-3.5-sonnet-20240620"
    ```

2.  **Securely store your API key:**
    ```bash
    openclaw secrets set ANTHROPIC_API_KEY
    ```
    This will prompt you to paste your API key. It will be stored securely and not in plain text configuration files.

## 05 | 🛠️ INSTALL SKILLS

Skills are the tools your agent uses to interact with the world. We'll install a core set tailored to your real estate needs.

> 🏠 **Fair Housing Note:** As a real estate professional, you are legally obligated to comply with the Fair Housing Act. Your agent must not be used to filter, screen, or make decisions based on protected classes (race, color, religion, sex, familial status, national origin, disability). All final client-facing communications and decisions must be reviewed by you.

1.  **Install the Security Vetting Skill (MANDATORY FIRST STEP):**
    ```bash
    clawhub install skill-vetter
    ```
    This skill analyzes other skills before you install them to check for security risks.

2.  **Install Your Core Skillset:**
    ```bash
    # For interacting with Gmail and Google Calendar
    clawhub install gog

    # For AI-powered web searches to gather market data
    clawhub install tavily-web-search

    # For browser automation to scrape sites like Zillow or interact with your CRM
    clawhub install agent-browser
    
    # For ongoing security monitoring
    clawhub install clawsec-suite
    ```

3.  **Configure API Keys for Skills:** The `tavily-web-search` skill requires its own API key.
    ```bash
    openclaw secrets set TAVILY_API_KEY
    ```
    Follow the prompt to paste your key from [tavily.com](https://tavily.com).

## 06 | ⏰ CONFIGURE AUTOMATIONS

Let's set up the cron job for your weekly market reports. This is a starting point; you'll define the exact logic in the next step.

> 💡 **TIP:** Why this matters: This automation replaces the manual weekly report generation you described. It will run on a schedule, gather the data, and prepare a draft for you to review, saving you hours each week.

Run the following command to schedule a report to run every Friday at 9:00 AM:
```bash
openclaw cron add --schedule "0 9 * * 5" --name "weekly-market-reports" --prompt "Run the Weekly Market Report workflow for all active clients." --to "YOUR_TELEGRAM_CHAT_ID"
```
**Verify it worked:**
```
$ openclaw cron list
✓ Cron job "weekly-market-reports" added.
ID   | NAME                    | SCHEDULE    | NEXT RUN
--------------------------------------------------------------
xyz  | weekly-market-reports   | 0 9 * * 5   | ...
```

## 07 | 🧬 INJECT YOUR SOUL

Your agent is installed and connected. Now, you must teach it *who* it is and *what* to do.

> ✅ **ACTION:** Open the file `prompts_to_send.md`. Copy and paste each prompt, one by one, into your Telegram chat with the bot. Wait for it to confirm understanding before sending the next. This will load its core identity, workflows, and safety rules.

## 08 | 🔒 SECURITY HARDENING

With the agent running, let's complete the final security configurations.

1.  **Review macOS Permissions:**
    *   Go to `System Settings > Privacy & Security`.
    *   Review `Accessibility`, `Full Disk Access`, and `Screen Recording`.
    *   The `Terminal` app (or your agent's process) will likely need permissions for skills like `agent-browser` to function. Be mindful of what you grant access to. Only grant the permissions required for your specific workflows.

2.  **Set Up API Key Rotation Reminders:**
    *   Set a calendar reminder for yourself to rotate your Anthropic and other API keys every 90 days. This limits the window of exposure if a key is ever compromised.

3.  **Firewall:**
    *   Ensure the macOS firewall is enabled under `System Settings > Network > Firewall`. The OpenClaw gateway does not need to accept incoming connections from the internet for this setup, so the default settings are sufficient.

## 09 | 🔍 SECURITY AUDIT CHECKLIST

Run these checks before giving your agent any real client data.

1.  **Run the built-in deep audit:**
    ```bash
    openclaw security audit --deep
    ```
    This command checks for common misconfigurations, exposed secrets, and insecure permissions. Address any warnings it raises.

2.  **Verify Skill Permissions:**
    ```bash
    clawhub list --permissions
    ```
    Review which skills have access to your network, file system, or can execute commands. Ensure this matches your expectations.

3.  **Check Running Automations:**
    ```bash
    openclaw cron list
    ```
    Confirm that only the automations you expect are scheduled to run.

## 10 | 🛠️ TROUBLESHOOTING & NEXT STEPS

*   **Agent is not responding:** First, check if the agent is running with `openclaw status`. If not, start it with `openclaw start`.
*   **"Headless" Mac Mini Issues:** If you run the Mac Mini without a monitor and browser automation fails, it's likely a macOS issue with rendering a GUI without a display. An **HDMI dummy plug** resolves this.
*   **Next Steps:** Explore more skills on ClawHub. Consider skills for document management or integrating with other services you use. Start simple, and add complexity as you get more comfortable.

---

## QUICK REFERENCE
| Item | Details |
|---|---|
| **Web UI URL** | `http://localhost:7777` |
| **Gateway Port** | `7777` |
| **Model Provider** | Anthropic (`claude-3.5-sonnet-20240620`) |
| **Log Files** | `~/.openclaw/logs/` |
| **Documentation** | https://docs.openclaw.ai |