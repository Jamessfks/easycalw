---
title: "logs"
source_url: "https://docs.openclaw.ai/cli/logs"
section: "cli"
---

# logs

# `openclaw logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

* Logging overview: [Logging](/logging)

## Examples

```bash}
openclaw logs
openclaw logs --follow
openclaw logs --json
openclaw logs --limit 500
openclaw logs --local-time
openclaw logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.