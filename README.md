# EasyClaw

![Commits](https://img.shields.io/github/commit-activity/t/kaanclaw/easyclaw?style=flat-square&color=00d8ff&label=commits)
![Tests](https://img.shields.io/badge/tests-21%20passing-brightgreen?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-Railway-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

**Voice interview → personalized AI setup guide.**
Talk for 2 minutes, get a complete OpenClaw configuration.

---

<!-- TODO: Add demo GIF here — screen recording of a full interview → guide flow -->
> 🎬 **Demo GIF coming soon** — a 30-second walkthrough from voice interview to finished guide.

---

## 🔍 How it works

```
🎙️ Talk  →  🤖 AI reads 499 docs  →  📋 Get your guide
```

1. **Talk** — Have a voice conversation about your business needs
2. **Process** — AI searches 499 knowledge base docs, picks the 12 most relevant
3. **Receive** — Get a 28K-character setup guide with install commands, config, and prompts

---

## ✨ What makes it good

- 🎙️ **Voice-first** — Vapi handles ASR/TTS/interruption
- 🧠 **Semantic retrieval** — FAISS indexes 499 KB docs, pre-selects the 12 most relevant per user
- ✅ **Quality gating** — Gemini Flash evaluates every guide on 5 criteria before delivery
- ⚡ **Demo mode** — pre-cached guides load in 20 seconds
- 🔄 **Auto-fallback** — switches to Gemini 2.5 Pro if Anthropic is unavailable
- 📱 **Mobile-ready** — responsive interview + output UI
- 🛡️ **Production-hardened** — SSE heartbeat, persistent storage, HMAC webhooks

---

## 🚀 Quick Start

```bash
# 1. Install & configure
uv sync && cp backend/.env.template backend/.env   # fill in API keys

# 2. Start backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000

# 3. Start frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173** and start talking.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│  User (voice) ↔ Vapi Cloud ↔ Interview Agent       │
└──────────────────────┬──────────────────────────────┘
                       │ transcript
          ┌────────────▼────────────┐
          │  Formatter              │
          │  Gemini Flash → Haiku   │
          └────────────┬────────────┘
                       │
          ┌────────────▼──────────────────────────┐
          │  Setup Guide Agent                    │
          │  • FAISS semantic search (499 docs)   │
          │  • Claude Sonnet (40 turns)           │
          │  • LLM-as-judge quality gate          │
          └────────────┬──────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │  Output                 │
          │  • 28K char guide       │
          │  • Reference docs       │
          │  • Prompts to send      │
          └─────────────────────────┘
```

---

## 📚 Knowledge Base

| Resource | Count |
|----------|-------|
| OpenClaw documentation | 349 pages |
| Domain use cases | 70 industries |
| Skills registry | 153 skills |
| Setup guides | 5 deployment types |

---

## 🛠️ Built with

**Vapi** · **Claude Agent SDK** · **Gemini** · **FastAPI** · **React + Vite** · **FAISS** · **Railway**

---

Built at a hackathon in SF, March 2026.
