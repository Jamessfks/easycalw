```markdown
# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Carlos (Food Truck Owner) |
| **MISSION** | Instant, accurate answers for your food truck customers. |
| **DATE** | 2026-07-28 |
| **DEPLOYMENT** | Existing MacBook |
| **CHANNEL** | WhatsApp |
| **MODEL** | Anthropic Claude 3.5 Sonnet (Recommended) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to instantly answer customer questions about your food truck — built for your workflow on WhatsApp and the tools you already use.**

## 🎯 Key Moments — What You Will Accomplish

*   **A Running Assistant:** Your MacBook will host an AI agent, ready to respond to messages while you work.
*   **WhatsApp Integration:** You'll connect your agent to WhatsApp, so customers can get instant answers about your menu, location, and hours.
*   **Business-Ready Guardrails:** Your agent will have safety rules to handle questions about food allergies and inventory correctly, always knowing when to ask you for help.

## 00 | ✅ PRE-FLIGHT CHECKLIST

Carlos, before we start, let's make sure your MacBook is ready. We'll be using the `Terminal` app, which you can find in `Applications > Utilities`.

- [ ] **Apple Silicon Mac:** An M1, M2, or newer MacBook.
- [ ] **macOS Version:** You are on macOS Ventura (13.0) or newer.
- [ ] **Admin Access:** You have the password for your MacBook.
- [ ] **Homebrew:** A package manager for macOS. We'll install it together in the first step.
- [ ] **Anthropic Account:** Create a free account at [anthropic.com](https://www.anthropic.com) to get your API key. This is how your agent "thinks."
- [ ] **Meta Developer Account:** Required to connect to WhatsApp. We'll walk through this.

> ⚠️ **WARNING:** You're installing OpenClaw on your personal MacBook. This is great for getting started, but remember: when your MacBook is asleep or off, your agent is too. For 24/7 service later, you might consider a dedicated machine like a Mac Mini.

## 01 | 💻 PLATFORM SETUP

Carlos, these steps prepare your Mac for OpenClaw. Open the `Terminal` app and type or paste these commands one by one, hitting `Enter` after each.

### 1. Install Xcode Command Line Tools
This is a one-time setup from Apple that gives your Mac essential developer tools.

```bash
xcode-select --install
```
> A window will pop up. Click "Install" and agree to the terms. Wait for it to finish before moving on.

### 2. Install Homebrew
Homebrew helps you install software easily.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Verify it worked:**
```
$ brew --version
Homebrew 4.3.5
...
```

### 3. Install Node.js
OpenClaw runs on Node.js. We'll use Homebrew to install `nvm`, a tool to manage Node.js versions, which is the safest way to do it.

```bash
brew install nvm
mkdir ~/.nvm
```
Now, add nvm to your shell profile so it loads automatically.
```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
```
Finally, install and use the recommended version of Node.js.
```bash
nvm install 24
nvm use 24
```

**Verify it worked:**
```
$ node -v
v24.8.1
```

## 02 | 📥 INSTALL OPENCLAW

Now that your Mac is ready, installing OpenClaw is a single command.

```bash
npm install -g openclaw
```

**Verify it worked:** After a minute or two of installation text, you can check the version.
```
$ openclaw --version
OpenClaw 2.8.1
```
Next, run the setup wizard. This will create your OpenClaw folder and initial configuration.
```bash
openclaw init
```
Follow the on-screen prompts. It will ask you for a folder name (you can just press `Enter` for the default `my-openclaw-agent`) and a few other basics.

## 03 | 💬 CONNECT YOUR CHANNEL

> 💡 **TIP:** Why this matters: Connecting to WhatsApp lets you and your customers talk to the agent from a familiar app on your phones, without needing to be at the computer.

Setting up WhatsApp involves a few steps with Meta (Facebook). To keep this main guide clean, I've created a detailed, step-by-step reference for you.

> ✅ **ACTION:** Open the reference document below and follow the instructions. Once you're done, come back here.
>
> **➡️ Your guide:** [Detailed WhatsApp Setup Instructions](./reference_documents/whatsapp_setup.md)

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER

Your agent needs a "brain" to understand and answer questions. We'll use Anthropic's Claude model, which is excellent for customer service tasks.

1.  Log in to your [Anthropic account](https://console.anthropic.com/).
2.  Go to `API Keys` and create a new key. Name it "OpenClawFoodTruck".
3.  Copy the key immediately. You won't see it again.
4.  In your Terminal, navigate to your OpenClaw directory:
    ```bash
    cd my-openclaw-agent 
    ```
5.  Set the API key as a secret so OpenClaw can use it securely:
    ```bash
    openclaw secrets set ANTHROPIC_API_KEY
    ```
    Paste your API key when prompted and press `Enter`.

**Verify it worked:**
```
$ openclaw secrets set ANTHROPIC_API_KEY
Enter secret value: ***********************
Secret 'ANTHROPIC_API_KEY' set successfully.
```
Now, tell OpenClaw to use this model.
```bash
openclaw config set model claude-3-5-sonnet-20240620
```

## 05 | 🛠️ INSTALL SKILLS

Skills are like apps for your agent. They let it perform specific tasks. Let's install a starter pack for your food truck.

> 🍽️ **Food Safety Note:** Your AI agent can be a great first line of defense for customer questions, but it's critical to program it with strict rules about food allergies. The guardrails in Section 07 will instruct the agent to *never* give allergy advice and to always refer those questions directly to you.

Run these commands one by one:

```bash
# Security scanner: checks all other skills for safety before they run.
clawhub install skill-vetter

# General security monitoring for your agent.
clawhub install clawsec-suite

# Connects to Google Docs/Sheets/Calendar. Great for storing your menu.
clawhub install gog

# Lets the agent read and summarize web pages or documents.
clawhub install summarize

# AI-powered web search for answering general questions.
clawhub install tavily-web-search
```
*Note: We searched for skills to directly connect to Square and Instagram DMs, but no secure, verified skills are available in the registry yet. For now, you can use the agent on WhatsApp to help you draft quick replies to send on Instagram.*

## 06 | 🚀 INJECT YOUR SOUL

This is the most important step. You'll "teach" your agent about your business by sending it a series of setup messages.

> ✅ **ACTION:** Open the file `prompts_to_send.md`. Copy and paste each prompt, one by one, into your WhatsApp chat with the agent. Wait for it to confirm each message ("Understood." or "OK.") before sending the next one.

## 07 | 🛡️ SECURITY HARDENING

Because you're running this on your personal Mac, security is extra important.

1.  **Enable FileVault:** This encrypts your Mac's hard drive. If your laptop is ever lost or stolen, no one can access your data, including your agent's API keys. Go to `System Settings > Privacy & Security > FileVault` and turn it on.
2.  **Use Strong Passwords:** Ensure your macOS user account has a strong password.
3.  **Keep API Keys Out of Chat:** Never paste an API key or password into a chat with your agent. Use the `openclaw secrets set` command we used earlier.

## 08 | 🔍 SECURITY AUDIT CHECKLIST

Before you rely on the agent for real customer interactions, run this final check.

In your Terminal, run this command from your OpenClaw directory:
```bash
openclaw security audit --deep
```
This command checks for common security issues. Make sure it reports `[PASS]` on all critical items.

## 09 | 🆘 TROUBLESHOOTING & NEXT STEPS

*   **"My agent isn't responding."**
    *   Check if your MacBook is awake. If the lid is closed, the agent is sleeping.
    *   Make sure the `openclaw` process is running in your Terminal. If you closed the Terminal window, you'll need to `cd my-openclaw-agent` and run `openclaw start` again.
*   **"How do I update my menu?"**
    *   If you store your menu in a Google Doc (using the `gog` skill), you can just update the doc. Then you can tell your agent, "Please re-read the menu document."

You're all set, Carlos! Your AI assistant is ready to help you serve your customers.

## QUICK REFERENCE
| Item | Details |
|---|---|
| **Web UI URL** | http://localhost:8840 (Access it from your Mac's browser) |
| **Gateway Port** | 8840 |
| **Model Provider** | Anthropic |
| **Documentation** | https://docs.openclaw.ai |
```