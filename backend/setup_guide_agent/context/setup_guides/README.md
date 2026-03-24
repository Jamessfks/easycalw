# Setup Guides

Reference setup guide documents for the Setup Guide Agent. The agent reads these to ground its recommendations and tailor output to the user's hardware/deployment scenario.

## Available Guides

| File | Scenario | Key Differentiator |
|------|----------|--------------------|
| `mac_mini_setup.md` | Dedicated Mac Mini (24/7) | Always-on, iMessage support, launchd daemon, headless tips |
| `vps_setup.md` | Linux VPS (Ubuntu) | Cheapest 24/7 option, systemd, UFW firewall, Nginx + SSL |
| `existing_mac_setup.md` | Daily-driver Mac (laptop/desktop) | Sleep/wake handling, battery management, shared resources |
| `docker_setup.md` | Docker container | Isolation, portability, Compose + Nginx stack, multi-OS host |
