# Installation

## Recommended: Installer Script

The fastest way to install OpenClaw.

**macOS / Linux:**

```bash
curl -fsSL https://get.openclaw.ai | bash
```

**Windows (PowerShell):**

```powershell
irm https://get.openclaw.ai/win | iex
```

The script installs the `openclaw` binary, adds it to your PATH, and optionally installs the background daemon.

## System Requirements

- **Node.js**: Node 24 (recommended) or Node 22 LTS (22.16+)
- **OS**: macOS, Linux, or Windows
- **Architecture**: x64 or arm64

## Alternative Installation Methods

### npm / pnpm

```bash
npm install -g openclaw@latest
```

Or with pnpm:

```bash
pnpm add -g openclaw@latest
```

### From Source

```bash
git clone https://github.com/openclaw-ai/openclaw.git
cd openclaw
npm install
npm run build
npm link
```

### From GitHub Main (Latest Dev)

```bash
npm install -g github:openclaw-ai/openclaw
```

## Containers

### Docker

```bash
docker pull ghcr.io/openclaw-ai/openclaw:latest
docker run -d \
  --name openclaw \
  -p 18789:18789 \
  -v openclaw-data:/root/.openclaw \
  ghcr.io/openclaw-ai/openclaw:latest
```

### Podman

```bash
podman pull ghcr.io/openclaw-ai/openclaw:latest
podman run -d \
  --name openclaw \
  -p 18789:18789 \
  -v openclaw-data:/root/.openclaw \
  ghcr.io/openclaw-ai/openclaw:latest
```

### Nix

```bash
nix profile install github:openclaw-ai/openclaw
```

Or in a flake:

```nix
{
  inputs.openclaw.url = "github:openclaw-ai/openclaw";
}
```

### Ansible

An Ansible role is available for automated deployment:

```yaml
- role: openclaw
  openclaw_version: latest
  openclaw_config: "{{ lookup('file', 'openclaw.yaml') }}"
```

### Bun

```bash
bun install -g openclaw@latest
```

## Verify Installation

```bash
# Check version
openclaw --version

# Run diagnostics
openclaw doctor

# Check gateway status
openclaw gateway status
```

`openclaw doctor` checks for:
- Correct Node.js version
- Required system dependencies
- Configuration file validity
- Network connectivity to providers

## Hosting Options

OpenClaw can be deployed on:

- **VPS** — Any Linux VPS (DigitalOcean, Linode, Vultr, etc.)
- **Docker VM** — Docker Compose on a dedicated VM
- **Kubernetes** — Helm chart available for K8s clusters
- **Fly.io** — Deploy with `fly launch`
- **Hetzner** — Cloud or dedicated servers
- **GCP** — Cloud Run or Compute Engine
- **Azure** — Container Instances or App Service
- **Railway** — One-click deploy template
- **Render** — Web service deployment
- **Northflank** — Container-based deployment

## Update

```bash
# Via npm
npm update -g openclaw

# Via installer script
curl -fsSL https://get.openclaw.ai | bash

# Docker
docker pull ghcr.io/openclaw-ai/openclaw:latest
docker restart openclaw
```

## Migrate

When upgrading across major versions, run the migration helper:

```bash
openclaw migrate
```

This handles configuration schema changes and data migrations.

## Uninstall

```bash
# Remove the daemon first
openclaw daemon uninstall

# Then remove the package
npm uninstall -g openclaw

# Optionally remove data
rm -rf ~/.openclaw
```

## Troubleshooting

### `openclaw` not found

If the `openclaw` command is not found after installation, the binary is likely not in your PATH.

**macOS / Linux:**

```bash
# Check where it was installed
which openclaw || npm root -g

# Add to PATH if needed (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$(npm root -g)/../bin"
```

**Windows:**

Ensure the npm global bin directory is in your system PATH. Run `npm bin -g` to find the directory.

### Node version issues

```bash
# Check your Node version
node --version

# OpenClaw requires Node 24 (recommended) or Node 22.16+
# Use nvm to switch:
nvm install 24
nvm use 24
```
