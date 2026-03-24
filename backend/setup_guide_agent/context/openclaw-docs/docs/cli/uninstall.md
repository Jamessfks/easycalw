---
title: "uninstall"
source_url: "https://docs.openclaw.ai/cli/uninstall"
section: "cli"
---

# uninstall

# `openclaw uninstall`

Uninstall the gateway service + local data (CLI remains).

```bash}
openclaw backup create
openclaw uninstall
openclaw uninstall --all --yes
openclaw uninstall --dry-run
```

Run `openclaw backup create` first if you want a restorable snapshot before removing state or workspaces.