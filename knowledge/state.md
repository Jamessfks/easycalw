# EasyClaw — Current State

Last updated: 2026-03-27

## What We're Building

Automated OpenClaw consultant. A voice interview captures the customer's business needs, then generates a personalized, opinionated setup guide with copy-pasteable prompts. The customer manages their own infrastructure (self-hosts or uses a provider like Hostinger) — we provide the intelligence layer: what to configure, how to structure it, which skills to use.

We're not a hosting company. We're the brain that tells you how to set up your AI agent correctly.

## Where We Are

**MVP is working.** Full pipeline: Vapi voice interview → Gemini/Haiku formatter → Claude setup guide agent → 3-file output (setup guide + reference docs + prompts to send). Frontend deployed. 435-skill knowledge base, 72 domain files across 11 industries.

**First test user confirmed** — a grad student via Pranav's campus network.

**Competitive research done** — 24 hosting providers mapped (setup layer), 34 companies across 8 tiers (upgrade layer), 24 observability tools analyzed. We sit in a vacant quadrant: high personalization + affordable. Nobody else automates the discovery step.

## Key Decisions (see decisions.md)

- System prompt engineering over fine-tuning
- Customer self-hosts, we give config/prompts (not terminal commands)
- Voice-first input, text later
- B2B focus on SMBs (but Zicheng leans B2C — open debate)
- Translation feature deprioritized until customer demand
- MVP before polish — get test users first

## Open Questions (see debates.md)

- B2B vs B2C: who exactly is the customer?
- Voice vs text: do customers actually prefer talking?
- Output format: markdown guide? avatar walkthrough? documentation + call?
- Pricing: $200-$2K gap identified, no specific number chosen
- Knowledge quantity vs quality: gather everything or curate carefully?

## Who's Doing What Right Now

- **Pranav** — Campus customer testing, grad student demo, outreach
- **Zicheng** — UI updates, system prompt iteration, backend optimization
- **Travis** — Knowledge base restructure, agent orchestration, synthesis
- **Kaan** — Business strategy, customer conversations, team alignment
