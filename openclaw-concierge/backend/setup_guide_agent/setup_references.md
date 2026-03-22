<!-- TODO: Other team provides real reference material (setup guides, skill docs, etc.). -->
<!-- This placeholder will be swapped out when real references are delivered. -->
<!-- The RocketRide pipeline loads this file at runtime — just replace the contents. -->

# OpenClaw Setup Reference Material

## Available Skills (sample)
- `customer-support` — Multi-channel customer support agent
- `sales-assistant` — Lead qualification and follow-up
- `knowledge-base` — Internal knowledge management
- `scheduling` — Appointment and calendar management
- `data-entry` — Automated form and data processing

## Basic Setup Flow
1. Install OpenClaw CLI: `clawhub install`
2. Initialize project: `clawhub init`
3. Configure skills: `clawhub install <skill-slug>`
4. Set up channels (web, Slack, email, etc.)
5. Deploy: `clawhub deploy`

## Configuration Notes
- All skill slugs come from the official skill registry (tool-based lookup)
- OAuth flows are user-side only — no API keys stored by the system
- Tiered transparency: Tier 1 (easy/full setup), Tier 2 (medium/manual steps), Tier 3 (advanced/links)
