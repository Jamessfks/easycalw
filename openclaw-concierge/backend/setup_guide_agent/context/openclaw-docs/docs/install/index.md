---
title: "Install"
source_url: "https://docs.openclaw.ai/install/index"
section: "install"
---

# Install

# Install

## Recommended: installer script

The fastest way to install. It detects your OS, installs Node if needed, installs OpenClaw, and launches onboarding.

    ```bash}
    curl -fsSL https://openclaw.ai/install.sh | bash
    ```

    ```powershell}
    iwr -useb https://openclaw.ai/install.ps1 | iex
    ```

To install without running onboarding:

    ```bash}
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
    ```

    ```powershell}
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    ```

For all flags and CI/automation options, see [Installer internals](/install/installer).

## System requirements

* **Node 24** (recommended) or Node 22.16+ — the installer script handles this automatically
* **macOS, Linux, or Windows** — both native Windows and WSL2 are supported; WSL2 is more stable. See [Windows](/platforms/windows).
* `pnpm` is only needed if you build from source

## Alternative install methods

### npm or pnpm

If you already manage Node yourself:

    ```bash}
    npm install -g openclaw@latest
    openclaw onboard --install-daemon
    ```

    ```bash}
    pnpm add -g openclaw@latest
    pnpm approve-builds -g
    openclaw onboard --install-daemon
    ```

      pnpm requires explicit approval for packages with build scripts. Run `pnpm approve-builds -g` after the first install.

  If `sharp` fails due to a globally installed libvips:

  ```bash}
  SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
  ```

### From source

For contributors or anyone who wants to run from a local checkout:

```bash}
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install && pnpm ui:build && pnpm build
pnpm link --global
openclaw onboard --install-daemon
```

Or skip the link and use `pnpm openclaw ...` from inside the repo. See [Setup](/start/setup) for full development workflows.

### Install from GitHub main

```bash}
npm install -g github:openclaw/openclaw#main
```

### Containers and package managers

    Containerized or headless deployments.

    Rootless container alternative to Docker.

    Declarative install via Nix flake.

    Automated fleet provisioning.

    CLI-only usage via the Bun runtime.

## Verify the install

```bash}
openclaw --version      # confirm the CLI is available
openclaw doctor         # check for config issues
openclaw gateway status # verify the Gateway is running
```

## Hosting and deployment

Deploy OpenClaw on a cloud server or VPS:

  Any Linux VPS
  Shared Docker steps
  K8s
  Fly.io
  Hetzner
  Google Cloud
  Azure
  Railway
  Render
  Northflank

## Update, migrate, or uninstall

    Keep OpenClaw up to date.

    Move to a new machine.

    Remove OpenClaw completely.

## Troubleshooting: `openclaw` not found

If the install succeeded but `openclaw` is not found in your terminal:

```bash}
node -v           # Node installed?
npm prefix -g     # Where are global packages?
echo "$PATH"      # Is the global bin dir in PATH?
```

If `$(npm prefix -g)/bin` is not in your `$PATH`, add it to your shell startup file (`~/.zshrc` or `~/.bashrc`):

```bash}
export PATH="$(npm prefix -g)/bin:$PATH"
```

Then open a new terminal. See [Node setup](/install/node) for more details.