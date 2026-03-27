# Interview Transcript

**User:** Hey, I'm Kai Nakamura. I'm the founder and CTO of SynthLabs — we're an AI startup here in San Francisco building synthetic data pipelines for ML teams. It's just me and two engineers right now, but we're about to close our seed round so we'll be hiring soon.

**Agent:** Cool, congrats on the fundraise! What's the main thing you'd want an AI assistant to handle?

**User:** Honestly, I want a second brain that's always on. My day is split between coding, investor calls, hiring, and ops. I need something that can monitor our GitHub repos, summarize Slack threads I missed overnight, draft investor update emails, track our burn rate in a Google Sheet, and maybe even do some code review on PRs. Basically everything that's not deep engineering work — I want to offload the coordination overhead.

**Agent:** You're clearly technical. What's your comfort level?

**User:** 10 out of 10. I've been a software engineer for 12 years. I've self-hosted everything from Kubernetes clusters to home automation systems. I'm comfortable with Terminal, Docker, SSH, config files, you name it. I'll probably end up customizing the OpenClaw setup pretty heavily — I want to write custom skills if the built-in ones don't cover my needs.

**Agent:** What hardware are you thinking?

**User:** I have a Mac Mini M4 Pro with 48GB RAM sitting on my desk that's always on. It's already running a few services — a local LLM inference server, a Postgres database, and some cron jobs. I'll just add OpenClaw to the mix. Resource-wise it's fine.

**Agent:** What messaging channels?

**User:** Telegram for personal and team stuff. We use Slack for work but I'd start with Telegram for the AI because it's simpler to set up. Eventually I'd add Slack integration too so the whole team can use it.

**Agent:** What tools does your team use?

**User:** GitHub for code, Slack for communication, Linear for project management, Google Workspace for docs and email, Notion for our internal wiki, Vercel for deployments, and I use Anthropic's API directly for some internal tools. Oh, and we have a shared 1Password vault for secrets management.

**Agent:** How autonomous should the AI be?

**User:** Full autonomy for almost everything. I don't want an AI that asks permission — I want one that acts and tells me what it did. The only exception would be anything involving spending money or sending external communications to investors or clients. For internal ops, code summaries, Slack digests, calendar management — just do it. I'll audit the logs if I need to.

**Agent:** Got it. I have everything I need, Kai. This is going to be a power-user setup.