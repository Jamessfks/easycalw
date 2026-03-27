# Media & Content Creation with OpenClaw — Metics Media Approach — OpenClaw Reference Guide

## What This Covers
This tutorial shows how to use OpenClaw as a complete media production assistant, inspired by the Metics Media approach to AI-powered content creation. You will set up workflows for video production, blog writing, social media management, audience research, and brand building. Every step uses real OpenClaw skills to automate the most time-consuming parts of content creation while keeping creative control in your hands.

## Who This Is For
Content creators, YouTubers, bloggers, social media managers, and small media teams who want to produce more content in less time. You create content regularly (at least weekly) and feel the bottleneck is research, editing, and distribution rather than ideas. You do not need to be technical — this guide assumes no coding experience.

## Prerequisites
- OpenClaw installed with a working AI model (paid recommended for content quality)
- A Google account for Gmail, Calendar, and Drive access
- Social media accounts you want to manage (Instagram, X/Twitter, YouTube)
- An Obsidian vault or willingness to set one up for content planning
- 45-60 minutes for initial setup
- Security basics installed (`skill-vetter`, `prompt-guard`, `agentguard`)

---

## Step-by-Step Walkthrough

### Phase 1 — Content Research Engine

The foundation of good content is understanding what your audience wants. Set up your research stack first.

#### Step 1: Install Research Skills

```bash
clawhub install skill-vetter
skill-vetter tavily-web-search
clawhub install tavily-web-search
skill-vetter aeo-prompt-question-finder
clawhub install aeo-prompt-question-finder
skill-vetter youtube-summarizer
clawhub install youtube-summarizer
skill-vetter brave-search
clawhub install brave-search
clawhub install summarize
```

#### Step 2: Audience Question Discovery

The `aeo-prompt-question-finder` skill surfaces real questions people type into Google. This is gold for content creators:

Ask: "What are people asking about [your niche]? Give me the top 20 questions from Google Autocomplete, grouped by topic."

Example for a tech channel:
"What are people asking about AI agents in 2026? Group by beginner questions, comparison questions, and how-to questions."

The output becomes your content calendar backbone. Each question is a potential video, article, or social post.

#### Step 3: Competitive Content Analysis

Ask: "Find the top 5 YouTube videos about [topic]. Summarize each one: what they cover, what angle they take, and what comments say viewers want more of."

The `youtube-summarizer` extracts transcripts and key points. Combined with `tavily-web-search` for blog competitors, you see exactly what exists and where the gaps are.

#### Step 4: Save Research to Your Content Vault

```bash
skill-vetter obsidian
clawhub install obsidian
```

Ask: "Save this research to my Obsidian vault under /Content-Research/[topic]. Include the audience questions, competitor analysis, and 3 unique angle suggestions."

Over time, your Obsidian vault becomes a searchable content ideas database.

---

### Phase 2 — Video Production Pipeline

For YouTube creators and video content producers.

#### Step 1: Script Writing Workflow

Ask your agent:
"Write a 10-minute YouTube script on [topic]. Structure:
- Hook (first 15 seconds) — start with a surprising fact or bold claim
- Problem statement (30 seconds)
- 3 main points with examples (7 minutes)
- Practical takeaway (1 minute)
- Call to action (30 seconds)
Include suggested B-roll descriptions for each section."

The agent produces a structured script with visual cues for your editor.

#### Step 2: Thumbnail and Title Research

Ask: "Analyze the top 10 performing videos on [topic]. What thumbnail patterns do they use? What title formats get the most views? Suggest 5 title options for my video using proven patterns."

#### Step 3: Audio Transcription for Repurposing

```bash
skill-vetter openai-whisper
clawhub install openai-whisper
```

After recording your video, transcribe it locally:

Ask: "Transcribe this audio file: [path]. Clean up the transcript, remove filler words, and format it as a blog post with headers."

The `openai-whisper` skill runs locally — your audio never leaves your machine. The transcript becomes the foundation for blog posts, social media threads, and newsletter content.

#### Step 4: Video Content from Text

```bash
skill-vetter video-generation
clawhub install video-generation
```

For supplementary content or social clips:

Ask: "Generate a 30-second video clip that illustrates [concept] for use as B-roll in my video."

---

### Phase 3 — Blog and Written Content

#### Step 1: Blog Post Pipeline

Ask: "Write a blog post based on my video script about [topic]. Adapt it for readers instead of viewers:
- SEO-optimized title
- Meta description (155 characters)
- Introduction with hook
- 5 sections with headers
- Conclusion with internal links
- Suggested tags and categories"

#### Step 2: SEO Optimization

Use the research from Phase 1:

Ask: "Take the audience questions from my research on [topic] and incorporate them as H2 headers in the blog post. Add FAQ schema markup at the bottom."

The `aeo-prompt-question-finder` data directly feeds your SEO strategy.

#### Step 3: Content Repurposing Chain

One video becomes multiple content pieces:

1. Video script (written by agent)
2. Recorded video (you record)
3. Transcript (via `openai-whisper`)
4. Blog post (adapted from transcript)
5. Social media posts (extracted key points)
6. Newsletter excerpt (summarized via `summarize`)
7. Thread (formatted for X/Twitter)

Ask: "Take this blog post and create: 5 tweet-sized key points for X, 3 Instagram caption drafts, and a 200-word newsletter teaser."

---

### Phase 4 — Social Media Management

#### Step 1: Install Social Skills

```bash
skill-vetter bird
clawhub install bird
skill-vetter instagram
clawhub install instagram
```

#### Step 2: Content Calendar Creation

```bash
skill-vetter gog
clawhub install gog
```

Ask: "Create a 2-week social media calendar for my [niche] brand. Include:
- 3 posts per week on Instagram (mix of carousels, reels ideas, and stories)
- 5 tweets per week on X (mix of insights, questions, and thread ideas)
- 1 long-form post per week (LinkedIn or blog)
Add all posting dates to my Google Calendar with reminders."

#### Step 3: Visual Content Creation

```bash
skill-vetter image-generation
clawhub install image-generation
skill-vetter canva
clawhub install canva
```

Ask: "Generate hero images for my next 5 blog posts. Use a consistent style: clean backgrounds, bold typography overlay space, tech-forward aesthetic."

For branded templates:
"Create a Canva template for my Instagram posts. Use my brand colors [specify], my logo, and a consistent layout for quote-style posts."

#### Step 4: Engagement Monitoring

Ask: "Check my X mentions and replies from the last 24 hours. Summarize the sentiment. Are there any questions I should respond to? Draft replies for the top 3."

The `bird` skill monitors your X presence. Combined with `instagram`, you manage both platforms from one interface.

---

### Phase 5 — Analytics and Growth

#### Step 1: Website Analytics

```bash
skill-vetter ga4-analysis
clawhub install ga4-analysis
```

Ask: "How did my website perform this week? Which blog posts are getting the most traffic? Where are visitors coming from? What is my bounce rate trend?"

GA4 insights in plain English without navigating the dashboard.

#### Step 2: Content Performance Review

Ask: "Compare the performance of my last 10 blog posts. Which topics drive the most traffic? Which ones have the best time-on-page? Suggest 5 new topics based on what is working."

#### Step 3: Growth Tracking

```bash
openclaw cron add "0 9 * * 1 openclaw run 'Weekly content report: GA4 traffic summary, top performing posts, social media engagement trends, and 3 content suggestions for this week'" --name weekly-content-report
```

---

### Phase 6 — Communication and Collaboration

#### Step 1: Email for Sponsorships and Outreach

```bash
clawhub install gog
clawhub install agent-mail
```

Ask: "Draft a sponsorship outreach email to [brand]. Include my channel stats, audience demographics, and 3 collaboration ideas. Keep the tone professional but personable."

#### Step 2: Team Communication

```bash
skill-vetter slack
clawhub install slack
```

For content teams:
"Post our content calendar for the week to the #content-planning Slack channel. Tag the editor for video posts and the designer for social graphics."

#### Step 3: Newsletter Management

```bash
skill-vetter mailchannels
clawhub install mailchannels
```

Ask: "Draft this week's newsletter. Start with a personal update, then summarize my latest video and blog post, include 3 curated links from my research, and end with a question for readers."

---

## Key Skills Used

| Skill | Role in Content Pipeline |
|---|---|
| `tavily-web-search` | Competitor and topic research |
| `aeo-prompt-question-finder` | Audience question discovery and SEO |
| `youtube-summarizer` | Video competitor analysis |
| `brave-search` | Supplementary research |
| `summarize` | Content condensation and repurposing |
| `obsidian` | Content ideas vault and research storage |
| `openai-whisper` | Local audio/video transcription |
| `video-generation` | Supplementary video content |
| `image-generation` | Thumbnails and visual assets |
| `canva` | Branded template creation |
| `bird` | X/Twitter management |
| `instagram` | Instagram content management |
| `gog` | Calendar, email, and drive integration |
| `agent-mail` | Email triage and outreach |
| `ga4-analysis` | Website analytics |
| `slack` | Team communication |
| `mailchannels` | Newsletter delivery |

---

## Automation Examples

### Weekly Content Planning
```bash
openclaw cron add "0 9 * * 1 openclaw run 'Generate this week content plan: research trending topics in my niche, suggest 2 video ideas, 1 blog post, and 10 social posts. Save to Obsidian.'" --name weekly-plan
```

### Daily Social Media Check
```bash
openclaw cron add "0 8 * * * openclaw run 'Check X and Instagram for mentions, replies, and DMs. Summarize engagement and draft responses for urgent messages.'" --name daily-social
```

### Weekly Analytics Report
```bash
openclaw cron add "0 10 * * 5 openclaw run 'GA4 weekly report: traffic, top content, referral sources. Compare to last week. Suggest next week focus.'" --name weekly-analytics
```

### Monthly Content Audit
```bash
openclaw cron add "0 10 1 * * openclaw run 'Audit last month content: which posts performed best, which underperformed, audience growth trends, and strategic recommendations for next month.'" --name monthly-audit
```

---

## Tips and Best Practices

1. **Research before you create.** Always run `aeo-prompt-question-finder` before starting a new piece of content. Knowing what people actually ask prevents you from creating content nobody searches for.

2. **Repurpose everything.** One video should become at least 5 pieces of content. Use `openai-whisper` for transcription and the agent for reformatting across platforms. This is the single biggest multiplier for small content teams.

3. **Build your Obsidian content vault early.** Every research session, competitor analysis, and content idea goes into Obsidian. After 3 months, you will never run out of content ideas again.

4. **Use `summarize` for content consumption too.** When you find a long article or video relevant to your niche, summarize it and save the key points. This feeds your content pipeline and keeps you informed without consuming hours.

5. **Batch your content work.** Use the agent to prepare all your research on Monday, write scripts on Tuesday, and schedule distribution for the rest of the week. Batching with AI assistance makes solo creators competitive with small teams.

---

## Common Gotchas

1. **Image generation quality varies.** The `image-generation` skill depends on the underlying model provider. For professional thumbnails, generate multiple options and pick the best one. Always add your own text overlays for readability.

2. **Social media API rate limits.** The `bird` and `instagram` skills are subject to platform API rate limits. If you manage multiple accounts or post frequently, you may hit daily limits. Space out automated actions.

3. **SEO suggestions need human judgment.** The agent produces solid SEO recommendations, but search algorithms change. Cross-reference agent suggestions with your own analytics data and current SEO best practices.

---

## Next Steps

- Set up the research engine first (Phase 1) — it informs everything else
- Add video production tools if you are a video creator (Phase 2)
- Build your content repurposing workflow (Phase 3)
- Automate analytics and reporting (Phase 5)
- Review your content vault in Obsidian monthly and prune ideas that are no longer relevant
- Explore `presentation-maker` for creating pitch decks for sponsorship outreach
- Consider `elevenlabs-agents` for adding voiceover capabilities to your content pipeline
