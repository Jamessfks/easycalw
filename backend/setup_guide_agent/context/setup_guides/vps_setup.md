# OpenClaw VPS Setup Guide

**A complete guide to running OpenClaw on a Linux VPS for always-on, low-cost operation.**

Based on community advice, real user experiences, and verified deployment patterns.

---

## Why a VPS Instead of a Mac Mini?

Running OpenClaw on your laptop works fine for testing. But shut the lid and your agent goes dark. A VPS keeps it alive around the clock, answering messages, monitoring pipelines, and running automations while you're asleep, in a meeting, or on a flight.

It's on 24/7, very low cost (~$5-10 USD/month), accessible from anywhere, and doesn't consume resources from your main machine. The trade-off compared to a Mac Mini is that you lose native iMessage, Apple Reminders, and Calendar integrations -- but for most people running Telegram or WhatsApp, that doesn't matter.

> **Security warning:** Bitsight found over 30,000 exposed OpenClaw instances. Attackers aren't even bothering with prompt injection -- they're connecting directly to the gateway WebSocket and getting full access. This guide covers how to avoid being one of those instances.

---

## Choosing Your VPS Provider

Based on what the community actually uses:

- **Hetzner's CPX31** is the personal pick of many users for daily use -- dedicated AMD EPYC vCPUs, NVMe storage, and EU data residency if that matters to you.
- **DigitalOcean** is the right call if you want to skip most of this guide -- their 1-Click OpenClaw deployment handles a lot of the setup automatically.

**Important caveat on DigitalOcean's 1-Click:** It currently only supports Anthropic and Gradient AI as providers -- OpenAI models are listed as "coming soon". Community users have also reported that the self-update script doesn't always work reliably, so if you need full model flexibility or want to stay current easily, a manual install is the more stable path.

**Hardware minimums people have found in practice:** The hard floor is 2 vCPU and 4GB RAM. Below that, Docker becomes unstable during skill loading. At 4GB you can run a text-only agent reliably. Browser automation needs 8GB. Don't cheap out on RAM -- it's the first thing you'll regret.

A popular price breakdown from the community:

- **Hetzner CX11** (~EUR4/month, 2GB RAM) is good for trying OpenClaw or light personal use -- add swap to reduce OOM risk. CX21 (~EUR5-6/month, 4GB RAM) is recommended for production, multiple channels, or several ClawHub skills.
- **Hostinger KVM 2** ($8.99/month, 2 vCPU, 8GB RAM) is a solid sweet spot -- enough to run OpenClaw plus Ollama with a small local model.
- **DigitalOcean, Contabo, and Vultr** all work -- Linux VPS $4-12/month from any of them gets the job done.

**Ubuntu 22.04 LTS is what the vast majority of community setups use.** Ubuntu 24.04 also works fine.

---

## Before You Start -- The Easy Path

The DigitalOcean 1-Click and App Platform deployments handle many security best practices for you automatically -- including authenticated communication (the Droplet generates an OpenClaw gateway token), hardened firewall rules that rate-limit OpenClaw ports, non-root user execution, and Docker container isolation. If you want the simplest possible start and are happy using Anthropic as your AI provider, use that.

For everyone else doing a manual install, continue below.

---

## Step 1 -- Provision Your Server

Log into your VPS provider, create a new server, and choose Ubuntu 22.04 LTS. When setting up access, **use an SSH key rather than a password** -- it's more secure and saves you typing on every connection.

Once your server is up, note its public IP address and connect from your terminal:

```bash
ssh root@your-server-ip
```

---

## Step 2 -- Update the Server and Create a Dedicated User

Update packages first and, if prompted to reboot, do it:

```bash
apt update && apt upgrade -y
```

Running OpenClaw as root is not recommended. Create a non-root user with sudo access:

```bash
adduser openclaw
usermod -aG sudo openclaw
```

Copy your SSH key to the new user so you can log back in without a password:

```bash
rsync --archive --chown=openclaw:openclaw ~/.ssh /home/openclaw
```

Switch to the new user for all remaining steps:

```bash
su - openclaw
```

From here on, run everything as this user, not root. Every command that needs elevated privileges will use `sudo`.

---

## Step 3 -- Install screen (Do This First)

Before anything else, install `screen` so your session survives any SSH disconnections during the install process:

```bash
sudo apt install -y screen
screen -S openclaw
```

If your SSH connection drops at any point, reconnect to your VPS, run `su - openclaw`, then `screen -rd openclaw` to pick up where you left off.

---

## Step 4 -- Install Node.js

OpenClaw requires Node.js 22+. Install it from the NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

You should see `v22.x.x` or higher. This method installs Node system-wide to `/usr/bin/node`, which is important -- the systemd service in Step 8 depends on it being in that location. Do not use nvm for a systemd-based VPS setup, as nvm installs Node into your home directory and the service will fail to find it.

---

## Step 5 -- Install OpenClaw

Run the one-line installer:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

This process can take anywhere from 10 to 30 minutes or more depending on the dependencies needed. Once complete, it will go directly to the onboarding process.

If the install completes but onboarding doesn't start automatically, verify first:

```bash
openclaw --version
```

If you see `bash: openclaw: command not found` after installation, the binary isn't in your PATH yet. Fix it by running `source ~/.bashrc`, then try `openclaw --version` again.

---

## Step 6 -- Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The wizard walks you through everything. Here's what real users recommend at each step:

- **Security warning:** Read it and select Yes to continue.
- **Onboarding mode:** Select QuickStart for the easiest setup. If you want manual control over every option, choose Manual.
- **Gateway mode:** Choose Local gateway (this machine). It might seem counterintuitive at first, but you want the gateway to run locally on the VPS.
- **Gateway bind mode:** When it asks about the gateway bind mode, pick loopback. This is critical. It binds the gateway to 127.0.0.1 only. A lot of people pick "LAN" because they want to access the dashboard from their browser -- that binds the gateway to 0.0.0.0, meaning every network interface on the machine. Don't do that.
- **AI provider:** Enter your Anthropic API key from console.anthropic.com. Anthropic's Claude is the most capable for complex tasks and follows instructions precisely. Google Gemini Flash is the cheapest option for high-volume use. Set a monthly spending cap before you start -- a misconfigured agent or runaway loop can burn through credits fast. Start conservative at $20-$50/month.
- **Messaging channels:** Start with just Telegram. Don't overthink the channel selection -- you can add more later. Start simple and get the basics working first.
- **Workspace directory:** Accept the default or set it to something like `/home/openclaw/clawd`.

Once onboarding completes, verify the gateway is bound correctly:

```bash
openclaw gateway status
```

You should see the gateway bound to `127.0.0.1:18789`. If it shows `0.0.0.0:18789`, fix that immediately -- the gateway would be publicly accessible without authentication. Fix it by running `openclaw configure` and selecting the loopback bind option.

---

## Step 7 -- Lock Down the Firewall

Lock down ingress traffic with UFW -- allow only SSH, HTTP, and HTTPS:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw limit 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Verify the rules are active:

```bash
sudo ufw status verbose
```

**Never run `sudo ufw allow 18789`** -- the gateway port should never be open to the public internet. All external access goes through Nginx (Step 9) or an SSH tunnel.

---

## Step 8 -- Set Up systemd So OpenClaw Runs 24/7

Right now OpenClaw stops when you close your SSH session. Fix that by creating a systemd unit:

```bash
sudo nano /etc/systemd/system/openclaw.service
```

Paste this in. **Important:** The `User=` value must match exactly the username you created in Step 2. If you used `openclaw`, it should say `User=openclaw`.

```ini
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=openclaw
WorkingDirectory=/home/openclaw
ExecStart=/usr/bin/openclaw gateway start
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Save and enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable openclaw
sudo systemctl start openclaw
sudo systemctl status openclaw
```

OpenClaw now starts automatically on boot and restarts if it crashes.

To view live logs at any time:

```bash
journalctl -u openclaw -f
```

---

## Step 9 -- Add Nginx and SSL (Recommended)

Install Nginx and Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create an Nginx config file for OpenClaw:

```bash
sudo nano /etc/nginx/sites-available/openclaw
```

Paste this (replace `openclaw.yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name openclaw.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

The `proxy_read_timeout 86400` (24 hours) prevents Nginx from closing long-running WebSocket connections that OpenClaw uses for real-time messaging.

Enable the site and get your SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d openclaw.yourdomain.com
```

You must have a domain name pointed at your server's IP address before running certbot -- DNS propagation typically takes 5-30 minutes.

**No domain? Use an SSH tunnel instead.** Open a new terminal on your local machine and run:

```bash
ssh -N -L 18789:127.0.0.1:18789 openclaw@your-vps-ip
```

Leave that terminal open, then go to `http://localhost:18789` in your browser. If you're using Telegram or another messaging channel, those work fine without any web access at all.

---

## Step 10 -- Set Up Telegram

On your phone, open Telegram and search for **@BotFather** (look for the blue checkmark). Tap Start, then type `/newbot`. Give your bot a display name and a username ending in `bot`. BotFather will give you a token.

On your server, run:

```bash
openclaw channels add telegram
```

Enter the bot token when prompted. Then pair your Telegram account:

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

Send your bot a message on Telegram -- OpenClaw should respond immediately.

---

## Keeping It Updated

Check the CHANGELOG before running `npm update -g openclaw`. Breaking changes are rare but do happen -- usually around skill API changes. Test on a staging VPS first if you have critical automations running, then update production. The `Restart=on-failure` in your systemd unit means even a bad update that crashes the process won't leave you without a running service -- it'll keep retrying until you fix the config.

To update:

```bash
npm update -g openclaw
sudo systemctl restart openclaw
```

---

## Troubleshooting

**"command not found: openclaw" after install** -- Run `source ~/.bashrc` or open a new terminal, then try `openclaw --version` again.

**Gateway not running / won't start** -- Check logs with `journalctl -u openclaw -n 50`. Run `systemctl status openclaw` to see the current state. Most failures are a missing API key or a port conflict.

**Gateway stops when SSH session closes** -- You haven't set up systemd yet, or it isn't running. Check with `systemctl status openclaw`. If systemd user services aren't available on your VPS, use screen as a fallback: `screen -S openclaw openclaw gateway`, then detach with Ctrl+A, D.

**Nginx 502 Bad Gateway** -- The OpenClaw gateway isn't running. Run `openclaw gateway status` and check systemd logs.

**Dashboard won't load after setting up Nginx** -- Check three things: (1) Is the gateway running? Run `systemctl status openclaw`. (2) Did you add the `?token=` parameter to the URL? (3) Did you add the WebSocket headers (`Upgrade` and `Connection "upgrade"`) to your Nginx config? Missing those is the most common cause of a dashboard that loads but feels broken.

**Telegram bot not responding** -- Verify the bot token is correct with `openclaw channels list`. Also check that your VPS can reach `api.telegram.org` -- some providers block outbound traffic by default.

**Certificate renewal failing** -- Run `sudo certbot renew --dry-run` to debug. Certbot needs ports 80 and 443 open and Nginx running.

**Old tutorial with `auth: "none"` stopped working** -- As of v2026.1.29, auth mode "none" was permanently removed. Re-run `openclaw onboard` to reconfigure auth, or run `openclaw doctor --generate-gateway-token` to fix it.

**EACCES / permission errors with npm** -- Never use `sudo npm install`. Instead fix ownership with `sudo chown -R $(whoami) ~/.npm`.

**controlUI config error in logs** -- If you see an error about `controlUI` (capital U), ignore it -- the correct config key uses lowercase `controlUi`. This is a known bug in the error message as of version 2026.2.24.

**Do not expose your OpenClaw to the public.** No group chats with strangers, no auto-replying to tweets, no letting others interact with your bot. Prompt injection equals full access to your digital life.

---

## Useful Links

- GitHub: github.com/openclaw/openclaw
- Anthropic API Console: console.anthropic.com
- DigitalOcean OpenClaw tutorial
- digitalocean.com/community/tutorials/how-to-run-openclaw
- Hetzner Cloud: hetzner.com/cloud
- Hostinger VPS: hostinger.com
- NodeSource (Node.js install for Ubuntu): github.com/nodesource/distributions
- Tailscale (secure remote access, replaces SSH tunnels): tailscale.com
- Telegram BotFather: search @BotFather in Telegram
