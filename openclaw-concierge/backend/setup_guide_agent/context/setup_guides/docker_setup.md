# OpenClaw Docker Setup Guide

**A complete guide to running OpenClaw inside Docker containers for isolation, portability, and easy management.**

---

## Table of Contents

1. [Why Docker?](#1--why-docker)
2. [Prerequisites](#2--prerequisites)
3. [Quick Start (Official Image)](#3--quick-start-official-image)
4. [Manual Setup: Custom Dockerfile](#4--manual-setup-custom-dockerfile)
5. [Docker Compose Setup](#5--docker-compose-setup)
6. [Configuration](#6--configuration)
7. [Volume Mounts](#7--volume-mounts)
8. [Networking](#8--networking)
9. [Setting Up Messaging Channels](#9--setting-up-messaging-channels)
10. [Production Stack: Nginx + SSL](#10--production-stack-nginx--ssl)
11. [Host OS Considerations](#11--host-os-considerations)
12. [Security Considerations](#12--security-considerations)
13. [Updating OpenClaw in Docker](#13--updating-openclaw-in-docker)
14. [Resource Limits](#14--resource-limits)
15. [Troubleshooting](#15--troubleshooting)
16. [Useful Commands Reference](#16--useful-commands-reference)

---

## 1 | Why Docker?

Running OpenClaw inside a Docker container provides several advantages over bare-metal installation:

- **Isolation** -- the gateway process cannot access your host filesystem or other services unless you explicitly mount volumes or expose ports
- **Portability** -- the same container image runs identically on macOS, Linux, and Windows, eliminating "works on my machine" issues
- **Reproducibility** -- pin a specific image tag to guarantee the exact same environment across deployments
- **Easy updates** -- pull the new image, restart the container, done. Roll back by switching to the previous tag
- **Clean uninstall** -- remove the container and volume; nothing is left on the host
- **Resource limits** -- cap CPU and memory so OpenClaw cannot starve other services on the machine
- **Multi-instance** -- run multiple OpenClaw gateways on different ports with separate configs, useful for staging/production or multi-tenant setups

### Trade-offs

- **No iMessage channel** -- iMessage requires a macOS host. Docker runs Linux containers.
- **Slightly more complex setup** -- configuration happens through environment variables and mounted files rather than the interactive wizard.
- **Networking for webhooks** -- channels that require inbound webhooks (WhatsApp) need the container port reachable from the internet.

---

## 2 | Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Docker Engine | 20.10+ |
| Docker Compose | v2.0+ (ships with Docker Desktop) |
| Available port | 18789 (gateway default) |
| Provider API key | At least one (Anthropic, OpenAI, Google) |

**Installation links:**
- macOS / Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/) + [Docker Compose plugin](https://docs.docker.com/compose/install/linux/)

Verify your installation:

```bash
docker --version
docker compose version
```

---

## 3 | Quick Start (Official Image)

OpenClaw publishes an official container image to the GitHub Container Registry.

```bash
# Pull the latest image
docker pull ghcr.io/openclaw-ai/openclaw:latest

# Run the gateway
docker run -d \
  --name openclaw \
  -p 18789:18789 \
  -v openclaw-data:/root/.openclaw \
  -e ANTHROPIC_API_KEY="sk-ant-your-key-here" \
  ghcr.io/openclaw-ai/openclaw:latest
```

Verify it is running:

```bash
docker logs openclaw
docker exec openclaw openclaw gateway status
```

Open the dashboard at `http://127.0.0.1:18789/` in your browser.

### Image Tags

| Tag | Description |
|-----|-------------|
| `latest` | Most recent stable release |
| `x.y.z` (e.g. `1.5.2`) | Pinned version -- recommended for production |
| `edge` | Latest commit on main -- unstable, for testing only |

Pin a version in production:

```bash
docker pull ghcr.io/openclaw-ai/openclaw:1.5.2
```

---

## 4 | Manual Setup: Custom Dockerfile

If you need a custom image (extra system packages, local plugins, bundled config), build your own.

### Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    ca-certificates \
    tini \
  && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd --gid 1001 openclaw \
  && useradd --uid 1001 --gid openclaw --shell /bin/bash --create-home openclaw

# Install OpenClaw globally
RUN npm install -g openclaw@latest

# Set up the data directory
RUN mkdir -p /home/openclaw/.openclaw \
  && chown -R openclaw:openclaw /home/openclaw/.openclaw

# Switch to non-root user
USER openclaw
WORKDIR /home/openclaw

# Environment
ENV OPENCLAW_HOME=/home/openclaw/.openclaw
ENV NODE_ENV=production

# Expose the gateway port
EXPOSE 18789

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start the gateway in the foreground
CMD ["openclaw", "gateway", "start", "--foreground"]
```

### .dockerignore

```
node_modules
.git
.env
*.log
```

### Build and Run

```bash
docker build -t openclaw-custom:latest .

docker run -d \
  --name openclaw \
  -p 18789:18789 \
  -v openclaw-data:/home/openclaw/.openclaw \
  -e ANTHROPIC_API_KEY="sk-ant-your-key-here" \
  openclaw-custom:latest
```

---

## 5 | Docker Compose Setup

Docker Compose is the recommended way to run OpenClaw in Docker.

### docker-compose.yml

```yaml
version: "3.9"

services:
  openclaw:
    image: ghcr.io/openclaw-ai/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    ports:
      - "18789:18789"
    volumes:
      - openclaw-data:/root/.openclaw
    env_file:
      - .env
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "openclaw", "gateway", "status", "--json"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

volumes:
  openclaw-data:
    driver: local
```

### .env file

Create a `.env` file in the same directory (**add to .gitignore**):

```bash
# --- Model Provider Keys ---
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
OPENAI_API_KEY=sk-your-openai-key

# --- Telegram (recommended first channel) ---
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# --- WhatsApp (optional) ---
WA_PHONE_ID=1234567890
WA_TOKEN=EAAx...
WA_VERIFY_TOKEN=my-verify-token

# --- Discord (optional) ---
DISCORD_BOT_TOKEN=MTIz...
DISCORD_APP_ID=1234567890
```

### Start / Stop

```bash
docker compose up -d              # Start
docker compose logs -f openclaw   # View logs
docker compose down               # Stop
docker compose down -v            # Stop and remove volumes (WARNING: deletes all data)
```

---

## 6 | Configuration

### Running the Onboarding Wizard

If you prefer interactive setup:

```bash
docker exec -it openclaw openclaw onboard
```

This writes `config.yaml` into the volume, which persists across restarts.

### Mounting a Custom Config File

If you have a pre-built `config.yaml`, bind-mount it:

```yaml
services:
  openclaw:
    volumes:
      - openclaw-data:/root/.openclaw
      - ./config.yaml:/root/.openclaw/config.yaml:ro
```

The `:ro` flag makes the config read-only inside the container. OpenClaw resolves `${{ env.VAR }}` references from the container's environment at runtime, so secrets stay in the `.env` file.

### Validating Config

```bash
docker exec openclaw openclaw config validate
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_HOME` | `~/.openclaw` | Base directory for all data and config |
| `OPENCLAW_STATE_DIR` | `$OPENCLAW_HOME` | Directory for runtime state (PID, locks) |
| `OPENCLAW_CONFIG_PATH` | `$OPENCLAW_HOME/config.yaml` | Explicit config file path |
| `NODE_ENV` | `development` | Set to `production` in containers |

---

## 7 | Volume Mounts

OpenClaw stores persistent data under `OPENCLAW_HOME` (`~/.openclaw` by default).

| Path inside container | Contents | Must persist? |
|-----------------------|----------|---------------|
| `~/.openclaw/config.yaml` | Gateway configuration | Yes |
| `~/.openclaw/sessions.db` | SQLite session database | Yes |
| `~/.openclaw/workspaces/` | Per-sender agent workspaces | Yes |
| `~/.openclaw/memory/` | Persistent memory entries | Yes |
| `~/.openclaw/media/` | Inbound/outbound media files | Yes |
| `~/.openclaw/plugins/` | Installed plugins | Yes |
| `~/.openclaw/logs/` | Gateway log files | Recommended |
| `~/.openclaw/gateway.pid` | PID file | No (ephemeral) |

The simplest approach is a single named volume for the entire directory:

```yaml
volumes:
  - openclaw-data:/root/.openclaw
```

For granular control (e.g., separate backup strategies):

```yaml
volumes:
  - openclaw-config:/root/.openclaw/config.yaml
  - openclaw-sessions:/root/.openclaw/sessions.db
  - openclaw-workspaces:/root/.openclaw/workspaces
  - openclaw-media:/root/.openclaw/media
```

---

## 8 | Networking

### Gateway Port

Port **18789** serves the Control UI dashboard, WebSocket connections, REST API, and webhook endpoints.

### Webhook URLs for Messaging Channels

Channels like WhatsApp send webhook callbacks to your gateway. The container's port 18789 must be reachable from the public internet for these callbacks.

**For development / testing:**

```bash
ngrok http 18789
```

Set the webhook URL to the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io/whatsapp/webhook`).

**For production:** Use a reverse proxy with SSL (see Section 10).

### Connecting to Other Docker Services

If OpenClaw needs to reach other services (e.g., Ollama for local models):

```yaml
services:
  openclaw:
    networks:
      - openclaw-net
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434

  ollama:
    image: ollama/ollama:latest
    networks:
      - openclaw-net
    volumes:
      - ollama-data:/root/.ollama

networks:
  openclaw-net:
    driver: bridge
```

Reference services by their Compose service name (e.g., `http://ollama:11434`).

---

## 9 | Setting Up Messaging Channels

### Telegram (Recommended First Channel)

Telegram uses long-polling (outbound connections only) -- no webhook URL required.

1. Message `@BotFather` on Telegram, create a bot, get the token
2. Add `TELEGRAM_BOT_TOKEN` to your `.env` file
3. Restart: `docker compose restart openclaw`

Test it:

```bash
docker exec openclaw openclaw channel test telegram
```

### Discord

Discord uses a WebSocket gateway (outbound) -- no public URL needed.

1. Create an application at https://discord.com/developers
2. Create a bot, enable MESSAGE CONTENT intent, copy token
3. Add `DISCORD_BOT_TOKEN` and `DISCORD_APP_ID` to `.env`
4. Restart the container

### WhatsApp Business API

WhatsApp requires inbound webhook callbacks -- your gateway must be publicly reachable.

1. Set up a Meta Business account and WhatsApp Business API
2. Add credentials to `.env`
3. Configure the webhook URL in Meta's portal pointing to your public URL
4. Restart the container

### Testing Channels

```bash
docker exec openclaw openclaw channel list
docker exec openclaw openclaw channel test telegram
```

---

## 10 | Production Stack: Nginx + SSL

### docker-compose.yml (Full Production)

```yaml
version: "3.9"

services:
  openclaw:
    image: ghcr.io/openclaw-ai/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    expose:
      - "18789"
    volumes:
      - openclaw-data:/root/.openclaw
      - ./config.yaml:/root/.openclaw/config.yaml:ro
    env_file:
      - .env
    environment:
      - NODE_ENV=production
    networks:
      - openclaw-net
    healthcheck:
      test: ["CMD", "openclaw", "gateway", "status", "--json"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 256M

  nginx:
    image: nginx:alpine
    container_name: openclaw-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - certbot-etc:/etc/letsencrypt:ro
      - certbot-var:/var/lib/letsencrypt
    networks:
      - openclaw-net
    depends_on:
      openclaw:
        condition: service_healthy

  certbot:
    image: certbot/certbot
    container_name: openclaw-certbot
    volumes:
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  openclaw-net:
    driver: bridge

volumes:
  openclaw-data:
  certbot-etc:
  certbot-var:
```

### nginx.conf

```nginx
upstream openclaw_backend {
    server openclaw:18789;
}

server {
    listen 80;
    server_name openclaw.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/lib/letsencrypt;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name openclaw.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/openclaw.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/openclaw.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # WebSocket support (required for real-time channels)
    location / {
        proxy_pass http://openclaw_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

### Obtaining the SSL Certificate

```bash
# Start nginx temporarily for the ACME challenge
docker compose up -d nginx

# Request the certificate
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/lib/letsencrypt \
  -d openclaw.yourdomain.com \
  --email you@yourdomain.com \
  --agree-tos \
  --no-eff-email

# Start the full stack
docker compose up -d
```

---

## 11 | Host OS Considerations

### macOS (Docker Desktop)

- Docker Desktop runs a Linux VM. Port mapping works transparently.
- Named volumes (`openclaw-data:`) perform better than bind-mounted host directories.
- Default Docker Desktop memory is 2 GB. Increase in Settings > Resources if needed.
- No iMessage channel support (container is Linux, not macOS).

### Linux (Native Docker)

- Best performance. No VM overhead.
- If using a non-root container user (UID 1001), ensure bind-mounted host directories match: `sudo chown -R 1001:1001 /path/to/data`
- Enable Docker service: `sudo systemctl enable docker`

### Windows (Docker Desktop / WSL2)

- Docker Desktop with WSL2 backend is required.
- Use Linux containers (the default).
- Named volumes perform much better than Windows filesystem bind mounts.
- Port 18789 is exposed to `localhost` on Windows.

---

## 12 | Security Considerations

### Container Isolation

- The gateway cannot access host files outside mounted volumes
- Network access is restricted to exposed ports and connected Docker networks
- Process isolation prevents the container from interfering with host processes

### Non-Root User

The custom Dockerfile runs as user `openclaw` (UID 1001). For the official image:

```bash
docker run -d --user 1001:1001 \
  -v openclaw-data:/home/openclaw/.openclaw \
  ghcr.io/openclaw-ai/openclaw:latest
```

### Secret Management

Never put API keys directly in `docker-compose.yml` or Dockerfiles.

**Recommended approaches:**

1. **External `.env` file** (not checked into version control):
   ```yaml
   env_file:
     - .env
   ```
   Add `.env` to `.gitignore`.

2. **Docker secrets** (Swarm mode):
   ```yaml
   secrets:
     anthropic_key:
       file: ./secrets/anthropic_key.txt
   ```

3. **Environment variables at runtime**:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-... docker compose up -d
   ```

### Read-Only Filesystem

For maximum security, run with a read-only root filesystem:

```yaml
services:
  openclaw:
    read_only: true
    tmpfs:
      - /tmp
    volumes:
      - openclaw-data:/root/.openclaw
```

### Network Restrictions

If behind a reverse proxy, don't publish port 18789 to the host -- use `expose` instead of `ports`:

```yaml
services:
  openclaw:
    expose:
      - "18789"    # Only accessible to other containers on the same network
```

---

## 13 | Updating OpenClaw in Docker

### Standard Update

```bash
docker compose pull openclaw
docker compose up -d openclaw
```

Data in named volumes persists across container recreations.

### Pinned Version Update

Edit `docker-compose.yml` to the new version tag, then:

```bash
docker compose up -d openclaw
```

### Running Migrations

```bash
docker exec openclaw openclaw migrate --dry-run    # Check first
docker exec openclaw openclaw migrate              # Apply
```

### Rollback

Switch back to the previous tag in `docker-compose.yml`:

```bash
docker compose up -d openclaw
```

---

## 14 | Resource Limits

```yaml
services:
  openclaw:
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 1G
        reservations:
          cpus: "0.25"
          memory: 256M
```

**Sizing guidance:**

| Workload | CPUs | Memory |
|----------|------|--------|
| Light (1-2 channels, few users) | 0.5 | 512M |
| Medium (3-5 channels, moderate traffic) | 1.0 | 1G |
| Heavy (many channels, plugins, high traffic) | 2.0+ | 2G+ |

Monitor usage:

```bash
docker stats openclaw
```

---

## 15 | Troubleshooting

### Container exits immediately

```bash
docker logs openclaw
```

Common causes:
- Missing or invalid `config.yaml`
- Missing API key environment variables
- Port conflict on 18789

### Gateway not reachable from host

```bash
docker port openclaw
curl http://127.0.0.1:18789/
docker ps | grep openclaw
```

### Webhooks not arriving (WhatsApp)

- Verify public URL points to port 443 (via Nginx) or 18789
- Check Nginx logs: `docker logs openclaw-nginx`
- Verify SSL certificate: `curl -I https://openclaw.yourdomain.com`

### Permission denied errors

If using bind mounts with a non-root user:

```bash
docker exec openclaw id
sudo chown -R 1001:1001 /path/to/mounted/directory
```

### High memory usage

```bash
docker stats openclaw --no-stream
docker exec openclaw openclaw doctor
docker exec openclaw openclaw session prune --older-than 7d
```

### Container keeps restarting

```bash
docker inspect openclaw --format='{{.RestartCount}} {{.State.ExitCode}}'
docker logs --tail 50 openclaw
```

### Config changes not taking effect

```bash
docker exec openclaw openclaw gateway reload
# Or restart the container
docker compose restart openclaw
```

---

## 16 | Useful Commands Reference

```bash
# --- Lifecycle ---
docker compose up -d                            # Start the stack
docker compose down                             # Stop the stack
docker compose restart openclaw                  # Restart OpenClaw only
docker compose pull                              # Pull latest images

# --- Logs ---
docker compose logs -f openclaw                  # Follow container logs
docker exec openclaw openclaw gateway logs -f    # Follow gateway logs

# --- Status ---
docker exec openclaw openclaw gateway status     # Gateway health
docker exec openclaw openclaw channel list       # Channel status
docker exec openclaw openclaw doctor             # Full diagnostics
docker stats openclaw                            # CPU / memory usage

# --- Configuration ---
docker exec openclaw openclaw config show        # Print current config
docker exec openclaw openclaw config validate    # Validate config
docker exec openclaw openclaw gateway reload     # Hot-reload config

# --- Sessions ---
docker exec openclaw openclaw session list       # Active sessions
docker exec openclaw openclaw session prune --older-than 7d  # Clean up

# --- Maintenance ---
docker exec openclaw openclaw migrate --dry-run  # Check for migrations
docker exec openclaw openclaw --version          # Current version

# --- Shell access ---
docker exec -it openclaw /bin/bash               # Interactive shell

# --- Backup ---
docker run --rm -v openclaw-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/openclaw-backup-$(date +%Y%m%d).tar.gz -C /data .

# --- Restore ---
docker run --rm -v openclaw-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/openclaw-backup-20260322.tar.gz -C /data
```

---

*This guide reflects OpenClaw documentation and community experience as of March 2026. For the latest information, visit https://docs.openclaw.ai.*
