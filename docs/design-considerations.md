# Design Considerations — OpenClaw Concierge

**Source:** Travis, Zi Cheng, and Zixuan engineering discussion (2026-03-22)
**Status:** Decisions locked — ready for implementation planning

---

## 1. System Architecture: Two Phases + Formatter

The system has **two distinct phases** with a **formatter step** in between. There is **no validation layer** — removed for simplicity.

```
[Phase 1: Interview] → [Formatter LLM Call] → [Phase 2: OpenClaw Setup Guide Creation]
```

### 1.1 Phase 1: Interview Phase

- **Bi-directional voice conversation** between the user and the Interview Agent (Agent 1)
- Built on **Vapi** (voice AI platform) — handles ASR, TTS, streaming, interruption, turn-taking
- The Vapi assistant is **already built** by the team — we integrate it via the Vapi React SDK
- The Interview Agent decides when the conversation has gathered enough information and ends the call
- There is **no mechanism for the user to go back in conversation turns**
- Pause/resume is a desired feature but **deferred to post-MVP** (see §2.8)
- The Interview Agent's system prompt and knowledge base are handled by another team (see §4)

**Target user personas:** Business owners, employees, people across different industries (real estate, restaurant, government, project management), and non-technical users ("grandpa" persona — someone with minimal tech literacy).

**Interview Agent's knowledge base** (provided by other team):
- `system_prompt` — base conversation logic
- `domain_knowledge/` — industry folders (most popular industries with OpenClaw) + a combined industries & use cases details file (one `.md`)
- `skill_registry.md` — the full skill registry (accessed via tool-based lookup, not embedded in prompt)

**Output:** Raw interview transcript (audio → text via ASR)

### 1.2 Intermediate Step: Interview Formatter

- A single LLM call (not an agent, not interactive)
- Takes the raw interview transcript and formats it into **clean Markdown**
- **No intent changes** — purely grammar cleanup, formatting, and parsing
- Produces `INTERVIEW_TRANSCRIPT.md`

**Purpose:** Ensures the Setup Guide Creation Agent receives a clean, well-structured input regardless of ASR quality or conversational messiness.

### 1.3 Phase 2: OpenClaw Setup Guide Creation Phase

- A **backend-only agent** (Agent 2) — runs on the server while the frontend displays a loading UI. The user does **not interact** with it
- Receives the formatted transcript from the Formatter step

**Setup Guide Creation Agent's knowledge base:**
- `system_prompt` — its own system prompt (separate from the Interview Agent's)
- **All context from the interview** — the formatted transcript is injected as input
- **OpenClaw Skill** — a standalone custom skill created by Travis (not the same as the skill registry; this is a single tool the agent can use)
- **Setup guides** (files) — researched guides from the internet for OpenClaw setup patterns, including setup steps documentation

**Output files produced:**

| Output | Description |
|--------|-------------|
| `OPENCLAW_ENGINE_SETUP_GUIDE.md` | The main setup guide — the primary deliverable |
| `reference_documents/` (folder) | Sub-setup documents for long sub-steps that the user may or may not need. These are **referenced by** the main setup guide (e.g., "see reference doc X if you need to do Y"). Contains: YAML configs, mini setup `.md` files, initial setup `.md` |
| `prompts_to_send.md` | A set of **messages for the user to send** to their OpenClaw instance after setup is complete. These initialize the OpenClaw agent with personality, talking style, user preferences, and other customizations discovered during the interview. Contains multiple prompts (e.g., prompt 1, prompt 2, etc.) |

- The `reference_documents/` folder is **dynamically generated** — its contents vary per user based on what the setup guide needs to reference
- This phase runs entirely in the background; the user waits with a loading UI
- **Expected duration:** Up to ~5 minutes (long generation)

---

## 2. Interview Phase UI (Vapi + L4 layout patterns)

### 2.1 Core concept: transcript-first, voice-assisted

The UI is **not** a chat bubble interface. The **live transcript** is the primary visual artifact during the interview. Voice is the input/output modality, but what the user sees is the conversation being transcribed in real time.

### 2.2 Layout: left panel (agent) + right panel (transcript)

The interview screen is a **two-panel layout**:

- **Left panel:** The **agent presence area** — shows the agent avatar and current interaction state
- **Right panel:** The **live transcript** — the primary artifact. Scrolling text with speaker labels and timestamps

### 2.3 Agent presence: PNG icon + animated mic circle (DECIDED)

**Decision: Travis's PNG avatars + animated mic circle approach.** The 3D model approach was considered but rejected as too complex for our needs.

- **Two PNG avatar images** (already created) displayed on the left panel:
  - **Listening state avatar** — shown when the user is speaking or during idle
  - **Talking state avatar** — shown when the agent is speaking or thinking
- The UI **swaps between the two PNGs** based on the current voice state
- Below or around the avatar: a **circular mic/waveform UI element** that changes based on state
- The animation is on the **circle element**; the avatar swaps are discrete (not animated transitions)

### 2.4 Voice state indicator (bi-directional mic)

The mic circle element reflects these states:

| State | Visual (mic circle) | What's happening |
|-------|---------------------|-----------------|
| **Idle** | Listening avatar + mic icon, neutral ring | No one is speaking |
| **User speaking** | Listening avatar + ring pulses with user's audio amplitude (e.g. green waveform) | Audio flowing to Vapi (triggered by Vapi `speech-start` event) |
| **Agent thinking** | Talking avatar + ring shows animated dots or breathing pulse | Model is processing — user **can still talk** (interruption OK, Vapi handles it) |
| **Agent speaking** | Talking avatar + ring animates with agent's audio waveform (e.g. blue, amplitude-reactive) | Agent audio streaming back via Vapi TTS |

**Waveform detail:** The mic circle should react to audio amplitude in real time — similar to voice input visualizers found in open-source projects (search GitHub for "audio visualizer react" or "voice waveform component"). When the agent speaks, the circle's waveform shows the agent's audio intonation/volume.

### 2.5 Streaming & interruption behavior

**Streaming is always on.** Vapi maintains a continuous WebRTC connection and is never discontinued unless the user ends the call. Key behaviors:

- **The user can interrupt the agent at any time**, even while the agent is thinking or speaking. Vapi handles barge-in natively — it cuts off the agent's audio and restarts with updated context.
- **Streaming partial responses** — the agent starts streaming via Vapi's TTS as soon as it has partial output, reducing perceived latency.
- **Visual thinking indicator** — the mic circle shows the "thinking" state animation, but this is purely informational. It does **not** gate or suppress user input.

> **Note:** Filler audio, transition words, and other agent-side response behaviors are **out of scope** for the client team. The other team working on the Interview Agent's system prompt is handling how the agent communicates thinking/processing states conversationally. We only handle the visual UI states.

### 2.6 Transcript display during interview

The transcript panel should show:
- **Speaker labels:** `User:` and `Agent:` with timestamps
- **Real-time streaming:** Words appear as spoken (ASR for user, token streaming for agent)
- **Thinking indicator inline:** When the agent is thinking, the transcript could show `Agent: [thinking...]` before the response appears

### 2.7 Conversation flow controls

- **No going back** in conversation turns
- **No retry / refine** — once the interview is done, it's done
- **No transcript editing** by the user — the Formatter step handles cleanup
- The Interview Agent decides when to end the conversation (enough information gathered)

### 2.8 Pause / Resume (DEFERRED — post-MVP)

Pause/resume was discussed and both Travis and Zi Cheng agreed it's a good feature, but it's **deferred to post-MVP** due to implementation complexity:

- Pausing requires ending the Vapi call and persisting state (conversation context, partial transcript)
- Resuming requires starting a new Vapi call with the full prior context injected so the agent can review the past conversation
- Backend session persistence adds infrastructure scope (database, transcript storage)

**For MVP:** The interview runs in a single Vapi call. If the user closes the browser, the call ends and the session is lost.

---

## 3. OpenClaw Setup Guide Creation Phase UI

### 3.1 Loading / waiting state

When Phase 2 begins, the UI transitions to a **loading screen**:
- Clear messaging: "Generating your OpenClaw Setup Guide..."
- Progress indicator (spinner or progress bar)
- Estimated wait time notice (~5 minutes)
- The user **cannot interact** with the agent during this phase

### 3.2 Displaying the final output

Once the Setup Guide Creation Agent finishes, the UI presents three output sections:

**A. Main Setup Guide** (`OPENCLAW_ENGINE_SETUP_GUIDE.md`):
- **Rendered Markdown** with syntax highlighting for code blocks
- **Section navigation** — collapsible or tabbed sections
- **Copy buttons** on code blocks for easy terminal paste
- **Download** as `.md` file
- Inline links to reference documents where relevant

**B. Reference Documents** (`reference_documents/`):
- Sub-setup guides for optional or conditional long steps
- Each is a standalone `.md` or `.yaml` file
- Accessible from links within the main guide, or browsable in a sidebar/accordion
- **Download** as a folder/zip

**C. Prompts to Send** (`prompts_to_send.md`):
- A set of ready-to-use messages the user copies and sends to their OpenClaw instance after setup
- These initialize the agent with personality, talking style, and user-specific preferences
- Each prompt should have a **copy button** for easy paste
- **Download** as `.md` file

### 3.3 No retry flow

There is no "Start Over" or "Refine" button. The flow is linear:
1. Interview → 2. Format → 3. Generate guide → 4. Done

If the user wants a different result, they start a completely new session.

---

## 4. System Prompt & Knowledge Base (Other Team's Responsibility)

> **Important:** The system prompt architecture, knowledge base content, and agent behavior design are handled by **another team**. The decisions below are documented for reference but are **not our responsibility to implement**.

### 4.1 What the other team is providing

- The **Interview Agent's system prompt** — including conversation flow, decision logic, and how the agent handles thinking states / filler phrases
- The **system knowledge base** (`system_knowledge_base/`) — domain knowledge files, use case files
- The agent already knows how to navigate the skill registry via a custom skill Travis created

### 4.2 Decisions made

- **Large context approach** — the other team has engineered a way to handle the large system prompt effectively
- **Skill registry:** It is large, so it uses **tool-based lookup** (not embedded in the system prompt)
- **Tool access:** SDK/framework for giving the agent tool-based skill lookup is **TBD** — Claude Code SDK is one candidate but not locked in (see §4.3)
- **Format:** All contracts and outputs use **Markdown** (not JSON). Previous docs referencing JSON schemas are outdated.
- **Domain knowledge:** The other team is generating this. For demo/prototype purposes, synthetic data is acceptable.

### 4.3 Setup Guide Creation Agent — SDK/Framework: RocketRide (DECIDED)

**RocketRide** was selected as the pipeline orchestration layer for both the Formatter and the Setup Guide Creation Agent.

| Evaluated | Decision |
|-----------|----------|
| Claude Code SDK | Not selected — RocketRide uses Anthropic Claude via `llm_anthropic` nodes instead |
| Google ADK | Not selected — overkill for non-interactive background agent |
| LangChain / LangGraph | Not selected — extra dependency |
| Direct API + function calling | Not selected — less visibility than RocketRide pipelines |
| **RocketRide** | **Selected** — hackathon requirement, declarative pipelines, built-in monitoring, Anthropic Claude via `llm_anthropic` nodes |

RocketRide runs via Docker (`ghcr.io/rocketride-org/rocketride-engine:latest` on port 5565) and is called from the backend via the Python SDK (`pip install rocketride`). See [`docs/rocketride-reference.md`](rocketride-reference.md) for full details.

---

## 5. Resolved Questions

These questions from the original discussion are now answered:

| # | Question | Answer |
|---|----------|--------|
| 1 | JSON or Markdown contract? | **Markdown.** Previous docs are outdated. |
| 2 | How big is the skill registry? | **Large.** Tool-based lookup; SDK/framework TBD (see §4.3). |
| 3 | Do we need the Interview Agent for V1? | **Yes.** We're building the interview phase first. |
| 4 | Where does system_knowledge_base come from? | **Other team provides it.** Not a blocker for us. |
| 5 | Target latency? | **Not a concern right now.** Will test and iterate. |
| 6 | Should user be able to interrupt agent? | **Yes.** Vapi handles barge-in natively. |
| 7 | Thinking state: client filler or model filler? | **Neither from us.** Visual indicator only; agent behavior is other team's scope. |
| 8 | Retry flow? | **No retry flow.** Pause/resume deferred to post-MVP. |
| 9 | MVP scope? | **Build in phases:** Interview UI + agent flow → Formatter → Setup Guide Creation phase. |
| 10 | Wireframes? | **No.** Will generate UI on the fly during implementation. |

---

## 6. Remaining Open Questions

1. **Barge-in UI behavior:** When the user talks while the agent is speaking, Vapi handles the audio interruption — but how should the **UI** reflect the overlap? Do both waveforms show simultaneously? Does the agent's waveform cut out immediately when Vapi fires `speech-end` for the agent?

2. ~~**Formatter LLM call details:**~~ **RESOLVED — Anthropic Claude** via RocketRide `llm_anthropic` node. Prompt in `backend/formatter.py`.

3. **Setup Guide Creation Agent's system prompt ownership:** Is the other team also responsible for this agent's system prompt, or just the Interview Agent's? The Setup Guide Creation Agent has its own knowledge base with different needs.

4. ~~**Session storage:**~~ **RESOLVED — In-memory dict** on the backend (`guide_store` in `main.py`). No database needed for hackathon. Frontend retrieves via `GET /guide/{id}`.

5. ~~**SDK/framework for Setup Guide Agent:**~~ **RESOLVED — RocketRide** selected. See §4.3.

---

## 7. Implementation Plan (Build Order)

### Step 1: Interview Phase (Vapi SDK + frontend)
- Get Vapi Assistant ID + Public Key from teammate
- Integrate Vapi React SDK (`@vapi-ai/web`)
- Two-panel layout (agent presence + transcript)
- Two PNG avatars (listening/talking) + animated mic circle with 4 states, driven by Vapi events
- Live transcript rendering fed by Vapi `message` events
- No pause/resume for MVP — single Vapi call per session

### Step 2: Interview Formatter (RocketRide pipeline)
- RocketRide pipeline: `webhook → llm_anthropic → response`
- Input: raw transcript text
- Output: `INTERVIEW_TRANSCRIPT.md` (clean Markdown)
- Grammar cleanup, no intent changes
- Graceful fallback if RocketRide engine is unavailable

### Step 3: OpenClaw Setup Guide Creation Phase (RocketRide pipelines)
- 3 sequential RocketRide pipelines via Anthropic Claude
- Background execution (no user interaction)
- Loading UI with progress indication (~5 min wait)
- System prompt + references loaded from placeholder files (other team delivers real ones)
- Output rendering: three sections (main guide, reference docs, prompts to send)
- Copy buttons on prompts and code blocks
- Download functionality (individual files)

---

*Captured from Travis, Zi Cheng, and Zixuan engineering discussion, 2026-03-22.*
*Updated with all decisions from the follow-up session.*
