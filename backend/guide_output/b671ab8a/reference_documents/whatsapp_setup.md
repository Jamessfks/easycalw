# WhatsApp Channel Setup Reference
**For Lush & Local — OpenClaw WhatsApp Integration**

This document covers detailed WhatsApp setup, configuration options, and troubleshooting for Amara's OpenClaw deployment on Hetzner VPS.

---

## WhatsApp Plugin Architecture

OpenClaw connects to WhatsApp via the **Baileys library** (WhatsApp Web protocol). This means:

- Your OpenClaw agent links as a "Linked Device" — exactly like linking WhatsApp Web on your laptop
- No WhatsApp Business API account or Meta developer account is required
- Your existing WhatsApp Business number works directly
- The VPS maintains a persistent WhatsApp session 24/7

> ⚠️ **Important:** OpenClaw recommends using a dedicated WhatsApp number for your agent when possible. This keeps your personal/business messages separate. However, your existing WhatsApp Business number works and is common for small business setups.

---

## Initial Setup Commands

### Install the Plugin

```bash
openclaw plugins install @openclaw/whatsapp
```

### Link Your WhatsApp Account

```bash
openclaw channels login --channel whatsapp
```

A QR code appears in your terminal. On your phone:
1. Open WhatsApp → three-dot menu → **Linked Devices**
2. Tap **Link a Device**
3. Scan the QR code

The QR code expires after 1 hour. If it expires before you scan, run the command again.

### Check Connection Status

```bash
openclaw channels status
```

You should see:
```
whatsapp   ✓ connected   account: +1XXXXXXXXXX
```

---

## Configuration Reference

Your WhatsApp configuration lives in `~/.openclaw/openclaw.json`. Here is the recommended configuration for Lush & Local:

```json5
{
  channels: {
    whatsapp: {
      // Who can DM your agent (allowlist = only numbers you specify)
      dmPolicy: "allowlist",
      allowFrom: ["+1XXXXXXXXXX"],   // your WhatsApp Business number

      // Group chat policy (allowlist = only you can trigger the agent in groups)
      groupPolicy: "allowlist",
      groupAllowFrom: ["+1XXXXXXXXXX"],

      // Acknowledge receipt with a reaction (optional — shows customers you received their message)
      ackReaction: {
        emoji: "👀",
        direct: true,
        group: "never",
      },
    },
  },
}
```

After editing the config:
```bash
sudo systemctl restart openclaw
openclaw channels status
```

---

## Access Control Explained

### dmPolicy Options

| Policy | What It Does |
|---|---|
| `allowlist` | Only numbers in `allowFrom` can send commands — **use this** |
| `pairing` | Unknown senders can request pairing — more open |
| `open` | Anyone can message the agent — do not use this |
| `disabled` | WhatsApp channel disabled |

### Why "allowlist" is Right for You

Amara, your WhatsApp Business number is already used by customers, suppliers, and your VA. Using `allowlist` means:
- Only YOUR number can send commands to the agent
- Customers who message your WhatsApp Business number will get your normal replies (not agent commands)
- Suppliers and your VA cannot accidentally trigger the agent

---

## Multi-Account Setup (Optional — for VA Collaboration)

If you want your VA to also be able to interact with the agent:

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: [
        "+1XXXXXXXXXX",   // your number
        "+1YYYYYYYYYY",   // your VA's number
      ],
    },
  },
}
```

> 💡 **TIP:** Add your VA's number only after you have tested the system yourself for at least a week and are comfortable with how the agent responds. Start with just your number.

---

## Pairing Management

After setup, manage approved contacts:

```bash
# List pending pairing requests
openclaw pairing list whatsapp

# Approve a pairing request
openclaw pairing approve whatsapp

# Approve a specific pairing code
openclaw pairing approve whatsapp <code>
```

Pairing requests expire after 1 hour. Maximum 3 pending requests at a time.

---

## Relinking After Disconnection

WhatsApp sessions can disconnect if:
- The VPS restarts without systemd properly set up
- Your phone is offline for an extended period
- WhatsApp updates invalidate the session
- 30+ days of inactivity

To relink:
```bash
openclaw channels login --channel whatsapp
```

Scan the QR code on your phone again (same process as initial setup).

If relinking fails repeatedly:
```bash
openclaw doctor
openclaw logs --follow
```

Then try:
```bash
openclaw channels logout --channel whatsapp
openclaw channels login --channel whatsapp
```

---

## Message Formatting

The `whatsapp-styling-guide` skill you installed ensures consistent professional formatting. WhatsApp supports:

- **Bold text**: `*text*`
- _Italic text_: `_text_`
- ~~Strikethrough~~: `~text~`
- `Code text`: `` `text` ``

Your agent will automatically format messages appropriately for WhatsApp's rendering.

---

## Cron Delivery to WhatsApp

When setting up cron automations, use your phone number as the delivery target:

```bash
openclaw cron add \
  --channel whatsapp \
  --to "+1XXXXXXXXXX"
```

The number must be in E.164 format: `+` followed by country code and number, no spaces or dashes.

Examples:
- US/Canada: `+15551234567`
- UK: `+447911123456`
- Nigeria: `+2348012345678`

---

## Troubleshooting

### Agent Not Responding to Messages

1. Check channel status: `openclaw channels status`
2. Check gateway is running: `openclaw gateway status`
3. Verify your number is in the allowlist: check `~/.openclaw/openclaw.json`
4. Check logs: `openclaw logs --follow`

### WhatsApp Shows "Not Linked"

```bash
openclaw channels login --channel whatsapp
```

Scan the QR code again.

### Repeated Disconnections

```bash
openclaw doctor
openclaw logs --follow
```

Look for error messages about the WebSocket connection. Common causes:
- Network instability on the VPS
- WhatsApp rate-limiting the session
- An old/expired session file

Clear the session and relink:
```bash
openclaw channels logout --channel whatsapp
openclaw channels login --channel whatsapp
```

### Outbound Messages Failing

Make sure the gateway is running and WhatsApp is linked:
```bash
openclaw gateway status
openclaw channels status
```

The gateway must be active before any outbound messages can be sent.

### "controlUI" Config Error in Logs

If you see an error about `controlUI` in logs, ignore it — the correct config key uses lowercase `controlUi`. This is a known bug in the error message as of version 2026.2.24.

---

## Security Notes

- Never share your WhatsApp QR code with anyone
- Your WhatsApp credentials are stored (encrypted) at `~/.openclaw/credentials/whatsapp/`
- Backup file is at `~/.openclaw/credentials/whatsapp/creds.json.bak`
- Never expose port 18789 publicly — WhatsApp communication goes through the gateway's internal WebSocket, not a public port
- If you suspect unauthorized access, immediately run `openclaw channels logout --channel whatsapp` and relink

---

## Related Setup Guide Sections

- Main guide Section 03: WhatsApp initial connection
- Main guide Section 08: Security hardening
- Main guide Section 09: Security audit checklist
