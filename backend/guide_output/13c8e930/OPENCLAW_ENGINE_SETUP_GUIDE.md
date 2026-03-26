# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Freelance Designer |
| **MISSION** | Automate design workflow with email and Notion integration. |
| **DATE** | 2026-07-28 |
| **DEPLOYMENT** | Existing Mac |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude Sonnet 4.6 |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

This guide configures your OpenClaw agent to streamline your freelance design business — built around your email workflow and the tools you already use.

## 🎯 Key Moments — What You Will Accomplish

*   **A Running Agent:** Your AI assistant will be running on your Mac, securely connected to you via Telegram.
*   **Automated Email Triage:** You will set up a daily routine to summarize your inbox, saving you time every morning.
*   **Essential Freelance Skills:** Your agent will be equipped with core skills for web research, summarization, and email management, with a clear path to automating web-based tools like Notion.

> ⚠️ **Important Assumption:** Your interview did not specify a computer or operating system. This guide assumes you are installing OpenClaw on an **existing Apple Mac** (iMac, MacBook, or Mac Mini) that you use for daily work. If you are using a different system, please consult the official OpenClaw documentation.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

Before you begin, please ensure you have the following ready.

*   **Hardware & Software:**
    *   [ ] An Apple Silicon Mac (M1 or newer) running macOS Ventura or later.
    *   [ ] At least 8GB of RAM and 5GB of free disk space.
*   **Accounts & Keys:**
    *   [ ] **Anthropic API Key:** Create an account at [anthropic.com](https://anthropic.com) and generate an API key. We recommend setting a low monthly spending limit (e.g., $20) to start.
    *   [ ] **Telegram Account:** You will need the Telegram app on your phone or computer.

---

## 01 | ⚙️ PLATFORM SETUP

First, we need to install the necessary tools on your Mac. Open the `Terminal` app (you can find it in Applications > Utilities, or by searching with Spotlight).

> 💡 **TIP:** The Terminal is a way to give your computer text-based commands. We'll provide every command you need to copy and paste.

1.  **Install Homebrew:** This is a package manager that makes it easy to install software. Paste this command into your Terminal and press Enter:
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
    *You may be prompted to enter your Mac's password.*

2.  **Install Node.js:** OpenClaw is built on Node.js. Homebrew makes this simple.
    ```bash
    brew install node
    ```
    **Verify it worked:**
    ```
    $ node -v
    v22.16.0 
    ```
    *(Your version might be slightly different, but it should start with v22 or higher).*

---

## 02 | 📥 INSTALL OPENCLAW

With the foundation in place, you can now install the OpenClaw Command Line Interface (CLI).

1.  **Install the OpenClaw CLI:** This command installs the main OpenClaw tool.
    ```bash
    npm install -g openclaw-cli
    ```

2.  **Initialize Your OpenClaw Instance:** This creates the necessary configuration files in your home directory.
    ```bash
    openclaw init
    ```
    **Verify it worked:**
    ```
    $ openclaw init
    ✅ OpenClaw configuration initialized at ~/.openclaw
    ```

---

## 03 | 💬 CONNECT YOUR CHANNEL

This step connects your agent to Telegram so you can chat with it. This process involves multiple steps, so we've created a detailed reference guide.

> ✅ **ACTION:** Open and follow the steps in the reference document:
>
> **➡️ `reference_documents/telegram_bot_setup.md`**
>
> Once you have your Telegram Bot Token, return to this guide to continue.

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

Now, tell OpenClaw to use the powerful Claude 3 Sonnet model from Anthropic.

1.  **Set Anthropic as the Provider:**
    ```bash
    openclaw config set model.provider anthropic
    ```

2.  **Set the Specific Model:**
    ```bash
    openclaw config set model.anthropic.model claude-3-5-sonnet-20240620
    ```

3.  **Securely Store Your API Key:**
    ```bash
    openclaw secrets set ANTHROPIC_API_KEY
    ```
    *Paste your API key from the pre-flight checklist when prompted and press Enter.*

    **Verify it worked:**
    ```
    $ openclaw config get model.provider
    anthropic
    ```

---

## 05 | 🛠️ INSTALL SKILLS

Skills give your agent abilities. We'll install a starter set tailored for your freelance work.

> 🔒 **Data Handling Note:** As a freelance designer, you handle sensitive client information. Be mindful of which skills you grant access to data. The `gog` skill for email will require access to your Google account; we recommend creating a separate Google account for your agent to limit its access to your primary inbox.

1.  **Install Security Vetting Skill (MANDATORY):** This skill vets all other skills before they are installed.
    ```bash
    clawhub install skill-vetter
    ```

2.  **Install Core & Freelance Skills:**
    ```bash
    clawhub install clawsec-suite gog summarize tavily-web-search agent-browser
    ```
    *This installs security monitoring, Google Workspace (for email), summarization, web search, and browser automation.*

**Note on Notion:** The skill registry does not currently contain a dedicated, verified skill for Notion. However, the `agent-browser` skill can automate tasks on *any* website, including Notion. You can teach your agent how to log in and create pages as a more advanced project later.

---

## 06 | 🤖 CONFIGURE AUTOMATIONS

Let's create a simple automation to give you a daily email summary.

> 💡 **Why this matters:** This automation replaces the manual morning email check you do, giving you a high-level summary so you can focus on design work first.

**Create a Daily Email Briefing:** This command tells your agent to summarize unread emails every weekday morning at 8 AM and send the summary to you on Telegram.
```bash
openclaw cron add --name "Daily Email Briefing" --schedule "0 8 * * 1-5" --prompt "Using the gog skill, summarize any unread emails from the last 24 hours into a short bulleted list." --autonomy NOTIFY
```
**Verify it worked:**
```
$ openclaw cron list
✓ Daily Email Briefing | 0 8 * * 1-5 | NOTIFY
```

---

## 07 | ✨ INJECT YOUR SOUL

Your agent is set up, but it has no personality or instructions. You will now "inject its soul" by sending it a series of initialization prompts.

> ✅ **ACTION:** Open the `prompts_to_send.md` file. Copy and paste each prompt into your Telegram chat with your new agent, one by one. Wait for it to respond "Acknowledged" before sending the next.

---

## 08 | 🛡️ SECURITY HARDENING

Because you're running this on your personal Mac, securing it is critical.

1.  **Enable FileVault:** FileVault encrypts your Mac's hard drive, protecting your agent's data and your personal files if your computer is lost or stolen.
    *   Go to `System Settings` > `Privacy & Security` > `FileVault`.
    *   Click `Turn On...` and follow the instructions.

2.  **Review App Permissions:** Be mindful of which apps you grant `Full Disk Access` or `Screen Recording` permissions to. OpenClaw may request some of these for skills like `agent-browser`. Only approve permissions for skills you trust.

3.  **Use a Standard User Account:** For better security, consider creating a separate, non-administrator user account on your Mac just for running OpenClaw.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

Before you rely on your agent, perform this final audit.

1.  **Run the Deep Security Scan:** In your Terminal, run:
    ```bash
    openclaw security audit --deep
    ```
    *This command checks for common security misconfigurations.*

2.  **Review Installed Skills:**
    ```bash
    clawhub list
    ```
    *Ensure the list matches only the skills you intentionally installed in Step 05.*

3.  **Confirm Autonomy Levels:**
    ```bash
    openclaw cron list
    ```
    *Verify that your automations are set to `NOTIFY` and not a higher level like `EXECUTE`.*

---

## 10 | 🆘 TROUBLESHOOTING & NEXT STEPS

*   **"My agent doesn't respond":** If your Mac goes to sleep, OpenClaw will stop responding. To fix this, go to `System Settings` > `Energy Saver` and adjust the sleep settings.
*   **"Command not found":** If you get a `command not found: openclaw` error, close and reopen your Terminal app to refresh its path.
*   **"Error installing skills":** Make sure you installed `skill-vetter` first.

You are now ready to begin working with your personal AI assistant!

## QUICK REFERENCE
| Item | Details |
|---|---|
| **Web UI URL** | `http://localhost:8840` |
| **Gateway Port** | `8840` |
| **Model Provider** | `Anthropic` |
| **Documentation** | `https://docs.openclaw.ai` |