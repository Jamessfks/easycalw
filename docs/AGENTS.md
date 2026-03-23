# Instructions for AI Coding Agents — OpenClaw Concierge

Use this file when generating or modifying code for OpenClaw Concierge. Read the documents below before writing any code.

---

## 1. Source of truth (read order)

| Priority | Document | What you take from it |
|----------|----------|----------------------|
| 1 | `docs/architecture.md` | System architecture, Vapi integration, project structure, data flow |
| 2 | `docs/design-considerations.md` | Engineering decisions, UI specs, open questions, what's deferred |
| 3 | This file (`docs/AGENTS.md`) | Invariants, file paths, build order, do-not rules |

---

## 2. System overview (quick reference)

```
User (voice) ↔ Vapi Cloud (ASR + LLM + TTS) → transcript → Formatter → Setup Guide Agent → Output
```

- **Two phases, one formatter step in between, no validation layer**
- **Phase 1:** Interview via **Vapi** — voice AI platform handles all audio, streaming, interruption, turn-taking. Frontend uses Vapi React SDK.
- **Formatter:** Single LLM call — cleans transcript into Markdown
- **Phase 2:** Setup Guide Creation Agent — runs on backend, no user interaction, produces 3 outputs

**The Interview Agent lives in Vapi (pre-built assistant), not in our codebase.**

### Google Cloud auth

Setup relies on **gcloud CLI project configuration**, not `.env` files. Run `gcloud auth application-default login` and `gcloud config set project <ID>` once. The Google ADK/Gemini SDKs pick up credentials automatically via Application Default Credentials (ADC). **Never create `.env` files with `GOOGLE_CLOUD_PROJECT`, `GOOGLE_GENAI_USE_VERTEXAI`, or similar.** See README.md "Developer setup" for details.

---

## 3. Non-negotiable invariants

1. **All `clawhub install <slug>` lines** come from the **skill registry** via tool-based lookup. Never generate slugs from LLM memory.
2. **Zero API key storage** in any backend code. OAuth/Codex flows are user-side only.
3. **Markdown everywhere.** All inter-agent data and outputs use Markdown. No JSON schemas.
4. **No validation layer** between phases.
5. **Interview Agent's system prompt and knowledge base** are provided by another team and configured in Vapi. Do not modify.
6. **Tier 1-3 transparency** must be reflected in generated guides.
7. **No custom audio/WebSocket code.** Vapi SDK handles all voice infrastructure.

---

## 4. Project structure

```
backend/
├── main.py                    # FastAPI: /webhook (Vapi), /format, /generate-guide, /guide/:id
├── setup_guide_agent/
│   ├── __init__.py
│   └── agent.py              # Setup Guide Creation Agent (SDK TBD)
├── formatter.py               # Single LLM call: transcript → clean Markdown
└── vapi_config.py             # Vapi assistant ID, keys, webhook event handling

frontend/
├── src/
│   ├── App.jsx
│   ├── InterviewView.jsx      # Two-panel layout (agent presence + transcript)
│   ├── SetupGuideView.jsx     # Loading UI → output display
│   ├── useVapi.js             # Vapi SDK hook (start/stop, event listeners)
│   └── components/
│       ├── AgentPresence.jsx  # 2 avatar PNGs (listening/talking) + animated mic circle
│       ├── Transcript.jsx     # Live transcript fed by Vapi message events
│       ├── LoadingScreen.jsx  # Phase 2 waiting state
│       └── OutputDisplay.jsx  # Rendered Markdown + copy + download
├── public/
│   ├── agent-listening.png
│   └── agent-talking.png
├── package.json               # Deps: @vapi-ai/web (or @vapi-ai/client-sdk-react)
└── vite.config.js

system_knowledge_base/          # Other team — do not modify
```

---

## 5. Build order

### Step 1: Interview Phase (Vapi + frontend)
- Get Vapi Assistant ID and Public Key from teammate
- Create `useVapi.js` hook: `vapi.start()`, `vapi.stop()`, event listeners
- Build two-panel layout: `InterviewView.jsx`
  - Left: `AgentPresence.jsx` — swap between listening/talking PNGs based on Vapi `speech-start`/`speech-end` events + animated mic circle
  - Right: `Transcript.jsx` — append text from Vapi `message` events
- On `call-end` event: collect transcript, trigger Formatter

### Step 2: Interview Formatter
- Create `backend/formatter.py`
- Single LLM API call — takes raw transcript, returns clean Markdown
- No intent changes, grammar cleanup only

### Step 3: Setup Guide Creation Phase
- Create `backend/setup_guide_agent/agent.py`
- SDK/framework TBD — **decide before starting this step**
- Agent produces: `OPENCLAW_ENGINE_SETUP_GUIDE.md` + `reference_documents/` + `prompts_to_send.md`
- Build `SetupGuideView.jsx`: loading screen → three-section output display with copy/download

### Step 4: Backend webhook (if needed)
- Create `backend/main.py` with `/webhook` endpoint for Vapi server URL
- Handle `end-of-call-report`, `function-call`, `transcript` events
- Only needed if the Vapi assistant uses server URL features (tools, dynamic config)

---

## 6. Do not

- Write WebSocket or audio capture/playback code (Vapi handles this)
- Invent skill slugs not in the skill registry
- Store API keys or secrets in frontend code (Vapi Public Key is OK — it's publishable)
- Add a validation layer between phases
- Use JSON schemas for inter-agent data
- Modify files in `system_knowledge_base/`
- Add pause/resume functionality (deferred to post-MVP)
- Create chat bubble UI — use transcript-first layout

---

## 7. Vapi SDK reference

```jsx
// Frontend integration
import Vapi from "@vapi-ai/web";
const vapi = new Vapi(PUBLIC_KEY);

vapi.start(ASSISTANT_ID);           // Start voice call
vapi.stop();                         // End voice call

vapi.on("speech-start", () => {});   // Someone started speaking
vapi.on("speech-end", () => {});     // Someone stopped speaking
vapi.on("message", (msg) => {});     // Transcript data (partial/final, with role)
vapi.on("call-start", () => {});     // Call connected
vapi.on("call-end", () => {});       // Call ended — trigger Phase 2
vapi.on("error", (err) => {});       // Error handling
```

---

## 8. L4 reference (layout only)

Way Back Home L4 (`way-back-home/level_4/`) is reference for UI layout patterns only. We do NOT use:
- `main.py` WebSocket/ADK code
- `useGeminiSocket.js`
- `LiveRequestQueue`, `Runner.run_live`, `StreamingMode.BIDI`
- Any `google-adk` or `google-genai` dependencies

---

*Aligned with OpenClaw Concierge architecture v4.0 — Vapi (2026-03-22).*
