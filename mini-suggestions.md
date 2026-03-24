# Mini Suggestions — Easy Claw

Running list of improvements spotted during hardening. Prioritized by impact.

---

## HIGH PRIORITY

### 1. Webhook Authentication
The `/webhook` endpoint has no auth. Anyone can POST fake events. Add HMAC signature verification using the Vapi webhook secret to validate requests are genuinely from Vapi.

### 2. Rate Limiting
No rate limiting on any endpoint. A bad actor could spam `/generate-guide` and burn through Claude API budget. Add rate limiting via `slowapi` or a reverse proxy (nginx/Cloudflare).

### 3. Guide Output Storage
Currently `/tmp/` — gets wiped on server restart or OS cleanup. Move to a persistent directory or cloud storage (S3/GCS) for production. The JSON store persistence added today helps, but `/tmp` is still ephemeral.

### 4. Frontend API Base URL in Production
The frontend uses relative URLs (`/format`, `/generate-guide`). This works when backend serves the built frontend, but breaks if frontend is deployed separately (e.g., Vercel + Railway). The `VITE_API_BASE` env var was added to handle this — just needs to be set correctly per environment.

### 5. Vapi Error Recovery
If the Vapi call drops mid-interview (network issue, browser tab close), there's no recovery. Consider:
- Auto-saving partial transcripts to localStorage
- A "resume interview" flow that pre-loads prior context
- Timeout detection + auto-reconnect attempt

---

## MEDIUM PRIORITY

### 6. Loading Screen Progress Indicators
`LoadingScreen` shows a generic spinner. The agent takes 2-5 minutes. Add:
- Estimated time remaining
- Step-by-step progress (e.g., "Reading transcript... Exploring knowledge base... Writing guide...")
- This could be powered by streaming agent status via SSE instead of polling

### 7. SSE Instead of Polling
Replace the `/guide/{id}` polling loop with Server-Sent Events. Benefits:
- Instant updates (no 3s delay)
- Lower server load
- Can stream intermediate progress (agent thinking, files written so far)

### 8. Guide Versioning & History
No way to access previously generated guides unless you saved the URL. Add:
- A `/guides` list endpoint
- Simple localStorage history in the frontend
- Optional: link guides to sessions/users

### 9. Interview Agent System Prompt Iteration
The VAPI assistant ID is static — the interview agent's prompt is configured in the Vapi dashboard, not in this codebase. Consider pulling the system prompt into a file in this repo so it can be version-controlled and iterated on alongside the setup guide agent prompt.

### 10. Formatter Model Upgrade Path
Currently using `claude-haiku-4-5` for formatting. If transcript quality is critical, consider:
- Using Sonnet for complex/long transcripts
- Adding a `FORMATTER_MODEL` env var to control this without code changes

---

## LOW PRIORITY (POLISH)

### 11. Frontend .gitignore for .env
The frontend `.gitignore` should include `.env` and `.env.local` to prevent accidentally committing Vapi keys. (Check if it already does.)

### 12. Accessibility
- No ARIA labels on interview controls
- No keyboard navigation for the transcript view
- Color contrast may not meet WCAG AA on the dark theme

### 13. Mobile Responsiveness
The interview two-panel layout (`w-2/5` + `w-3/5`) doesn't stack on mobile. Add responsive breakpoints so it works on phones/tablets.

### 14. Agent Cost Tracking Dashboard
The agent returns `cost_usd` and `turns` — expose this in the UI or a simple admin panel so you can monitor spend per guide.

### 15. E2E Testing
No tests exist. Add:
- Playwright/Cypress for the full landing → interview → guide flow (mock Vapi)
- pytest for backend endpoints (format, generate, health)
- Integration test that runs the formatter on a sample transcript

### 16. Docker Compose for Local Dev
A `docker-compose.yml` that runs both frontend (Vite dev) and backend (FastAPI) with hot reload would make onboarding contributors trivial.

### 17. Guide Quality Scoring
After generation, run a lightweight pass to score the guide:
- Does it cover all sections from the template?
- Are all recommended skills from the registry?
- Does it match the user's stated platform/channel?
Log the score for monitoring.

---

*Last updated: 2026-03-24*
