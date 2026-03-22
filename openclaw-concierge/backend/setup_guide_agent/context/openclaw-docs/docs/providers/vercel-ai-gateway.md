---
title: "Vercel AI Gateway"
source_url: "https://docs.openclaw.ai/providers/vercel-ai-gateway"
section: "providers"
---

# Vercel AI Gateway

# Vercel AI Gateway

The [Vercel AI Gateway](https://vercel.com/ai-gateway) provides a unified API to access hundreds of models through a single endpoint.

* Provider: `vercel-ai-gateway`
* Auth: `AI_GATEWAY_API_KEY`
* API: Anthropic Messages compatible
* OpenClaw auto-discovers the Gateway `/v1/models` catalog, so `/models vercel-ai-gateway`
  includes current model refs such as `vercel-ai-gateway/openai/gpt-5.4`.

## Quick start

1. Set the API key (recommended: store it for the Gateway):

```bash}
openclaw onboard --auth-choice ai-gateway-api-key
```

2. Set a default model:

```json5}
{
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4.6" },
    },
  },
}
```

## Non-interactive example

```bash}
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY"
```

## Environment note

If the Gateway runs as a daemon (launchd/systemd), make sure `AI_GATEWAY_API_KEY`
is available to that process (for example, in `~/.openclaw/.env` or via
`env.shellEnv`).

## Model ID shorthand

OpenClaw accepts Vercel Claude shorthand model refs and normalizes them at
runtime:

* `vercel-ai-gateway/claude-opus-4.6` -> `vercel-ai-gateway/anthropic/claude-opus-4.6`
* `vercel-ai-gateway/opus-4.6` -> `vercel-ai-gateway/anthropic/claude-opus-4-6`