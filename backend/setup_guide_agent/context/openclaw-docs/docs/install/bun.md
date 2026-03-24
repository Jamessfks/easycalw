---
title: "Bun (Experimental)"
source_url: "https://docs.openclaw.ai/install/bun"
section: "install"
---

# Bun (Experimental)

# Bun (Experimental)

  Bun is **not recommended for gateway runtime** (known issues with WhatsApp and Telegram). Use Node for production.

Bun is an optional local runtime for running TypeScript directly (`bun run ...`, `bun --watch ...`). The default package manager remains `pnpm`, which is fully supported and used by docs tooling. Bun cannot use `pnpm-lock.yaml` and will ignore it.

## Install

    ```sh}
    bun install
    ```

    `bun.lock` / `bun.lockb` are gitignored, so there is no repo churn. To skip lockfile writes entirely:

    ```sh}
    bun install --no-save
    ```

    ```sh}
    bun run build
    bun run vitest run
    ```

## Lifecycle Scripts

Bun blocks dependency lifecycle scripts unless explicitly trusted. For this repo, the commonly blocked scripts are not required:

* `@whiskeysockets/baileys` `preinstall` -- checks Node major >= 20 (OpenClaw defaults to Node 24 and still supports Node 22 LTS, currently `22.16+`)
* `protobufjs` `postinstall` -- emits warnings about incompatible version schemes (no build artifacts)

If you hit a runtime issue that requires these scripts, trust them explicitly:

```sh}
bun pm trust @whiskeysockets/baileys protobufjs
```

## Caveats

Some scripts still hardcode pnpm (for example `docs:build`, `ui:*`, `protocol:check`). Run those via pnpm for now.