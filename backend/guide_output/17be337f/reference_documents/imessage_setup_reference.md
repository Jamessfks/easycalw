# iMessage Channel — Setup Reference

**For:** Marcus's food truck OpenClaw deployment
**Deployment type:** Existing MacBook (daily-driver Mac)
**Source:** openclaw-docs/docs/channels/imessage.md

---

## How iMessage Works with OpenClaw

OpenClaw integrates with iMessage through a CLI tool called `imsg`. The gateway spawns `imsg rpc` as a subprocess and communicates via JSON-RPC over stdio. This means:

- No separate daemon or network port is needed for iMessage
- The Messages app on your MacBook must be signed in and running
- `imsg` reads the local Messages database at `~/Library/Messages/chat.db`
- Replies are sent by automating the Messages app via macOS Automation permissions

**Important:** The legacy `imsg` integration is what is documented here. For new deployments, the docs recommend BlueBubbles as the preferred path — but `imsg` is fully functional and the simpler setup for a single-Mac, single-user scenario like Marcus's food truck.

---

## Required macOS Permissions

Two permissions must be granted to the process context running OpenClaw and `imsg`:

| Permission | Location | Why It Is Needed |
|---|---|---|
| **Full Disk Access** | System Settings → Privacy & Security → Full Disk Access | Required to read `~/Library/Messages/chat.db` |
| **Automation** | System Settings → Privacy & Security → Automation → Terminal → Messages | Required to send messages through Messages.app |

**Critical:** Permissions are granted per process context. If the gateway runs as a launchd daemon (which it does after `openclaw onboard --install-daemon`), the permission must be granted in an interactive terminal session — not via the daemon. The one-time trigger command `imsg chats --limit 1` forces the permission dialogs to appear.

---

## The Pairing Model (Default)

By default, iMessage DMs use **pairing mode**:

1. A new sender texts the bot Apple ID
2. OpenClaw receives the message and holds it
3. You (the operator) approve the pairing via `openclaw pairing approve imessage`
4. The sender is now allowed and future messages are processed automatically

Pairing requests expire after **1 hour**. For Marcus's use case (only his personal iPhone talks to the bot), `dmPolicy: allowlist` is simpler and more secure — once your number is in the allowlist, no pairing ceremony is needed.

---

## Config Reference (Marcus's Setup)

```yaml
channels:
  imessage:
    enabled: true
    cliPath: "/usr/local/bin/imsg"
    dbPath: "/Users/YOUR_MAC_USERNAME/Library/Messages/chat.db"
    dmPolicy: allowlist
    allowFrom:
      - "+1512YOUR_NUMBER"
    groupPolicy: disabled
    includeAttachments: false
    configWrites: false
    textChunkLimit: 4000
    chunkMode: length
```

**Why `groupPolicy: disabled`:** Marcus is the only operator. Group iMessage threads (e.g., crew chat) should not route through the agent unless explicitly configured later.

**Why `configWrites: false`:** Prevents the iMessage channel from modifying the OpenClaw config via chat commands. This is a security hardening measure.

---

## Troubleshooting Reference

| Symptom | Diagnosis | Fix |
|---|---|---|
| `imsg rpc --help` gives an error | `imsg` is outdated or not installed | `brew upgrade steipete/tap/imsg` |
| Channel probe shows "RPC unsupported" | Same — outdated `imsg` | `brew upgrade steipete/tap/imsg` |
| Messages not arriving from iPhone | Permissions not granted | Re-run `imsg chats --limit 1` in an interactive terminal; approve dialogs in System Settings |
| Bot replies but sender gets nothing | `dmPolicy` or `allowFrom` mismatch | Check `channels.imessage.allowFrom` matches your exact phone number with country code |
| Gateway was asleep, messages lost | Mac slept — iMessage does not queue server-side | Configure Amphetamine trigger (Section 01, Step 1B); keep MacBook plugged in during service |
| After Mac wakes, channel disconnected | Normal behavior | `openclaw channel restart imessage` or wait for heartbeat to reconnect (within 5 minutes) |

---

## Voice Calls — What OpenClaw Can and Cannot Do

Marcus mentioned voice calls as a desired channel. Important clarification:

- OpenClaw does **not** natively place or receive phone calls
- The `elevenlabs-agents` skill adds **text-to-speech** (the agent speaks aloud through your MacBook's speakers) — this is useful for hands-free status readouts during service
- For actual phone call capability (the agent answers a call, speaks, listens), you would need a separate VoIP integration (Twilio + ElevenLabs) which is beyond the scope of this initial setup
- **Practical workaround for Marcus:** Use iMessage for two-way communication. Use `elevenlabs-agents` for the MacBook to read out status updates aloud when your hands are full. That covers 90% of the "voice" use case for a food truck context.

---

## When to Consider Upgrading to BlueBubbles

The `imsg` integration is stable but marked legacy. Consider migrating to BlueBubbles if:

- You want more reliable message delivery and a dedicated web interface for the bot
- You want to run the gateway on a non-Mac machine (Linux VPS) while keeping iMessage on a Mac
- You need multi-account iMessage (multiple Apple IDs on one gateway)

For a single-Mac, single-operator setup like Marcus's, `imsg` is perfectly adequate and requires less setup.

---

*Reference compiled from: openclaw-docs/docs/channels/imessage.md | Date: 2026-03-26*
