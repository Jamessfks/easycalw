# YouTube Research and Content Planning — OpenClaw Reference Guide

## What This Does

OpenClaw automates the research, competitive analysis, and pre-production planning phases of YouTube content creation. It monitors competitor channels and trending topics in your niche, summarizes relevant videos so you do not have to watch every one, tracks performance patterns across your own uploads, researches topics for upcoming videos, generates script outlines, and maintains a structured content calendar. This addresses the research bottleneck that causes most creators to publish inconsistently.

## Who This Is For

**Primary user:** YouTube creators (educational, commentary, review, tutorial, or niche content channels) who publish 1-4 videos per week and struggle with the research and planning phase more than the filming or editing.

**Industry:** Content creation, education, marketing, product reviews, technology commentary, business thought leadership.

**Pain point:** You know what makes a good video — the problem is finding the right topic at the right time, doing enough research to say something original, and keeping a consistent publishing cadence. You spend 3-6 hours per video on research and outlining before you even turn on the camera. Competitor monitoring alone could be a part-time job. You need a research assistant that works while you sleep.

**Technical level:** Comfortable with YouTube Studio, Google tools, and content management. No programming required.

## OpenClaw Setup

### Required Skills

Install these skills via `clawhub install <skill-name>`:

| Skill | Purpose in This Workflow |
|---|---|
| `skill-vetter` | Security-first: scan all skills before installing |
| `prompt-guard` | Protect the agent when reading external web content and comments |
| `agentguard` | Prevent the agent from posting, commenting, or uploading anything without approval |
| `youtube-summarizer` | Extract transcripts and key points from competitor and reference videos |
| `tavily-web-search` | Research topics, find supporting data, and discover trending angles |
| `summarize` | Condense long articles, papers, and reports into research notes |
| `gog` | Google Calendar for content scheduling, Google Sheets for tracking, Google Docs for scripts |
| `obsidian` | Central knowledge base for research notes, script outlines, and content calendar |
| `bird` | Monitor X for trending topics, audience reactions, and creator discussions in your niche |
| `agent-browser` | Navigate YouTube Studio, Social Blade, and other analytics platforms |
| `web-scraper-as-a-service` | Set up recurring scrapers for niche forums, subreddits, and industry news sites |
| `self-improving-agent` | Learn your content style, scripting patterns, and editorial preferences over time |
| `google-search` | Structured Google search for SEO keyword research and topic validation |

### Optional Skills

| Skill | Purpose |
|---|---|
| `exa-web-search-free` | Free technical search for finding developer or academic sources |
| `brave-search` | Alternative search for diverse source coverage |
| `aeo-prompt-question-finder` | Discover what questions people ask about your topics (Google Autocomplete data) |
| `ga4-analysis` | If you run a companion website or blog, track which topics drive traffic |
| `notion` | Alternative to Obsidian for teams using Notion as their content hub |
| `canva` | Generate thumbnail concepts and social media graphics |
| `image-generation` | Create custom reference images or thumbnail mockup concepts |
| `slack` | Team coordination for multi-person content operations |
| `data-analyst` | Analyze performance data exports from YouTube Studio |
| `duckdb` | Run SQL queries against exported YouTube analytics CSV data |

### Channels to Configure

1. **Obsidian vault:** Create a `YouTube/` folder with subfolders: `Research/`, `Scripts/`, `Calendar/`, `Competitors/`, and `Analytics/`.
2. **Google Sheets:** Set up a content tracker spreadsheet via `gog` with columns: Video Title, Status, Topic, Research Date, Publish Date, Views (7-day), CTR.
3. **Competitor list:** Maintain a list of 5-15 competitor channel URLs in `YouTube/Competitors/channels.md`.
4. **Topic seed list:** Keep a running list of topic ideas in `YouTube/Research/topic-seeds.md` that the agent can reference and expand.

### Hardware Recommendations

- **Minimum:** Any Mac with 8 GB RAM. YouTube research is web-based and not compute-intensive.
- **Recommended:** Mac Mini M2 with 16 GB RAM for continuous background monitoring and faster transcript processing via `youtube-summarizer`.
- **Storage:** Minimal. Research notes and scripts are text-only. Budget 500 MB for a year of content planning data.

## Installation Walkthrough

### Step 1: Security Foundation

```
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

### Step 2: Core Skills

```
skill-vetter youtube-summarizer && clawhub install youtube-summarizer
skill-vetter tavily-web-search && clawhub install tavily-web-search
skill-vetter summarize && clawhub install summarize
skill-vetter gog && clawhub install gog
skill-vetter obsidian && clawhub install obsidian
skill-vetter bird && clawhub install bird
skill-vetter agent-browser && clawhub install agent-browser
skill-vetter web-scraper-as-a-service && clawhub install web-scraper-as-a-service
skill-vetter self-improving-agent && clawhub install self-improving-agent
skill-vetter google-search && clawhub install google-search
```

### Step 3: API Key Configuration

- **Google Account (OAuth):** Required for `gog` (Calendar, Sheets, Docs).
- **Tavily API Key:** Required for `tavily-web-search`. Sign up at tavily.com.
- **Google Custom Search API Key + CSE Engine ID:** Required for `google-search`. Set up via Google Cloud Console.
- **X Developer API Key:** Required for `bird`. Apply at developer.x.com.

### Step 4: Obsidian Vault Structure

```
YouTube/
  Research/
    topic-seeds.md
  Scripts/
    template.md
  Calendar/
    calendar.md
  Competitors/
    channels.md
  Analytics/
```

### Step 5: Script Template

Create `YouTube/Scripts/template.md` with your standard video structure:

```
# [VIDEO TITLE]

## Hook (0:00-0:30)
[Opening line that grabs attention]

## Problem Statement (0:30-1:30)
[What problem does this video solve?]

## Main Points
### Point 1: [Title]
[Evidence, data, or example]

### Point 2: [Title]
[Evidence, data, or example]

### Point 3: [Title]
[Evidence, data, or example]

## Counterargument / Nuance
[Acknowledge the other side]

## Call to Action
[What should the viewer do next?]

## Estimated Runtime: [X] minutes
```

### Step 6: Verify Connections

```
openclaw "use youtube-summarizer to summarize this video: [paste a test URL]"
openclaw "search tavily-web-search for 'best personal finance YouTube channels 2026'"
openclaw "check Google Calendar via gog for this week's events"
openclaw "create a test note in Obsidian at YouTube/Research/test.md"
```

## Core Automation Recipes

### 1. Daily Competitor Channel Scan

Monitor competitor channels every morning for new uploads.

```
openclaw cron add --every day --at 06:30 "read the competitor channel list from Obsidian at YouTube/Competitors/channels.md, check each channel for videos uploaded in the last 24 hours using agent-browser, for each new video use youtube-summarizer to extract the title, duration, key points, and transcript summary, and save the results to Obsidian at YouTube/Competitors/scan-{{date}}.md"
```

### 2. Trending Topic Discovery

Search for trending topics in your niche twice daily.

```
openclaw cron add --every 12h "search tavily-web-search and google-search for trending topics related to [your-niche-keywords], check bird for trending discussions and viral threads in the same space, cross-reference with the last 30 days of competitor scans in Obsidian, and save a ranked list of 10 potential video topics to YouTube/Research/trending-{{date}}.md with a novelty score (has this been covered by competitors recently?) and estimated search volume"
```

### 3. Deep Topic Research

When you select a topic, run comprehensive research automatically.

```
openclaw cron add --every 1h "check Obsidian at YouTube/Research/ for any file with [RESEARCH-ME] tag, for each tagged topic: search tavily-web-search for the 10 most authoritative sources, use summarize on each source, search youtube-summarizer for the top 5 existing YouTube videos on this topic and summarize their angles, use aeo-prompt-question-finder to find related questions people ask, and compile everything into a research brief at YouTube/Research/{{topic-slug}}-brief.md"
```

### 4. Script Outline Generation

Generate a structured script outline from completed research.

```
openclaw cron add --every 2h "check Obsidian at YouTube/Research/ for any research brief tagged [OUTLINE-READY], read the brief and my script template at YouTube/Scripts/template.md, generate a structured script outline with: Hook (first 30 seconds), Problem Statement, Main Points (3-5 with supporting evidence), Counterarguments, Call to Action, and estimated runtime, and save to YouTube/Scripts/{{topic-slug}}-outline.md"
```

### 5. SEO Title and Description Drafting

Draft SEO-optimized titles and descriptions for planned videos.

```
openclaw cron add --every day --at 14:00 "check Obsidian at YouTube/Scripts/ for any outline file created in the last 24 hours, for each outline draft 5 title options optimized for search (use google-search to verify search volume for key phrases), write a 200-word video description with relevant keywords naturally integrated, suggest 15-20 tags, and save to YouTube/Scripts/{{topic-slug}}-seo.md"
```

### 6. Content Calendar Maintenance

Keep the content calendar updated with planned and published videos.

```
openclaw cron add --every day --at 09:00 "read the content calendar from Obsidian at YouTube/Calendar/calendar.md, check Google Calendar via gog for any scheduled filming or publish dates this week, update the calendar with current status of each video (researching, scripting, filming, editing, scheduled, published), and flag any gaps in the publishing schedule for the next 2 weeks"
```

### 7. Weekly Performance Review

Compile a weekly performance report on published videos.

```
openclaw cron add --every monday --at 08:00 "use agent-browser to check YouTube Studio for performance data on all videos published in the last 30 days, extract views, watch time, CTR, and audience retention for each video, compare against the channel average, identify which topics and formats are overperforming or underperforming, and save the analysis to YouTube/Analytics/weekly-review-{{date}}.md with actionable recommendations"
```

### 8. Audience Question Mining

Discover what your audience wants to learn about.

```
openclaw cron add --every day --at 11:00 "use agent-browser to check the comments on my last 5 YouTube videos for questions and topic requests, search bird for questions directed at my X account about content topics, use aeo-prompt-question-finder on my top 5 content themes, and compile a list of audience-requested topics to YouTube/Research/audience-requests-{{date}}.md"
```

## Guardrails and Safety

### What the Agent Should NEVER Do Autonomously

1. **Never upload videos, post comments, or interact with YouTube on your behalf.** The agent researches and drafts. All publishing actions go through you.

2. **Never engage with competitor channels.** The agent monitors competitor content passively. It must never comment on competitor videos, subscribe or unsubscribe from channels, or interact with competitor social accounts.

3. **Never scrape YouTube in violation of rate limits.** Use `youtube-summarizer` (which accesses public transcripts via the API) rather than aggressive browser-based scraping. Excessive scraping can result in IP blocks or account flags.

4. **Never fabricate statistics or research data.** If the agent cannot find reliable data to support a script point, it must flag the gap with "[NEEDS VERIFICATION]" rather than inventing numbers.

5. **Never access or share YouTube Studio analytics with anyone.** Analytics data stays in your local Obsidian vault and is never sent to external services.

6. **Never copy competitor scripts or content.** The agent summarizes competitor angles for competitive awareness, but generated scripts must be original. The agent should flag any passage that closely mirrors existing content.

7. **Never modify or delete published video metadata.** The agent drafts titles, descriptions, and tags for new videos only. It must never change metadata on already-published videos without explicit instruction.

### Recommended `agentguard` Rules

```
agentguard rule add "block any YouTube upload, comment, or publish action"
agentguard rule add "block any interaction with competitor YouTube accounts"
agentguard rule add "require confirmation before creating new web scrapers"
agentguard rule add "block export of YouTube analytics data to any external service"
```

## Sample Prompts

### Prompt 1: New Channel Setup

```
I run a YouTube channel about personal finance for millennials (120K subscribers, publishing twice weekly). My main competitors are [Channel A], [Channel B], and [Channel C].

Set up my research workflow: create the Obsidian folder structure, add my competitors to the monitoring list, configure the daily competitor scan and trending topic discovery crons, and generate a content calendar template for the next 4 weeks.
```

### Prompt 2: Topic Deep Dive

```
I want to make a video about "the hidden costs of homeownership that nobody talks about." Run a deep research pass: find the best data sources, summarize what the top 10 YouTube videos on this topic already cover, identify angles they missed, find 3-5 surprising statistics I can use, and generate a script outline that takes a different angle than existing content.
```

### Prompt 3: Performance-Driven Planning

```
Analyze my last 20 videos' performance. Which topics got the highest CTR? Which had the best audience retention past the 50% mark? Are there patterns in my top performers (length, format, topic category)? Based on this data, recommend my next 5 video topics and explain why each one should perform well.
```

### Prompt 4: Rapid Response Content

```
[TRENDING-EVENT] just happened and it's relevant to my audience. Check what competitors are saying about it on X and YouTube (have any posted videos already?), do a quick 30-minute research pass, and draft a script outline for a timely reaction video I can film today. Prioritize speed over depth — I want to be in the first wave of creators covering this.
```

### Prompt 5: Content Repurposing Research

```
Look at my top 10 performing videos from the last 6 months. For each one, suggest: (1) a follow-up video angle that goes deeper, (2) a "Part 2" concept if the comments show audience demand, and (3) whether the topic has evolved since I covered it (new data, new developments) that would justify an updated version. Rank all suggestions by estimated performance.
```

## Maintenance and Optimization

### Weekly Maintenance

1. **Review competitor scan quality.** Are the summaries accurate? Are any competitor channels inactive or irrelevant? Prune the list quarterly.
2. **Check content calendar gaps.** The agent flags gaps automatically (Recipe #6), but you should review the calendar manually every Sunday evening to make editorial decisions about upcoming weeks.
3. **Update topic seeds.** Add new topic ideas as they come to you. The agent uses this seed list to inform trending topic searches.

### Monthly Maintenance

1. **Run `skills-audit`** to verify skill security and updates.
2. **Export and analyze YouTube Studio data.** If you install `data-analyst` or `duckdb`, export your YouTube analytics CSV and run deeper analyses than the weekly performance review provides.
3. **Review `self-improving-agent` memory.** Check what content preferences and patterns it has learned. Correct any misinterpretations.

### Scaling Considerations

- **Multiple channels:** Create separate Obsidian folder trees per channel and run independent cron sets.
- **Content team:** Add `slack` for team coordination. The agent posts research briefs and script outlines to a shared channel for writer assignment.
- **Cross-platform content:** If you repurpose YouTube content to blog posts, podcasts, or social media, add the `summarize` skill's repurposing capabilities. Generate blog drafts, tweet threads, and newsletter blurbs from each script outline.

## Advanced Workflows

### Thumbnail A/B Testing Research

Research what thumbnail styles perform best in your niche.

```
openclaw cron add --every week "use agent-browser to check the thumbnails of the top 20 performing videos in my niche this week (via YouTube search for [your-keywords]), describe each thumbnail's visual style (text overlay, face expression, color scheme, layout), identify patterns in the highest-performing thumbnails, and save the analysis to YouTube/Analytics/thumbnail-trends-{{date}}.md"
```

### Evergreen Content Refresh Scanner

Identify old videos that could benefit from an updated version.

```
openclaw cron add --every month "read my YouTube video archive in Obsidian, identify videos older than 12 months that covered topics which have significantly changed (search tavily-web-search for major updates to each topic), rank them by refresh potential (original views x topic change magnitude), and save the refresh recommendations to YouTube/Research/refresh-candidates-{{date}}.md"
```

### Collaboration Opportunity Finder

Identify potential collaboration partners based on audience overlap.

```
openclaw cron add --every week "analyze my competitor scan data from the last 30 days, identify creators in adjacent niches who: (1) have a similar subscriber count to mine, (2) cover complementary but not identical topics, (3) have mentioned topics I cover or vice versa, and save a ranked collaboration prospect list to YouTube/Research/collab-prospects-{{date}}.md"
```

## Common Gotchas

### 1. Over-Researching and Under-Publishing

The most common failure mode is building an elaborate research system and then spending more time refining research than actually making videos. Set a hard rule: research for any single video should not exceed 2 hours of your review time. The agent does the grunt work; your job is to make editorial decisions quickly. If your content calendar shows more "researching" entries than "published" entries, the system is working against you.

### 2. Competitor Obsession Kills Originality

Monitoring 15+ competitor channels daily creates an overwhelming volume of competitive intelligence that subtly pushes you toward derivative content. Limit your active competitor monitoring to 5-7 channels. Use the competitor scan for awareness of what has been covered (so you can differentiate), not as a template for what to make next. Review competitor scans weekly, not daily.

### 3. YouTube Transcript API Limitations

`youtube-summarizer` relies on publicly available transcripts. Some videos have auto-generated captions that are inaccurate (especially for technical jargon, names, or non-English content), and some creators disable captions entirely. When the agent reports a video summary, check whether it was based on manual captions (high accuracy) or auto-generated captions (verify key claims). Videos with no captions at all cannot be summarized and will be flagged as "[NO TRANSCRIPT AVAILABLE]."

### 4. Google Search API Costs Can Spike

The `google-search` skill uses the Google Custom Search API, which has a free tier of 100 queries per day. If your SEO title drafting (Recipe #5) and trending topic discovery (Recipe #2) run frequently with multiple keyword variations, you can exceed this limit. Monitor your Google Cloud Console usage dashboard weekly and set a billing alert at $5/month. For most solo creators, the free tier is sufficient if you batch your SEO research into a single daily cron rather than running it ad-hoc.

### 5. Content Calendar Drift

The content calendar (Recipe #6) is only as good as the data it reads from Google Calendar. If you reschedule filming or change publish dates without updating the calendar event, the agent's calendar view becomes inaccurate. Make it a habit: every time you change a video's status (from "scripting" to "filming" to "editing"), update the Google Calendar event description. The agent cannot know what it cannot see.

## Frequently Asked Questions

**Q: Can the agent create thumbnails for me?**
A: Not production-ready thumbnails. With the `canva` or `image-generation` skills, the agent can generate thumbnail concepts or mockups, but most successful YouTube thumbnails require custom photography, specific facial expressions, and precise text placement that AI image generation does not reliably produce. Use the agent for thumbnail research and concept ideation, then create the final thumbnail manually or with a designer.

**Q: How does this compare to using TubeBuddy or vidIQ?**
A: OpenClaw and tools like TubeBuddy serve different purposes. TubeBuddy and vidIQ are YouTube-native browser extensions focused on SEO scoring, tag suggestions, and in-platform analytics. OpenClaw excels at the upstream research process: finding topics, analyzing competitors, generating script outlines, and maintaining a content system across multiple tools. Many creators use both — TubeBuddy for final SEO optimization and OpenClaw for the research and planning pipeline.

**Q: Can the agent schedule YouTube uploads?**
A: No, and it should not. The `agentguard` rules explicitly block upload actions. Use YouTube Studio's native scheduling feature for uploads. The agent prepares titles, descriptions, and tags in advance so you can paste them directly into YouTube Studio during the upload process.

**Q: What if I create content in a language other than English?**
A: `youtube-summarizer` supports transcripts in any language that YouTube's caption system supports. `tavily-web-search` and `google-search` can be configured to search in specific languages. The agent can generate script outlines in any language, though the quality of the `self-improving-agent` voice matching may take longer to calibrate for non-English content.
