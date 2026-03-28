# Open Debates

Disagreements and unresolved questions. When resolved, mark as resolved and link to the decision in decisions.md.

---

### B2B vs B2C

**Status:** open — leaning B2B but not settled

**Travis thinks:** B2B, targeting SMBs. "Businesses are our customers." Business owners don't know what they want from OpenClaw, don't know how to structure it, and don't have the knowledge of possibilities. We provide that.

**Zicheng thinks:** Prefers B2C general. "B2B requires a lot of credibility." More interested in serving individual users who want to set up OpenClaw for personal use.

**Kaan thinks:** B2B, SMBs. Wants to target business owners, restaurant owners. "We can get 10,000 people seeing this on Instagram." Focuses on business value — replacing $5K consulting with automated setup.

**What would resolve this:** Real customer data. Who actually shows up to use the MVP? What segment converts? The grad student test and campus outreach will provide the first signal.

**Resolve by:** After first 5-10 test users (mid-April)

---

### Knowledge quantity vs quality

**Status:** open

**Kaan thinks:** Gather as much knowledge as possible. "Without knowledge base we're worth nothing. Otherwise we're just Michael." Wants 400+ docs, maximum coverage across industries and use cases.

**Travis thinks:** Quality matters more than volume. "It's not just the knowledge, it's how to navigate those possibilities in the best possible way." The brain needs to make good decisions, not just have more data.

**What would resolve this:** Evals. If guide quality improves more from adding 100 new docs vs. from improving the system prompt's reasoning, that answers the question.

**Resolve by:** After running evals on guide output quality

---

### Output format

**Status:** open — multiple options floated

**Current:** 3 markdown files (setup guide + reference docs + prompts to send)

**Travis floated:** Hey.gen avatar that walks the customer through the setup. Or documentation + a follow-up call.

**Zicheng noted:** "It's only empty files. The user will probably not find it." (about competitor outputs) — suggesting our output needs to be more engaging than just files.

**Key tension:** Markdown is simple and works, but is it enough for non-technical customers? An avatar walkthrough is more engaging but adds significant complexity. A follow-up call adds human touch but doesn't scale.

**What would resolve this:** Test user feedback. Do they actually read and follow the markdown guide? Or do they get lost?

**Resolve by:** After first test user sessions

---

### Do customers want voice or text input?

**Status:** open — voice is MVP but question remains

**Pranav thinks:** "Most people would like to talk."

**Travis thinks:** "That's a big question actually. Do our customers want to talk more or do they want to type and have precision of thought and editing without penalizing the conversation?"

**Zicheng thinks:** "Voice adds a lot of extra steps. Very excessive." Prefers simpler approaches.

**Decision so far:** Voice first, add text later (see decisions.md). But the fundamental question of what customers prefer is still open.

**What would resolve this:** A/B test or just asking test users after they use the voice interview. "Would you have preferred to type this?"

**Resolve by:** After first 5-10 test users

---

### Pricing

**Status:** open — research done, no number chosen

**What we know:**
- Michael charges $5K-6K (ceiling for manual setup)
- HiredYou.ai charges $29 one-time (floor for pre-built kits)
- $200-$2K range is nearly empty in the market (our gap)
- Hosting alone is $4-15/mo (commodity, not our game)
- Klaus managed rollout is $1K+/mo
- We don't know our actual cost per guide yet

**What would resolve this:** Measure real cost per guide (Vapi minutes + Claude tokens + Gemini + Railway). Then figure out margin. Then test price sensitivity with real users.

**Resolve by:** After measuring cost per guide and getting customer willingness-to-pay signals
