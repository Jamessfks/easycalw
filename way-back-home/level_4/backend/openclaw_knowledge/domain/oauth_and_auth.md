# OAuth and authentication (OpenClaw)

- Prefer **browser OAuth** for supported providers; avoid pasting long-lived API keys into chat.
- **OpenAI Codex path** is commonly documented as `openclaw onboard --auth-choice openai-codex` (exact flags may change — the setup guide should link official OpenClaw docs).
- Users behind corporate TLS inspection may need custom CA configuration for CLI and browser flows.
