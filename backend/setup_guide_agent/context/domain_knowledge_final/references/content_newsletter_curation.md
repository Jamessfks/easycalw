# Newsletter Curation Automation — OpenClaw Reference Guide

## What This Does

OpenClaw can automate the end-to-end workflow of curating, drafting, and preparing a recurring newsletter. It monitors your chosen sources (RSS feeds, bookmarked sites, email digests, social feeds), extracts the most relevant items based on your editorial criteria, summarizes each piece, drafts newsletter sections in your voice, and queues the final output for your review before sending. The goal is to reduce the 4-8 hours of weekly curation labor down to a 20-minute review-and-approve step.

## Who This Is For

**Primary user:** Independent newsletter creators, content marketers, community managers, and solopreneurs who publish a recurring email newsletter (weekly, biweekly, or monthly).

**Industry:** Media, marketing, SaaS, creator economy, niche communities, professional associations.

**Pain point:** You spend hours every week reading dozens of sources, bookmarking links, writing blurbs, formatting sections, and assembling the newsletter. The curation itself is valuable — your editorial judgment is the product — but the mechanical parts (scanning, summarizing, formatting) consume most of the time. You want to stay in the editorial seat without doing the assembly-line work.

**Technical level:** Comfortable with email tools and basic web apps. No coding required, but willingness to set up API keys and configure a few skills is expected.

## OpenClaw Setup

### Required Skills

Install these skills via `clawhub install <skill-name>`:

| Skill | Purpose in This Workflow |
|---|---|
| `skill-vetter` | Security-first: scan every other skill before installing it |
| `prompt-guard` | Protect against prompt injection when the agent reads external web content and emails |
| `agentguard` | Runtime guardrails to prevent the agent from sending anything without your approval |
| `gog` | Gmail integration for reading incoming newsletters, tip emails, and reader submissions |
| `tavily-web-search` | AI-optimized web search for discovering new articles on your newsletter topics |
| `summarize` | Condense long articles, blog posts, and reports into newsletter-length blurbs |
| `agent-browser` | Navigate paywalled or dynamic sites to extract article content when RSS is unavailable |
| `obsidian` | Store curated links, editorial notes, and past newsletter archives in your Obsidian vault |
| `agent-mail` | Dedicated agent inbox for newsletter-specific email triage and draft staging |
| `bird` | Monitor X (Twitter) for trending topics, hot takes, and breaking news in your niche |
| `web-scraper-as-a-service` | Set up recurring scrapers for sources that do not offer RSS feeds |
| `self-improving-agent` | The agent learns your editorial preferences over time — which links you keep, which you cut |

### Optional Skills

| Skill | Purpose |
|---|---|
| `brave-search` | Privacy-first alternative search for discovering content without Google tracking |
| `exa-web-search-free` | Free technical search for finding niche or developer-focused content |
| `canva` | Generate branded header images or social cards for each newsletter edition |
| `image-generation` | Create custom illustrations for newsletter sections |
| `mailchannels` | Send the final newsletter directly through the agent if you do not use a dedicated ESP |
| `slack` | Post draft summaries to a Slack channel for team review before publishing |

### Channels to Configure

1. **Email input channel:** Connect your Gmail via `gog` so the agent can read incoming newsletters and reader submissions that feed your curation pipeline.
2. **Obsidian vault:** Create a dedicated vault folder (e.g., `Newsletter/Editions/`) where the agent stores drafted editions, link archives, and editorial notes.
3. **X monitoring:** Configure `bird` with 3-5 keyword searches relevant to your newsletter beat.
4. **Web scrapers:** Set up `web-scraper-as-a-service` for 5-10 non-RSS sources you check regularly.

### Hardware Recommendations

- **Minimum:** Any Mac with 8 GB RAM running macOS 14+. Newsletter curation is not compute-intensive.
- **Recommended:** Mac Mini M2 or later with 16 GB RAM if you want the agent running continuous background monitoring via cron jobs.
- **Storage:** Minimal. Obsidian vaults for newsletters rarely exceed 500 MB even after years of archives.

## Installation Walkthrough

Follow this sequence to get the newsletter curation pipeline running from scratch.

### Step 1: Security Foundation

```
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

Run `skill-vetter` once to verify it is operational, then use it to scan every subsequent skill before installing.

### Step 2: Core Skills

```
skill-vetter gog && clawhub install gog
skill-vetter tavily-web-search && clawhub install tavily-web-search
skill-vetter summarize && clawhub install summarize
skill-vetter agent-browser && clawhub install agent-browser
skill-vetter obsidian && clawhub install obsidian
skill-vetter agent-mail && clawhub install agent-mail
skill-vetter bird && clawhub install bird
skill-vetter web-scraper-as-a-service && clawhub install web-scraper-as-a-service
skill-vetter self-improving-agent && clawhub install self-improving-agent
```

### Step 3: API Key Configuration

You will need to configure credentials for the following services:

- **Google Account (OAuth):** Required for `gog`. Follow the OAuth consent flow when prompted.
- **Tavily API Key:** Sign up at tavily.com and add `TAVILY_API_KEY` to your OpenClaw environment.
- **X Developer API Key:** Required for `bird`. Apply for developer access at developer.x.com.

### Step 4: Obsidian Vault Structure

Create the following folder structure in your Obsidian vault:

```
Newsletter/
  Editions/
  Archive/
  Research/
  Templates/
  index.md
```

Store a template note at `Newsletter/Templates/edition-template.md` that reflects your standard newsletter sections. The agent will use this template when assembling drafts.

### Step 5: Verify Connections

Test each skill individually before configuring cron automations:

```
openclaw "read my last 3 emails via gog and summarize them"
openclaw "search tavily-web-search for 'AI tools for productivity' and give me the top 5 results"
openclaw "check bird for recent posts about [your-niche-keyword]"
openclaw "create a test note in Obsidian at Newsletter/Editions/test.md with the text 'setup verified'"
```

If any of these fail, troubleshoot the individual skill before proceeding.

## Core Automation Recipes

### 1. Morning Source Scan

Scan all configured sources every morning at 7:00 AM and dump raw candidates into your Obsidian vault.

```
openclaw cron add --every day --at 07:00 "scan my Gmail for new newsletter digests and industry emails from the last 24 hours, search Tavily for top articles on [your-topics], check X via bird for trending threads on [your-keywords], and save all candidates as a bulleted list in Obsidian at Newsletter/Editions/candidates-{{date}}.md with source URL, title, and a one-sentence summary for each"
```

### 2. Midday Deduplication and Ranking

At noon, have the agent deduplicate and rank the morning candidates.

```
openclaw cron add --every day --at 12:00 "read the candidates file at Newsletter/Editions/candidates-{{date}}.md in Obsidian, remove duplicates, rank the remaining items by relevance to my editorial criteria (novelty, actionability, audience interest), and rewrite the file as a ranked list with your confidence score for each item"
```

### 3. Deep Summarization of Top Picks

After you review the ranked list and mark your selections, the agent summarizes each one.

```
openclaw cron add --every 30m "check Obsidian at Newsletter/Editions/candidates-{{date}}.md for any items I have marked with [APPROVED], then use summarize to create a 2-3 sentence newsletter blurb for each approved item in my writing voice, and save the blurbs to Newsletter/Editions/draft-{{date}}.md"
```

### 4. Weekly Draft Assembly

Every Friday at 2:00 PM, assemble the week's approved blurbs into a complete newsletter draft.

```
openclaw cron add --every friday --at 14:00 "read all draft files from this week in Obsidian at Newsletter/Editions/, combine them into a single newsletter draft with my standard sections (Intro, Top Stories, Quick Links, One Thing I Loved), write a 2-sentence intro paragraph, and save the complete draft to Newsletter/Editions/final-draft-{{date}}.md"
```

### 5. Competitor Newsletter Monitoring

Monitor competitor newsletters that arrive in your Gmail and extract their top links.

```
openclaw cron add --every day --at 08:00 "search Gmail via gog for emails from [competitor-newsletter-addresses] received in the last 24 hours, extract all hyperlinks from each email body, summarize the top 5 links, and append them to Obsidian at Newsletter/Research/competitor-links-{{date}}.md with a note on which competitor featured each link"
```

### 6. Reader Submission Triage

Check for reader-submitted links and tips throughout the day.

```
openclaw cron add --every 2h "check Gmail via gog for emails with subject lines containing 'tip' or 'submission' or 'for the newsletter', extract any URLs from the email body, run summarize on each URL, and append the results to Obsidian at Newsletter/Editions/reader-submissions-{{date}}.md with the submitter's name"
```

### 7. Social Proof Check

Before publishing, verify that your top picks have real engagement signals.

```
openclaw cron add --every friday --at 15:00 "read Newsletter/Editions/final-draft-{{date}}.md from Obsidian, for each linked article search bird and tavily-web-search for engagement signals (shares, comments, citations), and append an engagement summary to the draft file so I can prioritize high-signal items"
```

### 8. Archive and Index

After each edition ships, archive it and update the master index.

```
openclaw cron add --every monday --at 09:00 "move last week's final draft from Newsletter/Editions/ to Newsletter/Archive/ in Obsidian, update the master index note at Newsletter/index.md with the edition number, date, and top 3 story titles, and delete the working candidate and draft files for last week"
```

## Guardrails and Safety

### What the Agent Should NEVER Do Autonomously

1. **Never send a newsletter to subscribers without explicit human approval.** The agent drafts and stages — you review and press send. This is non-negotiable for editorial credibility.

2. **Never publish or share your draft externally.** The agent must not post draft content to social media, share links publicly, or forward drafts to anyone other than you (or your designated review channel).

3. **Never fabricate summaries.** If the agent cannot access a URL (paywall, 404, rate limit), it must flag the item as "unreadable" rather than generating a summary from the title alone.

4. **Never unsubscribe from or reply to source newsletters.** The agent reads incoming emails for curation purposes only. It must never send replies, click unsubscribe links, or modify your email subscriptions.

5. **Never scrape sites that explicitly block automated access** in their robots.txt or terms of service. Configure `web-scraper-as-a-service` with a list of allowed domains only.

6. **Never store or process reader personal data beyond names and email addresses.** If a reader submission contains sensitive information, the agent should flag it for manual review.

7. **Never modify your Obsidian vault structure** beyond the designated Newsletter folder. The agent has no business touching your other notes.

### Recommended `agentguard` Rules

```
agentguard rule add "block any outbound email send action unless I explicitly confirm"
agentguard rule add "block deletion of any Obsidian file outside Newsletter/Editions/ and Newsletter/Archive/"
agentguard rule add "require confirmation before any web-scraper-as-a-service creates a new scraper"
```

## Sample Prompts

### Prompt 1: Initial Setup

```
I publish a weekly newsletter about AI tools for non-technical professionals. My sources are:
- 5 newsletters I subscribe to (forward them to this inbox)
- Hacker News front page
- X accounts: @bensbites, @chiefaioffice, @nontechietechy
- My reader submissions (emails with "tip" in the subject)

Set up my curation pipeline. Create the Obsidian folder structure, configure the morning scan cron, and show me what the candidate file format will look like.
```

### Prompt 2: Mid-Week Curation Check

```
Show me this week's candidate list ranked by relevance. For the top 10 items, give me a one-line pitch on why each one deserves a spot in this week's edition. Flag any items that overlap with what I covered in the last 3 editions.
```

### Prompt 3: Draft Review and Polish

```
Read the final draft for this week's newsletter. Check for: broken links, duplicate mentions of the same product, any blurbs longer than 3 sentences, and tone consistency with my last 4 editions. Give me a revision with tracked changes.
```

### Prompt 4: Analytics-Informed Curation

```
Look at which topics got the most engagement in my last 8 newsletters (check the archive in Obsidian). Tell me which topics are trending up, which are declining, and suggest 3 topic angles I haven't covered yet that fit my audience.
```

### Prompt 5: Emergency Breaking News Edition

```
[BREAKING-NEWS-URL] just dropped and it's huge for my audience. Draft a short special edition newsletter with: a 3-paragraph summary, why it matters for non-technical professionals, 3 action items readers should take this week, and a sign-off noting that this is a special mid-week edition.
```

## Maintenance and Optimization

### Weekly Maintenance Tasks

1. **Review the self-improving-agent memory** once a week. Check what editorial preferences it has learned. Correct any misinterpretations early — it is much easier to steer the agent's learning in weeks 1-4 than to retrain it after months of accumulated wrong assumptions.

2. **Audit your web scrapers.** Sites change their structure. If `web-scraper-as-a-service` returns empty or garbage results for a source, the site's HTML probably changed. Reconfigure the scraper or switch to a different extraction method.

3. **Prune the candidate backlog.** If you have days where you do not review candidates, they pile up. A weekly cleanup (delete unreviewed candidate files older than 7 days) prevents the agent from surfacing stale content.

### Monthly Maintenance Tasks

1. **Review source quality.** Are all your configured sources still producing content worth featuring? Remove low-signal sources and replace them with better ones.

2. **Check archive size.** The Obsidian archive will grow slowly. After 6 months, consider whether you need to keep every working file or just the final editions.

3. **Run `skills-audit`** to verify all installed skills are still up to date and no new security advisories have been issued.

### Scaling Considerations

- **From weekly to daily newsletters:** Increase the morning scan frequency and tighten editorial criteria significantly. A daily newsletter with 30 candidates per day creates a 210-item weekly backlog — you need the ranking algorithm to be ruthless.

- **From solo to team:** Add the `slack` skill and configure a review channel. The agent posts draft editions to Slack, team members comment, and you make final decisions. This works well for newsletters with 2-3 editors.

- **From one newsletter to multiple:** Create separate Obsidian folder trees for each newsletter (`Newsletter-AI/`, `Newsletter-Crypto/`, etc.) and run parallel cron jobs with different source configurations. The agent can manage multiple curation pipelines simultaneously.

## Common Gotchas

### 1. Source Overload Leads to Noisy Candidates

The most common mistake is configuring too many sources on day one. Start with 5-8 high-signal sources and add more only after you have tuned the ranking criteria. If your daily candidates file has more than 30 items, your editorial criteria are too loose — tighten them by telling the agent to be more selective about novelty and relevance.

### 2. Summarization Drift from Your Voice

The agent's summaries will start generic. You need to correct the first 3-5 editions actively — edit blurbs inline, tell the agent what you changed and why, and let `self-improving-agent` learn your voice. Most users see good voice matching by edition 6-8. If you skip the correction step, you will get competent but bland summaries indefinitely.

### 3. Paywall and Anti-Bot Failures

Many high-quality sources use paywalls or aggressive anti-bot measures. When `summarize` or `agent-browser` cannot access an article, the agent should flag it rather than hallucinate content. Set up authenticated sessions in `agent-browser` for sites where you have a subscription, and accept that some sources will require manual copy-paste of the article text into your Obsidian candidates file.

### 4. Gmail OAuth Token Expiration

Google OAuth tokens expire periodically (typically every 7 days for some scopes). When this happens, the `gog` skill will fail silently or return empty results for your email scans. If your morning scan suddenly returns zero candidates from email sources, the first thing to check is whether the OAuth token needs refreshing. Set a monthly reminder to verify the Gmail connection is active.

### 5. Bird Rate Limiting on X API

The X (Twitter) API has aggressive rate limits, especially on the free tier. If you configure `bird` to monitor too many keyword searches or accounts, you will hit rate limits quickly and the agent will miss trending content. Limit your active X monitors to 3-5 keyword searches and 5-10 accounts. Prioritize breadth of topic coverage over depth of any single keyword.

## Frequently Asked Questions

**Q: Can the agent actually send my newsletter for me?**
A: If you install the `mailchannels` skill, the agent can technically send email. However, for newsletters with a subscriber list, you almost certainly want to use a dedicated email service provider (Mailchimp, ConvertKit, Substack, etc.) that handles unsubscribes, deliverability, and analytics. Use OpenClaw for the curation and drafting workflow, then copy the final draft into your ESP for sending.

**Q: How does the agent learn my editorial voice?**
A: Through the `self-improving-agent` skill, which logs your corrections and preferences into a persistent memory file. Every time you edit a blurb the agent wrote, tell it what you changed and why. Over 5-8 editions, the agent accumulates enough examples to generate blurbs that sound like you wrote them.

**Q: What if I want to curate from podcasts and YouTube videos, not just articles?**
A: Add the `youtube-summarizer` skill for YouTube videos and `openai-whisper` for podcast audio files. Both generate text summaries that the agent can incorporate into your candidate pipeline alongside article summaries. Configure the morning scan cron to include these sources.

**Q: Can multiple people contribute to the curation pipeline?**
A: Yes. Have contributors forward interesting links to the agent's Gmail inbox (via `gog`) or post them in a shared Slack channel (via `slack`). The agent treats these as additional source inputs alongside automated scans.

**Q: How much does this cost to run monthly?**
A: The primary cost is the Tavily API key (free tier supports 1,000 searches/month, which covers most weekly newsletters). The X Developer API has a free tier. All other skills are free or use local resources. If you add `brave-search` or `google-search` for additional coverage, those have their own free tiers as well. Most solo newsletter creators run this pipeline for under $10/month in API costs.
