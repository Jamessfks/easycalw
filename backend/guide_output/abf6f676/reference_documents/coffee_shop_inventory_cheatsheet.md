# Coffee Shop OpenClaw — Quick Reference Cheatsheet

**For daily use at your Portland coffee shop.**
Keep this handy for common agent commands and inventory management workflows.

---

## Talking to Your Agent via Telegram

You communicate with your agent by texting your Telegram bot. Here are example messages that work well:

### Inventory Questions

| What You Want | What to Text the Bot |
|---|---|
| Check current stock levels | "What's our current inventory status?" |
| See what's running low | "What do we need to reorder today?" |
| Log a stock update | "We just received 10 lbs of Ethiopian single origin. Update stock." |
| Log something that ran out | "We ran out of oat milk at 11am today." |
| Check a specific item | "How much whole milk do we have left?" |

### Order Tracking

| What You Want | What to Text the Bot |
|---|---|
| Log today's sales | "Today's sales: 47 lattes, 23 drip coffees, 8 cold brews, 12 pastries." |
| Check what sold well | "What was our best-selling item this week?" |
| Plan tomorrow | "Based on what we sold today, what do I need to prep for tomorrow?" |
| Draft a reorder message | "Draft a reorder message to our coffee supplier for 20 lbs of house blend." |

### Supplier Lookups

| What You Want | What to Text the Bot |
|---|---|
| Find a supplier | "Find me a wholesale oat milk supplier in Portland Oregon." |
| Look up a price | "What's the current wholesale price for specialty espresso beans?" |
| Compare options | "Find 3 wholesale coffee cup suppliers and compare their minimum order quantities." |

---

## Your Daily Automations

| Time | What Arrives in Telegram | What to Do |
|---|---|---|
| **7:00 AM** | Morning Inventory Check | Read it before opening. Reorder anything flagged low. |
| **8:00 PM** | End-of-Day Order Summary | Review after close. Note anything to prep for tomorrow. |

### Testing Automations Manually

If you ever want to trigger a summary outside of its scheduled time:

```bash
openclaw cron list         ← find the job ID (number in first column)
openclaw cron run 1        ← test Morning Inventory Check
openclaw cron run 2        ← test End-of-Day Order Summary
```

---

## Sharing Your Inventory Spreadsheet

Once you're comfortable with the agent, share your actual inventory data:

1. Export your inventory as a **CSV file** (from Excel, Google Sheets, or whatever you use)
2. Name it `inventory.csv` and save it in your `~/Documents/` folder on the Mac Mini
3. Tell your agent: "My inventory spreadsheet is at ~/Documents/inventory.csv — please analyze it and tell me what's running low."

The agent's `data-analyst` skill will read and analyze the file directly.

---

## Common Trouble + Quick Fixes

| Problem | Quick Fix |
|---|---|
| Bot not responding in Telegram | Open Terminal on Mac Mini, run: `openclaw doctor` |
| Automation didn't arrive this morning | Run: `openclaw cron list` to check status, then `openclaw cron run 1` |
| Gateway stopped | Run: `openclaw gateway stop && openclaw gateway start` |
| Need to check what the agent is doing | Run: `openclaw logs --follow` (press Ctrl+C to stop) |
| Mac Mini went to sleep | Check Amphetamine in the menu bar — make sure the session is active |

---

## Monthly Maintenance Checklist

Do these once a month to keep things running smoothly:

- [ ] Check Anthropic API spending in [console.anthropic.com](https://console.anthropic.com) — make sure it's under your cap
- [ ] Run `openclaw security audit --deep` and review any new recommendations
- [ ] Run `claw-audit` for a full security posture check
- [ ] Check `openclaw skills list` — make sure no unexpected skills appeared
- [ ] Review `openclaw cron list` — confirm only your 2 expected jobs are running
- [ ] Every 3 months: rotate your Anthropic API key (create a new one in the console, update OpenClaw, delete the old one)

---

## Useful OpenClaw Commands (Run in Terminal on Mac Mini)

```bash
openclaw gateway status          # Is the agent running?
openclaw channels status         # Is Telegram connected?
openclaw models status           # Is Claude connected?
openclaw skills list             # What skills are installed?
openclaw cron list               # What automations are scheduled?
openclaw logs --follow           # Watch what the agent is doing live
openclaw doctor                  # Auto-diagnose and fix common issues
openclaw security audit --deep   # Full security check
openclaw dashboard               # Open web control panel in browser
```

---

**Questions?** Text your Telegram bot anytime — it can help you use itself.
