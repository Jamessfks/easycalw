# Running OpenClaw on Your Existing Mac

**A practical guide for installing and managing OpenClaw on a Mac you use every day.**

This guide is for anyone who wants to run OpenClaw on the same Mac they use for work, browsing, creative projects, and everything else. It does not assume a dedicated Mac Mini sitting in a closet. It is honest about the trade-offs and tells you when it is time to upgrade.

---

## Table of Contents

1. [Why Run on Your Existing Mac](#1--why-run-on-your-existing-mac)
2. [Prerequisites and System Requirements](#2--prerequisites-and-system-requirements)
3. [Before You Start -- Important Considerations](#3--before-you-start----important-considerations)
4. [Step-by-Step Installation](#4--step-by-step-installation)
5. [Configuration for Non-Dedicated Machines](#5--configuration-for-non-dedicated-machines)
6. [Setting Up Messaging Channels](#6--setting-up-messaging-channels)
7. [Security Hardening](#7--security-hardening)
8. [Managing OpenClaw Alongside Daily Use](#8--managing-openclaw-alongside-daily-use)
9. [Troubleshooting](#9--troubleshooting)
10. [When to Upgrade to Dedicated Hardware](#10--when-to-upgrade-to-dedicated-hardware)

---

## 1 | Why Run on Your Existing Mac

### Advantages

- **Zero extra cost.** No new hardware purchase. Your M1/M2/M3/M4 Mac already has the compute you need.
- **Fastest path to trying OpenClaw.** You can be running in under 10 minutes.
- **Access to macOS-native channels.** iMessage integration requires a macOS device. If your Mac is the only Apple hardware you own, this is your only option.
- **Familiar environment.** You already know your machine, your network, your shell setup.

### Trade-offs to Accept

- **Not 24/7.** When your Mac sleeps (lid closed on a laptop, idle timeout on a desktop), the gateway stops responding to messages. People who message your bot while it is asleep will not get a reply until it wakes.
- **Shared resources.** If you are running Xcode builds, Docker containers, video editing, or other heavy workloads, OpenClaw will compete for RAM and CPU.
- **Battery impact (laptops).** The gateway process and periodic heartbeats will consume some battery. Not catastrophic, but noticeable on long flights.
- **Security surface.** OpenClaw runs on the same machine as your personal data, browser sessions, and credentials. This requires deliberate permission scoping.

### Who This Setup Works Well For

- Individuals who want a personal AI assistant reachable through WhatsApp or Telegram during their working hours.
- Developers who want to experiment with OpenClaw before committing to dedicated hardware.
- Anyone whose "always-on" requirement is really "on when I am at my desk" (8--16 hours per day).

---

## 2 | Prerequisites and System Requirements

### Hardware

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Mac** | Any Apple Silicon Mac (M1+) | M2 or newer |
| **RAM** | 8 GB | 16 GB or more |
| **Disk** | 2 GB free | 5 GB free (for sessions, logs, media) |
| **macOS** | macOS 13 Ventura | macOS 14 Sonoma or macOS 15 Sequoia |

Intel Macs will work but are not recommended for long-term use due to higher power consumption and thermal output.

### Software

- **Node.js**: Node 24 (recommended) or Node 22 LTS (22.16+)
- **Xcode Command Line Tools**: Required for native module compilation
- **Homebrew**: Recommended for managing Node.js via nvm
- **A provider API key**: At least one -- OpenAI, Anthropic, or Google

### Resource Budget

When idle (no active conversations), the OpenClaw gateway typically uses:

- **RAM:** 300--500 MB
- **CPU:** Near zero (sub-1%)
- **Network:** Minimal keep-alive traffic to channels

During active conversations, expect spikes to 500--800 MB RAM and brief CPU bursts as the gateway processes messages and routes them to your model provider. The actual LLM inference happens on the provider's servers, not your Mac.

**Known issue:** Some users have reported memory accumulation over long sessions (1.9 GB+ after 13 hours of continuous use). The mitigation is covered in Section 5 under scheduled restarts.

---

## 3 | Before You Start -- Important Considerations

### Understand What "Gateway" Means

OpenClaw runs as a single **Gateway** process on your Mac. It is a Node.js application that:

1. Maintains persistent connections to your messaging channels (WhatsApp, Telegram, Discord, etc.)
2. Routes incoming messages to your configured AI model provider (OpenAI, Anthropic, Google)
3. Returns the model's response back through the channel

Your Mac is the relay. The heavy computation (LLM inference) happens on the provider's cloud. This is why the local resource footprint is modest.

### The Sleep Problem

This is the single biggest issue for non-dedicated machines.

**Laptops:** When you close the lid, macOS suspends all processes. The gateway stops. Channel connections drop. Messages sent to your bot during sleep are queued on the provider's side (Telegram, Discord) or lost (WhatsApp Web). When you open the lid, launchd restarts the gateway, channel connections re-establish, and queued messages are delivered. This takes 5--30 seconds depending on your network.

**Desktops (iMac, Mac Studio, Mac Pro):** These sleep after an idle timeout. The same problem applies, but you have more control because there is no lid. You can configure longer idle timeouts or prevent sleep entirely when plugged in.

**The practical reality:** If you are at your desk and your Mac is awake, OpenClaw works perfectly. If you step away for lunch and your Mac sleeps, messages queue up. Most people find this acceptable for a personal assistant. If you need 24/7 uptime, see Section 10.

### Laptop vs. Desktop Differences

| Concern | Laptop | Desktop |
|---------|--------|---------|
| Sleep trigger | Lid close + idle timeout | Idle timeout only |
| Battery drain | Yes, when unplugged | N/A |
| Can prevent all sleep? | Not practical (battery, thermals) | Yes, when plugged in |
| Network stability | Changes with WiFi, VPN, locations | Usually stable |
| Recommended approach | Run when at desk, accept downtime | Extend idle timeout, optional "always on" |

---

## 4 | Step-by-Step Installation

### Step 4.1: Install Xcode Command Line Tools

If you have not already installed them:

```bash
xcode-select --install
```

Click "Install" in the dialog that appears. This provides `git`, `make`, and compilers needed for native Node.js modules.

### Step 4.2: Install Homebrew

If not already installed:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the post-install instructions to add Homebrew to your PATH.

### Step 4.3: Install Node.js

Use nvm (Node Version Manager) for easy version management:

```bash
# Install nvm
brew install nvm

# Follow the output instructions to add nvm to your shell profile, then:
nvm install 24
nvm use 24
nvm alias default 24

# Verify
node --version   # Should show v24.x.x
```

### Step 4.4: Install OpenClaw

**Option A -- Installer script (recommended):**

```bash
curl -fsSL https://get.openclaw.ai | bash
```

**Option B -- npm:**

```bash
npm install -g openclaw@latest
```

Verify the installation:

```bash
openclaw --version
```

### Step 4.5: Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

This interactive wizard will:

1. Create your configuration file at `~/.openclaw/config.yaml`
2. Ask for your AI provider API key
3. Install the **launchd daemon** (macOS background service manager)
4. Start the gateway process

The daemon installation is what makes OpenClaw start automatically when you log in and restart if it crashes.

### Step 4.6: Verify Everything Works

```bash
# Check gateway is running
openclaw gateway status

# Run diagnostics
openclaw doctor

# Open the dashboard
openclaw dashboard
```

The dashboard opens at `http://127.0.0.1:18789/`. You should see the gateway status as healthy and your configured model provider connected.

---

## 5 | Configuration for Non-Dedicated Machines

These tweaks are specifically for machines that are not always-on servers.

### 5.1 Power Management

#### For Laptops

Do **not** disable all sleep on a laptop. Your battery and thermals will suffer. Instead, use a selective approach:

**Option A -- Amphetamine (recommended for laptops):**

Install [Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704) from the Mac App Store (free). Configure a trigger that keeps your Mac awake while OpenClaw is running:

1. Open Amphetamine and go to Preferences > Triggers
2. Create a new trigger: "While OpenClaw is running"
3. Set the trigger condition to: Application > "node" is running
4. Enable "Allow display to sleep" (saves power -- the gateway does not need the screen)
5. Set "Allow system to sleep on battery after: 30 minutes" (safety net for when you unplug)

This keeps the gateway alive while your Mac is plugged in and you are working, but allows normal sleep when you unplug and walk away.

**Option B -- caffeinate (command line, no extra software):**

The built-in `caffeinate` command can prevent sleep while a specific process runs:

```bash
# Prevent system sleep while the gateway PID is alive
# -i = prevent idle sleep, -w = watch a process
caffeinate -i -w $(pgrep -f "openclaw") &
```

This automatically stops when the gateway stops. You can add this to a login script, but Amphetamine's trigger approach is more reliable and does not require terminal management.

**Option C -- pmset (for when you are at your desk):**

```bash
# Check current settings
pmset -g

# When on AC power: prevent sleep, but allow display to sleep after 10 min
sudo pmset -c sleep 0 displaysleep 10

# When on battery: allow normal sleep (preserve battery)
sudo pmset -b sleep 15 displaysleep 5
```

This approach is blunt -- it affects all applications, not just OpenClaw. Use Amphetamine for more targeted control.

#### For Desktops

Desktops do not have battery concerns. You can be more aggressive:

```bash
# Prevent system sleep when on AC power (desktops are always on AC)
sudo pmset -c sleep 0 displaysleep 10

# Enable wake-on-network (wake when network traffic arrives)
sudo pmset -c womp 1

# Disable Power Nap if you don't want background updates
sudo pmset -c powernap 0
```

### 5.2 Heartbeat and Reconnection

Configure longer heartbeat intervals to reduce overhead on a shared machine:

```yaml
# ~/.openclaw/config.yaml
heartbeat:
  enabled: true
  interval: 300s        # 5 minutes instead of default 60s
  timeout: 15s
  on_failure: restart_channel
```

### 5.3 Scheduled Gateway Restarts

To mitigate the known memory accumulation issue, schedule a daily restart during off-hours:

```yaml
# ~/.openclaw/config.yaml
cron:
  - name: daily_restart
    schedule: "0 4 * * *"    # 4 AM daily
    action: run_command
    command: "openclaw gateway restart"
```

Alternatively, add a macOS launchd calendar interval or a crontab entry:

```bash
# Add to crontab (crontab -e)
0 4 * * * /usr/local/bin/openclaw gateway restart >> /tmp/openclaw-restart.log 2>&1
```

### 5.4 Model Selection for Cost and Efficiency

On a daily-driver Mac, you are likely running OpenClaw for personal use, not serving hundreds of users. Choose models that balance cost and quality:

```yaml
# ~/.openclaw/config.yaml
models:
  # Primary: good balance of speed and quality
  - provider: anthropic
    api_key: ${{ env.ANTHROPIC_API_KEY }}
    model: claude-sonnet-4-20250514
    priority: 1

  # Fallback: cheaper for simple queries
  - provider: anthropic
    api_key: ${{ env.ANTHROPIC_API_KEY }}
    model: claude-haiku-4-20250514
    priority: 2
    failover:
      max_retries: 2
```

For cost-sensitive setups, use the multi-agent routing to send simple queries to cheaper models:

```yaml
agents:
  - name: quick_answers
    model: claude-haiku-4-20250514
    match:
      keywords: ["what is", "define", "translate", "convert"]

  - name: deep_work
    model: claude-sonnet-4-20250514
    match:
      fallback: true
```

**Cost perspective:** Claude Haiku costs roughly 1/10th of Claude Sonnet. For a personal assistant handling 50--100 messages per day, expect $5--15/month with Sonnet, or under $2/month with Haiku for routine queries.

### 5.5 Session Configuration for Personal Use

```yaml
sessions:
  mode: per_sender
  ttl: 24h
  max_history: 100
  persistence: sqlite
  storage_path: ~/.openclaw/sessions.db

  # Summarize old messages to keep context windows small
  summarize:
    enabled: true
    after: 50
    model: claude-haiku-4-20250514    # Use cheap model for summarization
```

### 5.6 Config Hot Reload

Enable auto-reload so you can tweak settings without restarting the gateway:

```yaml
gateway:
  reload: auto
  port: 18789
  host: 127.0.0.1
```

---

## 6 | Setting Up Messaging Channels

### Telegram (Recommended Starting Channel)

Telegram is the easiest channel to set up and works reliably with intermittent gateway availability (messages queue when your gateway is offline).

1. Open Telegram and message **@BotFather**
2. Send `/newbot` and follow the prompts to name your bot
3. Copy the bot token
4. Add to your environment and config:

```bash
# Add to ~/.zshrc or ~/.bashrc
export TELEGRAM_BOT_TOKEN="123456:ABC-DEF..."
```

```yaml
# ~/.openclaw/config.yaml
channels:
  telegram:
    enabled: true
    bot_token: ${{ env.TELEGRAM_BOT_TOKEN }}
```

5. Restart the gateway:

```bash
openclaw gateway restart
openclaw channel test telegram
```

**Why Telegram first:** Telegram queues messages server-side. If your Mac is asleep when someone messages the bot, the message is delivered when the gateway reconnects. WhatsApp Web and Discord have less reliable queuing behavior.

### Discord

1. Create an application at https://discord.com/developers
2. Create a bot, copy the token
3. Enable the MESSAGE CONTENT intent under the Bot settings
4. Invite the bot to your server using the OAuth2 URL generator

```yaml
channels:
  discord:
    enabled: true
    bot_token: ${{ env.DISCORD_BOT_TOKEN }}
    application_id: ${{ env.DISCORD_APP_ID }}
```

### WhatsApp

WhatsApp requires more setup (Meta Business account, Business API access) but is the most common personal messaging channel. See the full documentation at https://docs.openclaw.ai/channels for the detailed WhatsApp setup.

### Adding Channels Later

You can add channels at any time through the config file or the dashboard UI. Each channel runs independently -- adding or removing one does not affect the others.

---

## 7 | Security Hardening

Running OpenClaw on a machine with your personal data requires extra care.

### 7.1 Always Use an Allowlist

Never run with `access.dm.mode: open` on a personal machine. Always restrict who can message your bot:

```yaml
access:
  dm:
    mode: allowlist
    allowlist:
      - "+1234567890"        # Your personal phone number
      - "yourusername@telegram"
  groups:
    require_mention: true
    allowed_groups: []       # No groups by default
```

### 7.2 Use the macOS Keychain for Secrets

Instead of storing API keys in environment variables or config files, use the macOS Keychain backend:

```yaml
secrets:
  backend: keychain
  keychain:
    service: openclaw
```

Store your keys:

```bash
openclaw secret set anthropic_key "sk-ant-..."
openclaw secret set telegram_token "123456:ABC-DEF..."
```

Reference them in config:

```yaml
models:
  - provider: anthropic
    api_key: ${{ secret.anthropic_key }}

channels:
  telegram:
    bot_token: ${{ secret.telegram_token }}
```

### 7.3 Enable Sandboxing

Prevent the agent from accessing files outside its workspace:

```yaml
sandbox:
  enabled: true
  mode: workspace
  workspace_root: ~/.openclaw/workspaces
  per_sender: true
  allowed_paths:
    - /tmp/openclaw
  denied_commands:
    - rm -rf
    - shutdown
    - reboot
```

### 7.4 Restrict Tools

Only enable the tools you actually need:

```yaml
tools:
  allow:
    - file_read
    - web_search
    - calculator
    - datetime
  deny:
    - shell_exec      # Disable unless you specifically need it
    - file_write       # Enable only if the agent needs to create files
```

### 7.5 FileVault

Ensure FileVault is enabled on your Mac (it should be by default on modern macOS):

```bash
fdesetup status
```

If it reports "FileVault is Off", enable it in System Settings > Privacy & Security > FileVault. This encrypts your entire disk, protecting OpenClaw's session data, API keys, and logs if your Mac is lost or stolen.

### 7.6 Separate User Account (Optional)

You can run OpenClaw under a separate macOS user account for additional isolation:

**Pros:**
- OpenClaw's processes cannot access files in your primary user account
- Clear separation of environment variables, Keychain entries, and shell configuration
- You can log in as the OpenClaw user via Fast User Switching without closing your main session

**Cons:**
- Adds complexity to setup and management
- The separate user still shares the same disk (FileVault encrypts the volume, not per-user)
- An admin on the same Mac can still access the other user's files if they escalate privileges
- iMessage channel integration only works with the logged-in user's iMessage account

**Verdict:** For most personal setups, running OpenClaw in your main account with proper sandboxing and tool restrictions is sufficient. A separate user account is worth it if you share the Mac with others or if you are running OpenClaw for a team.

### 7.7 Gateway Binding

The gateway binds to `127.0.0.1` by default. This means it is only accessible from your Mac, not from other devices on the network. Do not change this unless you have a specific reason and understand the implications:

```yaml
gateway:
  host: 127.0.0.1    # Keep this as localhost
  port: 18789
```

---

## 8 | Managing OpenClaw Alongside Daily Use

### 8.1 How the Daemon Works

When you ran `openclaw onboard --install-daemon`, it created a launchd plist at:

```
~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

This tells macOS to:
- Start the gateway when you log in
- Restart it if it crashes
- Route logs to `~/.openclaw/logs/`

You can manage it with:

```bash
# Check daemon status
openclaw daemon status

# Stop the daemon (gateway stops and won't auto-restart)
openclaw daemon stop

# Start the daemon
openclaw daemon start

# Temporarily disable (won't start on next login)
launchctl unload ~/Library/LaunchAgents/ai.openclaw.gateway.plist

# Re-enable
launchctl load ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

### 8.2 Monitoring Resource Usage

Check OpenClaw's resource usage at any time:

```bash
# Quick status including resource usage
openclaw gateway status

# Detailed model usage and costs
openclaw model usage --period today

# Tail logs in real-time
openclaw gateway logs -f

# Filter for errors only
openclaw gateway logs --level error
```

For continuous monitoring, keep the dashboard open in a browser tab:

```bash
openclaw dashboard
```

You can also monitor from the command line:

```bash
# Find the gateway process and check its resource usage
ps aux | grep openclaw
```

### 8.3 Network Considerations

**WiFi switching:** When you move between WiFi networks (home, office, coffee shop), the gateway's outbound connections to channel APIs will briefly drop and reconnect. This is handled automatically. The gateway binds to `127.0.0.1`, so the local binding is not affected by network changes.

**VPN usage:** If you use a VPN, the gateway's outbound connections to Telegram, Discord, WhatsApp APIs, and model providers will route through the VPN. This is usually fine. If your VPN blocks certain ports or domains, check that the following are accessible:
- Your model provider's API endpoint (e.g., `api.anthropic.com`, `api.openai.com`)
- Your channel's API endpoint (e.g., `api.telegram.org`)

**Hotspot / tethering:** Works the same as WiFi. The gateway does not care about the network type, only that it can reach the internet.

**Firewall:** macOS may prompt you to allow incoming connections for the OpenClaw gateway the first time it starts. Since the gateway binds to localhost only, you can safely deny incoming connections from the network. The gateway initiates outbound connections to APIs; it does not need to accept inbound connections (except for WhatsApp Business API webhooks, which require a public URL or tunnel).

### 8.4 Pausing OpenClaw When You Need Full Performance

If you are about to do something resource-intensive (compile a large project, render video, run local LLMs), you can temporarily stop the gateway:

```bash
# Stop the gateway (daemon will not restart it while stopped via CLI)
openclaw gateway stop

# When you're done with the heavy work:
openclaw gateway start
```

Or, if you want the daemon to stay running but need to free resources:

```bash
# Reduce to minimal channels
openclaw config patch '{"channels": {"discord": {"enabled": false}}}'
openclaw gateway reload
```

### 8.5 Sleep/Wake Recovery

When your Mac wakes from sleep, launchd restarts the gateway automatically if it was running before sleep. Channel connections re-establish within seconds. To verify after wake:

```bash
openclaw gateway status
openclaw channel list
```

If a channel shows as disconnected after wake, restart it:

```bash
openclaw channel restart telegram
```

The heartbeat configuration (Section 5.2) handles this automatically by detecting failed channels and restarting them.

### 8.6 Keeping OpenClaw Updated

```bash
# Check for updates
openclaw --version

# Update via npm
npm update -g openclaw

# Or via the installer
curl -fsSL https://get.openclaw.ai | bash

# After update, restart the gateway
openclaw gateway restart

# Run migrations if upgrading across major versions
openclaw migrate
```

---

## 9 | Troubleshooting

### Gateway Won't Start

```bash
# Run diagnostics
openclaw doctor --fix

# Check for port conflicts
lsof -i :18789

# Check logs for errors
openclaw gateway logs -n 50 --level error

# Validate your config
openclaw config validate
```

### High Memory Usage

If the gateway is using more than 1 GB of RAM:

```bash
# Check current usage
openclaw gateway status

# Restart the gateway (clears accumulated memory)
openclaw gateway restart

# Prune old sessions
openclaw session prune --older-than 7d
```

Set up the daily restart cron job from Section 5.3 to prevent accumulation.

### Channel Disconnects After Sleep

```bash
# Check all channel statuses
openclaw channel list

# Restart a specific channel
openclaw channel restart telegram

# Test connectivity
openclaw channel test telegram
```

If this happens frequently, increase the heartbeat frequency temporarily:

```yaml
heartbeat:
  interval: 120s    # Check every 2 minutes instead of 5
  on_failure: restart_channel
```

### Messages Not Delivered While Mac Was Asleep

This is expected behavior for a non-dedicated machine. Telegram and Discord queue messages server-side -- they will be delivered when the gateway reconnects. WhatsApp Web messages may be lost if the session times out during extended sleep.

**Mitigation:** If you need messages to be held reliably, Telegram is the most forgiving channel for intermittent availability.

### Node.js Version Issues

```bash
# Check your Node version
node --version

# If wrong version, use nvm to switch
nvm use 24

# If nvm is not installed
brew install nvm
nvm install 24
```

### `openclaw` Command Not Found After Installation

```bash
# Check where it was installed
which openclaw || npm root -g

# Add to PATH if needed (add to ~/.zshrc)
export PATH="$PATH:$(npm root -g)/../bin"

# Reload shell
source ~/.zshrc
```

### Battery Draining Faster Than Expected (Laptops)

1. Check that Amphetamine or caffeinate is not preventing sleep when you are on battery
2. Reduce heartbeat frequency: `heartbeat.interval: 600s`
3. Disable channels you are not actively using
4. Check for runaway sessions: `openclaw session list`
5. If still an issue, stop the daemon when on battery and run manually when needed

---

## 10 | When to Upgrade to Dedicated Hardware

Running OpenClaw on your daily-driver Mac is a great starting point. Here are the signals that it is time to move to dedicated hardware:

### You Should Upgrade When...

| Signal | Why It Matters |
|--------|---------------|
| **You miss messages because your Mac was asleep** | You need an always-on setup. A sleeping laptop cannot receive messages. |
| **Team members depend on the bot** | Other people relying on your personal Mac's uptime is fragile. One restart, one lid close, and the team is stuck. |
| **You are running 3+ channels** | Each channel adds memory overhead and reconnection complexity after sleep. |
| **Your Mac regularly runs hot or sluggish** | The gateway plus your daily workloads are competing. A dedicated machine eliminates contention. |
| **You need 24/7 cron jobs or automations** | Scheduled tasks do not run while your Mac is asleep. If a 4 AM cron job matters, you need an always-on machine. |
| **Security requirements increase** | Shared machines are harder to audit. A dedicated machine with a single purpose is easier to lock down. |
| **API costs exceed $50/month** | At this spending level, the $300--600 cost of a Mac Mini pays for itself in operational reliability. |

### Upgrade Options

| Option | Cost | Best For |
|--------|------|----------|
| **Mac Mini (M4, 16 GB)** | ~$500 | The community standard. Silent, low power (15W idle), runs 24/7, supports iMessage channel natively. |
| **Mac Mini (M4 Pro, 24 GB)** | ~$800 | Multiple agents, heavy plugin usage, local model experimentation. |
| **VPS (DigitalOcean, Hetzner)** | $5--20/month | Cheapest always-on option. No iMessage support. Good for Telegram/Discord/WhatsApp only. |
| **Docker on existing home server** | Free (if you have one) | If you already run a home server, add OpenClaw as a container. |

### Migration Path

Moving from your Mac to a dedicated machine is straightforward:

```bash
# On your current Mac: export your config
cp ~/.openclaw/config.yaml ~/Desktop/openclaw-config-backup.yaml

# On the new machine: install OpenClaw
curl -fsSL https://get.openclaw.ai | bash
openclaw onboard --install-daemon

# Copy your config
cp openclaw-config-backup.yaml ~/.openclaw/config.yaml

# Update environment variables on the new machine
# Then start the gateway
openclaw gateway restart
openclaw doctor
```

### The Hybrid Approach

Many users keep OpenClaw on their daily Mac for development and testing, then deploy a "production" instance on a Mac Mini or VPS. The two instances use different channel connections (e.g., Telegram bot A on your Mac for testing, Telegram bot B on the Mini for production).

---

## Quick Reference Card

| Item | Value / Command |
|------|----------------|
| **Config file** | `~/.openclaw/config.yaml` |
| **Data directory** | `~/.openclaw/` |
| **Dashboard URL** | `http://127.0.0.1:18789` |
| **Gateway port** | 18789 |
| **Daemon plist** | `~/Library/LaunchAgents/ai.openclaw.gateway.plist` |
| **Start gateway** | `openclaw gateway start` |
| **Stop gateway** | `openclaw gateway stop` |
| **Check status** | `openclaw gateway status` |
| **Run diagnostics** | `openclaw doctor` |
| **Validate config** | `openclaw config validate` |
| **View logs** | `openclaw gateway logs -f` |
| **Restart channel** | `openclaw channel restart <name>` |
| **Update OpenClaw** | `npm update -g openclaw` |
| **Full docs** | https://docs.openclaw.ai |

---

## Recommended Config for a Daily-Driver Mac

Copy this as a starting point for personal use on a non-dedicated machine:

```yaml
# ~/.openclaw/config.yaml -- Daily-Driver Mac Setup

gateway:
  port: 18789
  host: 127.0.0.1
  reload: auto
  log_level: info
  graceful_shutdown: 15s

models:
  - provider: anthropic
    api_key: ${{ secret.anthropic_key }}
    model: claude-sonnet-4-20250514
    priority: 1
    timeout: 60s

channels:
  telegram:
    enabled: true
    bot_token: ${{ secret.telegram_token }}

access:
  dm:
    mode: allowlist
    allowlist:
      - "yourusername@telegram"
  groups:
    require_mention: true
    allowed_groups: []

sessions:
  mode: per_sender
  ttl: 24h
  max_history: 100
  persistence: sqlite
  storage_path: ~/.openclaw/sessions.db
  summarize:
    enabled: true
    after: 50
    model: claude-haiku-4-20250514

sandbox:
  enabled: true
  mode: workspace
  workspace_root: ~/.openclaw/workspaces
  per_sender: true

tools:
  allow:
    - file_read
    - web_search
    - calculator
    - datetime
    - memory_store
    - memory_recall

heartbeat:
  enabled: true
  interval: 300s
  timeout: 15s
  on_failure: restart_channel

health:
  enabled: true
  port: 18790
  interval: 60s

secrets:
  backend: keychain
  keychain:
    service: openclaw

cron:
  - name: daily_restart
    schedule: "0 4 * * *"
    action: run_command
    command: "openclaw gateway restart"

  - name: weekly_prune
    schedule: "0 3 * * 0"
    action: run_command
    command: "openclaw session prune --older-than 14d"
```

---

*This guide reflects OpenClaw documentation and community experience as of March 2026. For the latest information, visit https://docs.openclaw.ai.*
