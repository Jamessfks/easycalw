# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Coffee Shop Owner |
| **MISSION** | Automate daily coffee shop operations |
| **DATE** | 2026-07-16 |
| **DEPLOYMENT** | Dedicated Mac Mini (Apple Silicon) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude 3.5 Sonnet |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to automate daily tasks for your coffee shop — from tracking inventory in Google Sheets to drafting social media posts, all managed from your phone.**

Welcome! This guide will walk you through setting up a dedicated, 24/7 AI assistant on your Mac Mini. We'll go step-by-step, with no prior technical experience required. Let's get your new AI employee working for you.

## 🎯 Key Moments — What You Will Accomplish
*   **A Private & Secure AI:** A dedicated, 24/7 AI assistant running securely on your own hardware, ensuring your business data stays private.
*   **Automated Daily Briefings:** A morning summary of the weather, staff schedule, and daily tasks sent directly to you via Telegram before the first customer arrives.
*   **Smart Business Tools:** A set of skills to help manage schedules in Google Calendar, track stock levels in Google Sheets, and draft replies to common customer questions.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

Before we begin, please ensure you have the following ready. This will make the setup process smooth and fast.

*   [ ] **Hardware:** An Apple Silicon (M1 or newer) Mac Mini connected to power and the internet.
*   [ ] **macOS Account:** We will create a new, dedicated macOS user account just for OpenClaw. Do not use your personal account.
*   [ ] **Anthropic Account:** An account with Anthropic to get an API key for the Claude model. You can create one at [anthropic.com](https://www.anthropic.com/).
    *   > 💡 **TIP:** Once you have your API key, go to your Anthropic billing settings and set a low monthly spending limit (e.g., $20) to prevent any surprise costs.
*   [ ] **Telegram Account:** The Telegram app installed on your phone.

---

## 01 | 🖥️ PLATFORM SETUP: SECURING YOUR MAC MINI

Your Mac Mini will be on 24/7, so we need to make sure it's secure from the start. These steps create an isolated environment for your AI agent.

> 💡 **Why this matters:** Creating a separate user account is like giving an employee their own login. It prevents the AI from accessing your personal files, photos, and passwords, keeping your data safe while it works.

1.  **Create a Dedicated macOS User:**
    *   Go to `System Settings` > `Users & Groups`.
    *   Click `Add Account...` (you may need to enter your password).
    *   Set Account Type to **Standard**.
    *   Full Name: `OpenClaw Agent`
    *   Account Name: `openclaw`
    *   Create a strong, unique password for this user and save it in a password manager.
    *   Click `Create User`.
    *   Log out of your personal account and log in to the new `openclaw` account. You will perform the rest of this setup from this new account.

2.  **Enable Full Disk Encryption:**
    *   Go to `System Settings` > `Privacy & Security`.
    *   Scroll down and turn on `FileVault`.
    *   Follow the prompts to enable encryption. This protects all data on the Mac Mini if it's ever lost or stolen. The process may take 30-60 minutes.

    > 🍽️ **Food Safety Note:** While OpenClaw is great for operations, avoid using it to store or manage critical food safety logs (like temperature records) or employee health information. Stick to dedicated, compliant software for those tasks to ensure you have a clear audit trail for health inspections.

---

## 02 | 🚀 INSTALL OPENCLAW

Now we'll install the core OpenClaw software using the Terminal. You can find the Terminal app in `Applications` > `Utilities`. Open it and type the following commands exactly as written, pressing Enter after each one.

1.  **Install Homebrew (a package manager for macOS):**
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
    *(Follow the on-screen instructions to complete the installation.)*

2.  **Install `nvm` (Node Version Manager) to manage Node.js:**
    ```bash
    brew install nvm
    ```

3.  **Configure `nvm` (run these three commands):**
    ```bash
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
    echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
    echo '[ -s "/opt/homebrew/opt/nvm/bash_completion" ] && \. "/opt/homebrew/opt/nvm/bash_completion"' >> ~/.zshrc
    ```

4.  **Close and reopen the Terminal window** for the changes to take effect.

5.  **Install and use the recommended version of Node.js:**
    ```bash
    nvm install 24
    nvm use 24
    ```
    **Verify it worked:**
    ```
    $ node -v
    v24.x.x
    ```

6.  **Finally, install OpenClaw itself:**
    ```bash
    npm install -g openclaw-engine
    ```

7.  **Start OpenClaw for the first time:**
    ```bash
    openclaw start
    ```
    **Verify it worked:** You'll see a welcome message and a QR code. We'll use this in the next step.

---

## 03 | 💬 CONNECT YOUR CHANNEL: TELEGRAM

To talk to your agent, you need to connect it to a messaging app. We recommend Telegram for its reliability. This process involves creating a 'bot' user in Telegram and giving its credentials to OpenClaw.

Because this has a few steps, we've created a detailed reference guide.

> ✅ **ACTION:** Open the guide below and follow the instructions. It will walk you through creating your Telegram bot and connecting it to OpenClaw in about 5 minutes.
>
> **Detailed Guide:** [**Connecting to Telegram**](reference_documents/telegram_bot_setup.md)

Once you've completed that guide, come back here to continue.

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

Your agent needs a "brain" to think. We'll connect it to Anthropic's powerful and cost-effective Claude 3.5 Sonnet model.

1.  **Get your Anthropic API Key:**
    *   Log in to your Anthropic account.
    *   Navigate to the `API Keys` section.
    *   Create a new secret key and name it `OpenClaw-MacMini`.
    *   Copy the key immediately. You will not be able to see it again.

2.  **Set the API Key in OpenClaw:**
    *   Go back to your Mac Mini's Terminal.
    *   Run the following command, pasting your API key where indicated:
    ```bash
    openclaw config set anthropic_api_key YOUR_ANTHROPIC_API_KEY
    ```

3.  **Set the Default Model:**
    ```bash
    openclaw config set default_model claude-3-5-sonnet-20240620
    ```
    **Verify it worked:**
    ```
    $ openclaw config get default_model
    claude-3-5-sonnet-20240620
    ```

---

## 05 | 🛠️ INSTALL SKILLS

Skills are like apps for your agent, giving it new abilities. We'll install a starter pack perfect for running your coffee shop.

> 💡 **Why this matters:** These specific skills let your agent interact with the outside world. `gog` connects to Google for your schedules and inventory sheets, while `weather` and `tavily-web-search` give it real-time information to help you make decisions.

Run these commands one by one in your Terminal.

1.  **Install the Security Vetting Skill (MANDATORY FIRST STEP):**
    ```bash
    clawhub install skill-vetter
    ```

2.  **Install the Core Productivity Skills:**
    ```bash
    clawhub install gog
    clawhub install weather
    clawhub install tavily-web-search
    clawhub install summarize
    ```
    **Verify it worked:** After installing, run `openclaw skills list`. You should see all the skills you just installed in the output.

---

## 06 | 🤖 CONFIGURE AUTOMATIONS

This is where the magic happens. You can teach your agent to perform tasks on a schedule. We've prepared a set of ready-to-use automations in the next step. You'll simply paste them into your chat with the agent, and it will set them up for you.

Examples of what you'll enable:
*   A **Morning Briefing** at 7 AM with the weather, staff schedule, and daily reminders.
*   An **Evening Reminder** at 9 PM to log daily sales and check for low-stock items.

---

## 07 | ✨ INJECT YOUR SOUL

Now it's time to give your agent its personality, purpose, and instructions.

> ✅ **ACTION:** Open the file `prompts_to_send.md`. Copy and paste each prompt, one by one, into your Telegram chat with your new agent. Wait for it to confirm each prompt before sending the next.
>
> **Prompts File:** `prompts_to_send.md`

This will configure its identity, business knowledge, automations, and safety rules.

---

## 08 | 🛡️ SECURITY HARDENING

Security is not a one-time setup. Here are a few key practices to keep your agent and your business data safe.

*   **Confirm FileVault is Active:** Go to `System Settings` > `Privacy & Security` and ensure `FileVault` is "On".
*   **Check App Permissions:** Go to `System Settings` > `Privacy & Security`. Review which apps have access to `Full Disk Access` and `Screen Recording`. Be very restrictive. OpenClaw may need these for certain skills, but grant them only when prompted and necessary.
*   **Set API Spending Limits:** If you haven't already, log into your Anthropic account and set a low monthly spending cap. This is your most important financial safeguard.
*   **Use Strong, Unique Passwords:** For the `openclaw` macOS account and your Telegram account.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

Before you rely on your agent for real work, perform this final check.

1.  **Run the built-in security audit tool:**
    ```bash
    openclaw security audit --deep
    ```
    *(Review the output for any warnings or errors.)*

2.  **Review installed skills:**
    ```bash
    openclaw skills list
    ```
    *(Ensure the list only contains the skills you intentionally installed in Step 05.)*

3.  **Review scheduled automations:**
    ```bash
    openclaw cron list
    ```
    *(Confirm the morning and evening jobs are there and scheduled correctly.)*

---

## 10 | ⚙️ TROUBLESHOOTING & NEXT STEPS

*   **Headless Operation:** If you plan to run the Mac Mini without a monitor (headless), you may need an **HDMI dummy plug**. This $10 device tricks macOS into thinking a display is connected, which prevents issues with screen-related permissions that some skills rely on.
*   **Agent is Unresponsive:** If your Mac Mini goes to sleep, the agent will stop responding. Go to `System Settings` > `Energy Saver` and set `Turn display off after` to your preference, but make sure `Prevent computer from sleeping automatically when the display is off` is checked.

Your agent is now fully configured and ready to help you run your coffee shop!

## QUICK REFERENCE
| Item | Details |
|---|---|
| **Web UI URL** | http://localhost:5173 (Access from the Mac Mini's web browser) |
| **Gateway Port** | 8008 (Default) |
| **Model Provider** | Anthropic (Claude 3.5 Sonnet) |
| **Documentation** | https://docs.openclaw.ai |