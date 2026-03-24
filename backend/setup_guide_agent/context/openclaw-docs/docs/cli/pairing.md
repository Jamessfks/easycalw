---
title: "pairing"
source_url: "https://docs.openclaw.ai/cli/pairing"
section: "cli"
---

# pairing

# `openclaw pairing`

Approve or inspect DM pairing requests (for channels that support pairing).

Related:

* Pairing flow: [Pairing](/channels/pairing)

## Commands

```bash}
openclaw pairing list telegram
openclaw pairing list --channel telegram --account work
openclaw pairing list telegram --json

openclaw pairing approve telegram <code>
openclaw pairing approve --channel telegram --account work <code> --notify
```

## Notes

* Channel input: pass it positionally (`pairing list telegram`) or with `--channel <channel>`.
* `pairing list` supports `--account <accountId>` for multi-account channels.
* `pairing approve` supports `--account <accountId>` and `--notify`.
* If only one pairing-capable channel is configured, `pairing approve <code>` is allowed.