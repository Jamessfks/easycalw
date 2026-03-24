# OpenClaw Mac Mini Setup Guide

**The community-standard dedicated hardware setup for running OpenClaw 24/7.**

Based on community advice, real user experiences, and online tutorials.

---

## What Is OpenClaw?

OpenClaw is a free, open-source AI agent you can run 24/7 on your own hardware. Think of it as a personal AI employee you can text tasks to -- it can manage emails, edit documents, browse the web, push code, and more, all through messaging apps like Telegram, WhatsApp, Slack, or iMessage. It's like having a really smart employee that you can text and assign tasks to. You just need to give it your Claude subscription and install it on a computer for it to work.

The Mac Mini occupies a unique sweet spot for self-hosted AI: it is small enough to tuck behind a monitor, quiet enough to sit on a desk, and powerful enough to handle every task OpenClaw throws at it.

> **Security warning:** OpenClaw runs with broad system permissions and can read files, execute commands, send messages, and browse the web on your behalf. Do not install it on your primary personal machine if you have sensitive data (iCloud, passwords, personal photos) synced to it.

---

## Choosing Your Hardware

Not all Mac Minis are equal for this use case. Based on real user recommendations:

Any Apple Silicon Mac Mini works, but the right configuration depends on how you plan to use OpenClaw:

- **Mac Mini M2 (8GB)** is sufficient for cloud-only models like Anthropic Claude or OpenAI -- it handles the OpenClaw gateway, messaging channels, and browser automation comfortably.
- **Mac Mini M2 Pro (16GB)** is recommended if you want to run small local models (7B parameters) alongside OpenClaw.
- **Mac Mini M4 (16-32GB)** is the current best pick -- the M4 chip delivers faster single-threaded Node.js performance and more GPU cores for local inference.

The Mac Mini M4 with 16GB RAM is the sweet spot. Apple Silicon is absurdly efficient for this workload. The agent spends most of its time waiting for API responses, so raw CPU power barely matters. What matters is that it stays on 24/7 without overheating, without noise, and without running up your electricity bill.

**On storage:** The minimum Mac Mini M4 with 16GB RAM and 256GB SSD (~$500) handles one main agent plus 2-3 sub-agents, but the 256GB fills up faster than you'd expect if you're storing transcripts, video files, or large memory logs. The recommended config is 16GB RAM with 512GB SSD (~$700) -- plenty of room for transcripts, memory files, agent workspace data, and a year of daily logs.

**Practical tip:** If you're running the Mac Mini headless (no monitor), get an HDMI dummy plug. It's an $8-10 dongle you plug into the HDMI port. It tricks macOS into thinking a display is connected. Without it, macOS gets weird in headless mode -- Screen Recording permissions can break, GUI apps won't render right, and the screen capture OpenClaw relies on can just fail.

---

## Before You Start -- Important Setup Advice

**Create a dedicated user account.** Never run OpenClaw under your personal macOS account. A separate account gives it isolation -- its own home directory, its own keychain, its own file permissions.

**Enable FileVault disk encryption.** This encrypts your entire disk. If someone physically steals the Mac Mini, they can't read your agent's data, API keys, memory files, or anything else. It takes about 30 minutes to encrypt on first enable. Don't skip it.

**Give OpenClaw its own credentials.** Set up your Mac Mini with its own Apple ID, Gmail, and Google ID. This way OpenClaw doesn't have access to your main accounts. Instead, share only specific Google Docs, Sheets, and Drive files for it to read and edit.

**Set API spending limits.** Go to billing settings on Anthropic, OpenAI, Brave, and any other service and set a monthly cap you are comfortable with. Start conservative -- $20 to $50 per month. A misconfigured agent or runaway loop can burn through credits fast.

---

## Step 1 -- Prepare macOS

Update your system first. Go to **Apple menu > System Settings > General > Software Update** and install everything. Restart if prompted.

Then configure your Mac Mini to stay awake around the clock. Install any pending updates and restart if required. Since this Mac Mini is dedicated to OpenClaw, configure it to stay awake and recover from power outages. Open **System Settings > Energy**, then enable "Prevent automatic sleeping when the display is off", enable "Wake for network access", and enable "Start up automatically after a power failure".

Many users also recommend going further: install **Amphetamine** from the Mac App Store for more reliable sleep prevention. Once installed, launch it -- it appears as a pill icon in the menu bar. Go to Preferences, enable "Launch Amphetamine at login", enable "Start session when Amphetamine launches" with duration set to Indefinitely, and enable "Start session after waking from sleep". Between the Energy settings and Amphetamine, this machine will stay awake through anything short of a power outage.

For headless remote access: enable Remote Login (SSH) in **System Settings > General > Sharing**. This is your primary way to manage the machine remotely. Also enable Screen Sharing (VNC) for the occasional graphical task. Set the machine to automatically log in to your user account in **System Settings > Users & Groups > Login Options**.

---

## Step 2 -- Install Xcode Command Line Tools

Open **Terminal** (press Cmd+Space, type "Terminal") and run:

```bash
xcode-select --install
```

A dialog will appear -- click Install and wait a few minutes. This gives you the compilers Homebrew needs.

---

## Step 3 -- Install Homebrew

Open Terminal on your Mac Mini and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. After it finishes, if you're on Apple Silicon (M1/M2/M3/M4), you may need to add Homebrew to your PATH:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
```

Verify it worked with `brew --version`.

---

## Step 4 -- Install Node.js

Install Node.js via Homebrew:

```bash
brew install node
```

Check the version with `node --version`. You need v22.16 or higher. If it's older, run `brew upgrade node`.

One thing the community flags repeatedly: add `/opt/homebrew/opt/node@22/bin` to the front of your PATH entry to avoid version conflicts, especially if you have multiple Node versions installed.

---

## Step 5 -- Run the OpenClaw Installer

This does three things: checks for Node.js 22+ (installs it if you don't have it), drops the OpenClaw CLI globally, and launches the onboarding wizard.

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see "Installation finished successfully!" then verify:

```bash
openclaw --version
```

**Important:** Make sure you are on version 2026.1.29 or later. There was a breaking change in v2026.1.29 -- gateway auth mode "none" has been permanently removed. The gateway now requires either token or password authentication. If you followed an older tutorial or YouTube walkthrough that configured `auth: "none"`, your gateway will not start after updating. If that happens, fix it by running `openclaw onboard` to reconfigure auth.

---

## Step 6 -- Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical. It sets up a launchd service so OpenClaw starts automatically on boot and runs 24/7.

The wizard will ask you several things. Here's what real users recommend at each step:

- **Gateway mode:** Choose Local. "Remote" is for connecting to a gateway on another machine -- not what you need here.
- **AI provider:** Enter your Anthropic API key. Claude Opus is the recommended model -- it is the smartest, most personable, warmest model available. Yes, it costs more. It is worth it.
- **Messaging channels:** Start with one channel. Get comfortable with how OpenClaw responds, how to give it tasks, how the permissions and file access work. Then add more channels once you figure out your workflow. Most beginners start with just Telegram.
- **Hooks:** Enable all three -- boot hook, command logger, and session memory. Session memory is the most important one. It saves conversation context before the context window fills up.
- **Skills:** Skip them for now. Every skill you add expands the agent's permissions. Start with zero and add deliberately. The community has also flagged that roughly 17-20% of community Skills contain malicious code, so only install skills from sources you trust.

---

## Step 7 -- Grant macOS Permissions

This is a step many guides skip and where most people get stuck. OpenClaw needs three permissions to work properly -- not two, not one, all three: **Full Disk Access** so it can read and write files across your system, **Accessibility access** so it can click, type, and control apps. You'll find all three in **System Settings > Privacy & Security**.

---

## Step 8 -- Verify Everything is Running

```bash
openclaw gateway status
openclaw doctor
openclaw health
```

If health shows "no auth configured", go back and set your API key.

To open the dashboard in your browser:

```bash
openclaw dashboard
```

This opens the web-based Control UI in your browser at `http://127.0.0.1:18789/`. If it loads, your gateway is working correctly and you can already chat with OpenClaw directly from the browser without any channel setup.

**Do not** just type `http://127.0.0.1:18789` manually in your browser. You will get a "gateway token missing" error. Use `openclaw dashboard` instead -- this opens a tokenized URL with your gateway token included. Bookmark it.

---

## Step 9 -- Set Up Telegram (Recommended First Channel)

Do this on your phone where Telegram is already installed. Open Telegram and search for **@BotFather** -- look for the blue checkmark to make sure it's the real one. Tap Start to begin. Type `/newbot` and send it. BotFather will ask for a display name -- type your chosen agent name (e.g. Atlas, Jarvis, Friday). Then it will ask for a username, which must end in "bot" and be globally unique. BotFather will respond with a success message that includes your bot token.

Paste that token when OpenClaw asks for it during channel setup. Then:

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

Now message your bot in Telegram and it will respond.

---

## Step 10 -- Security Hardening (Don't Skip This)

Enable macOS Firewall: **System Settings > Network > Firewall** -- turn it on. Make sure `gateway.bind` is set to loopback in your config -- this means the gateway only accepts connections from your own machine. Also verify token authentication is configured: as of v2026.1.29, auth mode "none" has been removed entirely.

Run a security audit:

```bash
openclaw security audit --deep
openclaw security audit --fix
```

The audit catches common misconfigurations -- open DM policies, exposed gateway, weak permissions. The `--fix` flag auto-tightens what it can.

For remote access, use **Tailscale** -- it's free, secure, and requires no port forwarding. You can access your Mac Mini from anywhere.

---

## Troubleshooting

**"command not found: openclaw" after installing** -- Run `source ~/.zshrc` or open a new terminal window.

**Gateway dies after a config-change restart** -- Edit `~/Library/LaunchAgents/ai.openclaw.gateway.plist` and add an environment variable to make config-change restarts happen in-process instead of exiting and relying on launchd to respawn. Run `openclaw doctor` first -- it often catches and fixes this automatically.

**High API costs / runaway agent** -- Check which agents are consuming the most tokens. Disable verbose logging. Use cheaper models (Sonnet) for sub-tasks that don't need Opus-level reasoning.

**Gateway not responding** -- Run `openclaw gateway status`. If it's not running, run `openclaw gateway start`. Also check if auto-login is enabled for the agent user.

**"sharp" errors during install** -- Run: `SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest`. Also make sure Xcode Command Line Tools are installed with `xcode-select --install`.

**Old tutorial isn't working** -- If you followed an older YouTube walkthrough that configured `auth: "none"`, your gateway will not start after updating. Fix this by running `openclaw onboard` to reconfigure auth, or manually set `gateway.auth_mode` to "token" in your config and run `openclaw doctor --generate-gateway-token`.

---

## Useful Links

- GitHub: github.com/openclaw/openclaw
- Anthropic API Console: console.anthropic.com
- Homebrew: brew.sh
- Node.js: nodejs.org
- Tailscale (secure remote access): tailscale.com
- Amphetamine (sleep prevention): available on the Mac App Store
- Telegram BotFather: search @BotFather in Telegram
