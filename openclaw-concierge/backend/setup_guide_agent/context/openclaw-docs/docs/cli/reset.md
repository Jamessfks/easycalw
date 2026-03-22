---
title: "reset"
source_url: "https://docs.openclaw.ai/cli/reset"
section: "cli"
---

# reset

# `openclaw reset`

Reset local config/state (keeps the CLI installed).

```bash}
openclaw backup create
openclaw reset
openclaw reset --dry-run
openclaw reset --scope config+creds+sessions --yes --non-interactive
```

Run `openclaw backup create` first if you want a restorable snapshot before removing local state.