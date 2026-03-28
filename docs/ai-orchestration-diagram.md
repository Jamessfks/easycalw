# EasyClaw — AI Orchestration & System Design

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                        │
│                                                                             │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────────────────┐  │
│  │   Landing     │───▶│  InterviewView   │───▶│     SetupGuideView       │  │
│  │   Page        │    │  (useVapi hook)  │    │  (useGuideStream hook)   │  │
│  └──────────────┘    └───────┬──────────┘    └────────────┬──────────────┘  │
│                              │                            │                 │
│                     Vapi Web SDK              SSE /events/{id}              │
│                     (@vapi-ai/web)            + polling fallback            │
│                              │                            │                 │
│  ┌───────────────────────────┼────────────────────────────┼──────────────┐  │
│  │  OutputDisplay (3 tabs: Guide | References | Prompts)  ◀──────────── │  │
│  │  + Scorecard + Copy/Download/Share                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬────────────────────────────┬─────────────────┘
                               │                            │
═══════════════════════════════╪════════════════════════════╪═════════════════
                               │                            │
┌──────────────────────────────▼────────────────────────────▼─────────────────┐
│                        BACKEND (FastAPI + Uvicorn)                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         API LAYER                                   │    │
│  │                                                                     │    │
│  │  POST /format ─────────────────────────────▶ Phase 1 (Formatter)   │    │
│  │  POST /generate-guide ─────────────────────▶ Phase 2 (Agent)       │    │
│  │  GET  /events/{id} ────────────────────────▶ SSE Progress Stream   │    │
│  │  GET  /guide/{id} ─────────────────────────▶ Polling Fallback      │    │
│  │  POST /webhook ────────────────────────────▶ Vapi End-of-Call      │    │
│  │  POST /retry-guide/{id} ───────────────────▶ Re-run Failed Guide   │    │
│  │  GET  /demo-stream/{id} ───────────────────▶ Demo SSE Playback     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    PHASE 1: TRANSCRIPT FORMATTER                    │    │
│  │                         (formatter.py)                              │    │
│  │                                                                     │    │
│  │    Raw ASR transcript                                               │    │
│  │         │                                                           │    │
│  │         ▼                                                           │    │
│  │    ┌─────────────────┐  fail   ┌──────────────┐  fail   ┌───────┐ │    │
│  │    │  Gemini 2.5     │────────▶│ Claude Haiku │────────▶│ Regex │ │    │
│  │    │  Flash          │         │ 4.5          │         │       │ │    │
│  │    │  (primary)      │         │ (fallback 1) │         │ (last │ │    │
│  │    │  ~$0.0001/call  │         │ ~$0.003/call │         │resort)│ │    │
│  │    └────────┬────────┘         └──────┬───────┘         └───┬───┘ │    │
│  │             │                         │                     │      │    │
│  │             └─────────────┬───────────┘─────────────────────┘      │    │
│  │                           ▼                                        │    │
│  │                   Clean Markdown transcript                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                PHASE 2: SETUP GUIDE AGENT                           │    │
│  │                  (setup_guide_agent/agent.py)                        │    │
│  │                                                                     │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │              SEMANTIC PRE-SELECTION (kb_search.py)             │  │    │
│  │  │                                                               │  │    │
│  │  │   Formatted transcript                                        │  │    │
│  │  │        │                                                      │  │    │
│  │  │        ▼                                                      │  │    │
│  │  │   ┌──────────────────┐     ┌─────────────────────────────┐   │  │    │
│  │  │   │ Gemini Embedding │────▶│ FAISS Index (499 docs)      │   │  │    │
│  │  │   │ 001 (768-dim)    │     │ IndexFlatIP (cosine sim)    │   │  │    │
│  │  │   └──────────────────┘     └──────────────┬──────────────┘   │  │    │
│  │  │                                           │                   │  │    │
│  │  │                                    Top 12 relevant docs       │  │    │
│  │  └───────────────────────────────────────────┬───────────────────┘  │    │
│  │                                              │                      │    │
│  │  ┌───────────────────────────────────────────▼───────────────────┐  │    │
│  │  │            CLAUDE AGENT SDK LOOP                              │  │    │
│  │  │                                                               │  │    │
│  │  │  Model: claude-sonnet-4-6                                     │  │    │
│  │  │  Max turns: 40 | Budget: $3.00 | Tools: Read,Write,Glob,Grep │  │    │
│  │  │                                                               │  │    │
│  │  │  7-Step Reasoning Chain (system_prompt.md):                   │  │    │
│  │  │  ┌──────────────────────────────────────────────────────┐     │  │    │
│  │  │  │ Step 1 (1-2 turns) │ Read transcript, extract profile│     │  │    │
│  │  │  ├────────────────────┼─────────────────────────────────┤     │  │    │
│  │  │  │ Step 2 (1-2 turns) │ Read KNOWLEDGE_INDEX.md          │     │  │    │
│  │  │  ├────────────────────┼─────────────────────────────────┤     │  │    │
│  │  │  │ Step 3 (3-5 turns) │ Deep-read matched KB docs       │     │  │    │
│  │  │  ├────────────────────┼─────────────────────────────────┤     │  │    │
│  │  │  │ Step 4 (1-2 turns) │ Plan output sections            │     │  │    │
│  │  │  ├────────────────────┼─────────────────────────────────┤     │  │    │
│  │  │  │ Step 5 (15-20 turns)│ Write 3 output files           │     │  │    │
│  │  │  ├────────────────────┼─────────────────────────────────┤     │  │    │
│  │  │  │ Step 6 (2-3 turns) │ Quality self-review             │     │  │    │
│  │  │  ├────────────────────┼─────────────────────────────────┤     │  │    │
│  │  │  │ Step 7 (optional)  │ Patch if quality fails          │     │  │    │
│  │  │  └──────────────────────────────────────────────────────┘     │  │    │
│  │  │                                                               │  │    │
│  │  │  Budget Pressure Protocol:                                    │  │    │
│  │  │  Turn 25: "wrap up"  Turn 30: "finalize now"                  │  │    │
│  │  │  Turn 35: "emergency" Turn 37: "must complete next turn"      │  │    │
│  │  │                                                               │  │    │
│  │  │  ──── FALLBACK: Gemini 2.5 Pro (gemini_agent.py) ────        │  │    │
│  │  │  Triggers when: no ANTHROPIC_API_KEY, or Claude SDK           │  │    │
│  │  │  errors (auth, CLI, exit code failures)                       │  │    │
│  │  │  Single-prompt generation (no multi-turn)                     │  │    │
│  │  └───────────────────────────────────────────┬───────────────────┘  │    │
│  │                                              │                      │    │
│  │                                              ▼                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    OUTPUT FILES                              │    │    │
│  │  │                                                             │    │    │
│  │  │  📄 OPENCLAW_ENGINE_SETUP_GUIDE.md  (~28K chars)           │    │    │
│  │  │  📁 reference_documents/*.md        (sub-step docs)        │    │    │
│  │  │  📄 prompts_to_send.md              (OpenClaw init prompts)│    │    │
│  │  └──────────────────────────────┬──────────────────────────────┘    │    │
│  │                                 │                                   │    │
│  └─────────────────────────────────┼───────────────────────────────────┘    │
│                                    │                                        │
│  ═══════════════════════════════════╪═══════════════════════════════════     │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐    │
│  │              PHASE 3: QUALITY GATE (guide_evaluator.py)             │    │
│  │                                                                     │    │
│  │  ┌───────────────────────────────────────────────────────────┐      │    │
│  │  │            LLM-as-Judge: Claude Haiku 4.5                 │      │    │
│  │  │            Temperature: 0.0 (deterministic)               │      │    │
│  │  │                                                           │      │    │
│  │  │  5 Criteria (scored 1-5 each):                            │      │    │
│  │  │  ┌─────────────────────┬──────────────────────────────┐   │      │    │
│  │  │  │ completeness        │ All expected sections?        │   │      │    │
│  │  │  │ personalization     │ Tailored to THIS user?        │   │      │    │
│  │  │  │ technical_accuracy  │ Commands/paths correct?       │   │      │    │
│  │  │  │ structure_clarity   │ Logical flow, numbered steps? │   │      │    │
│  │  │  │ actionability       │ Follow start-to-finish?       │   │      │    │
│  │  │  └─────────────────────┴──────────────────────────────┘   │      │    │
│  │  │                                                           │      │    │
│  │  │  Pass criteria: mean >= 3.5 AND all scores >= 2           │      │    │
│  │  └───────────────────────────┬───────────────────────────────┘      │    │
│  │                              │                                      │    │
│  │                    ┌─────────▼──────────┐                           │    │
│  │                    │   PASSED?           │                           │    │
│  │                    └─────────┬──────────┘                           │    │
│  │                     YES │          │ NO                              │    │
│  │                         ▼          ▼                                 │    │
│  │                    ┌────────┐  ┌──────────────────────────────┐     │    │
│  │                    │ Ship   │  │ PATCH ATTEMPT                │     │    │
│  │                    │ guide  │  │ Claude Sonnet rewrites       │     │    │
│  │                    │ as-is  │  │ weakest section              │     │    │
│  │                    └────────┘  │ (1 retry, then ship anyway)  │     │    │
│  │                                └──────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    PERSISTENCE LAYER                                │    │
│  │                                                                     │    │
│  │  ┌──────────────┐  ┌───────────────────┐  ┌────────────────────┐   │    │
│  │  │  Supabase     │  │  In-Memory Dict   │  │  Disk (guide_     │   │    │
│  │  │  PostgreSQL   │  │  (fallback if no  │  │  output/{id}/)    │   │    │
│  │  │  (if URL set) │  │   Supabase keys)  │  │  Always written   │   │    │
│  │  └──────────────┘  └───────────────────┘  └────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘


## AI Model Routing Map

┌─────────────────────────────────────────────────────────────────────────┐
│                        MODEL ASSIGNMENTS                                │
│                                                                         │
│  TASK                    MODEL                    COST/CALL   LATENCY   │
│  ─────────────────────── ──────────────────────── ─────────── ───────── │
│  Transcript formatting   Gemini 2.5 Flash         ~$0.0001    ~1-2s     │
│  Formatting fallback     Claude Haiku 4.5         ~$0.003     ~2-3s     │
│  KB embeddings           Gemini Embedding 001     ~$0.0001    ~1s       │
│  Guide generation        Claude Sonnet 4.6 (SDK)  ~$1-3       5-10min   │
│  Guide fallback          Gemini 2.5 Pro           ~$0.50      ~2-3min   │
│  Quality evaluation      Claude Haiku 4.5         ~$0.003     ~3-5s     │
│  Quality patch           Claude Sonnet 4.6        ~$0.05      ~10-15s   │
│  Voice interview         Vapi (hosted LLM+ASR+TTS) per-minute ~2min     │
└─────────────────────────────────────────────────────────────────────────┘


## Real-Time Streaming Architecture

┌──────────────┐         ┌──────────────────────┐         ┌──────────────┐
│   Frontend   │         │    FastAPI Backend    │         │  Agent Loop  │
│              │         │                      │         │              │
│  useGuide    │◀─ SSE ──│ /events/{guide_id}   │◀─Queue──│ agent.py     │
│  Stream()    │         │  EventSourceResponse │         │              │
│              │         │                      │         │  Each turn:  │
│  Progress:   │         │  25s heartbeat       │         │  put({       │
│  - stage     │         │  (Railway proxy)     │         │    stage,    │
│  - turn/40   │         │                      │         │    turn,     │
│  - cost      │         │  Sentinel (None)     │         │    cost      │
│              │         │  = stream ends       │         │  })          │
│              │         │                      │         │              │
│  ┌─────────┐ │         │                      │         │              │
│  │ FALLBACK│ │         │                      │         │              │
│  │ Polling │─┼─ GET ──▶│ /guide/{guide_id}    │         │              │
│  │ 3s int. │ │         │  (guide_store)       │         │              │
│  └─────────┘ │         │                      │         │              │
└──────────────┘         └──────────────────────┘         └──────────────┘


## End-to-End Timeline (Happy Path)

  0s          2s              5s            7s                        5-10min
  │           │               │             │                            │
  ▼           ▼               ▼             ▼                            ▼
┌────┐   ┌────────┐    ┌──────────┐   ┌─────────┐              ┌────────────┐
│Call│   │Vapi    │    │POST      │   │POST     │              │Guide       │
│ends│──▶│returns │───▶│/format   │──▶│/generate│──────────────▶│complete    │
│    │   │transcr.│    │          │   │-guide   │  Agent loop   │+ evaluated │
└────┘   └────────┘    └──────────┘   └─────────┘  (40 turns)  └────────────┘
                        Gemini Flash   Returns                   Claude Haiku
                        ~$0.0001       guide_id                  judges quality
                        <2s            immediately               ~$0.003

  Total E2E: ~5-10 minutes (dominated by agent reasoning loop)
  Total cost: ~$1-3 per guide
