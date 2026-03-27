# Podcast Show Notes Automation — OpenClaw Reference Guide

## What This Does

OpenClaw automates the post-production workflow for podcast episodes: transcribing audio recordings, generating structured show notes with timestamps, extracting key quotes and talking points, identifying mentioned resources and links, drafting social media promotional copy, and organizing everything into a publishable format. This turns a 2-4 hour post-production task per episode into a 15-minute review step.

## Who This Is For

**Primary user:** Independent podcasters, podcast production assistants, content teams at media companies, and interview-format show hosts who publish regularly (weekly or biweekly).

**Industry:** Media, content creation, education, B2B marketing, thought leadership, independent journalism.

**Pain point:** Recording the episode is the fun part. Everything after — transcription, writing show notes, pulling timestamps, finding links for every resource mentioned, drafting promotional tweets, creating audiograms — is tedious post-production labor that delays publishing. You want to ship episodes faster without sacrificing the quality of your show notes and promotional materials.

**Technical level:** Comfortable with audio files, podcast hosting platforms, and basic web tools. No coding background needed.

## OpenClaw Setup

### Required Skills

Install these skills via `clawhub install <skill-name>`:

| Skill | Purpose in This Workflow |
|---|---|
| `skill-vetter` | Security-first: scan every skill before installing |
| `prompt-guard` | Protect against prompt injection when the agent processes external content |
| `agentguard` | Prevent the agent from publishing or posting anything without your sign-off |
| `openai-whisper` | Local audio transcription — fast, private, and accurate for podcast-length recordings |
| `summarize` | Condense long transcripts into structured summaries and key takeaways |
| `gog` | Access Google Drive for storing episode files, Google Docs for drafting show notes |
| `tavily-web-search` | Find URLs for books, tools, people, and resources mentioned during the episode |
| `obsidian` | Store episode archives, show note templates, and promotional copy in your vault |
| `self-improving-agent` | Learn your show notes format, preferred phrasing, and section structure over time |
| `bird` | Draft and review promotional tweets and thread copy for episode launches |

### Optional Skills

| Skill | Purpose |
|---|---|
| `youtube-summarizer` | If you also publish video versions, extract additional metadata from the YouTube upload |
| `canva` | Generate episode cover art or audiogram graphics from templates |
| `image-generation` | Create custom episode artwork based on the episode theme |
| `slack` | Post draft show notes to a team Slack channel for review |
| `notion` | Alternative to Obsidian if your podcast production workflow lives in Notion |
| `brave-search` | Backup search for finding obscure references mentioned in episodes |
| `exa-web-search-free` | Technical search for developer-focused podcast topics |
| `telegram` | Push episode notifications to a Telegram listener community |

### Channels to Configure

1. **Audio input:** Designate a Google Drive folder (via `gog`) or local directory where raw episode recordings are dropped after recording.
2. **Obsidian vault:** Create a `Podcast/` folder with subfolders: `Episodes/`, `Templates/`, `Promo/`, and `Archive/`.
3. **Show notes template:** Store your standard show notes template in `Podcast/Templates/shownotes-template.md` so the agent uses your format consistently.

### Hardware Recommendations

- **Minimum:** Mac with Apple Silicon (M1+) and 16 GB RAM. Whisper transcription of a 60-minute episode takes approximately 5-8 minutes on M1.
- **Recommended:** Mac Mini M2 Pro with 32 GB RAM for fastest transcription and ability to process multiple episodes concurrently.
- **Storage:** 1 GB per 100 episodes of archived transcripts and show notes. Raw audio files are much larger but typically live on external storage or cloud.

## Installation Walkthrough

### Step 1: Security Foundation

```
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

### Step 2: Core Skills

```
skill-vetter openai-whisper && clawhub install openai-whisper
skill-vetter summarize && clawhub install summarize
skill-vetter gog && clawhub install gog
skill-vetter tavily-web-search && clawhub install tavily-web-search
skill-vetter obsidian && clawhub install obsidian
skill-vetter self-improving-agent && clawhub install self-improving-agent
skill-vetter bird && clawhub install bird
```

### Step 3: API Key Configuration

- **Google Account (OAuth):** Required for `gog` to access Google Drive and Google Docs.
- **Tavily API Key:** Required for resource link discovery. Sign up at tavily.com.
- **X Developer API Key:** Required for `bird` if you draft promotional tweets.
- **OpenAI API Key (optional):** Whisper can run fully locally without an API key. The API key enables faster cloud-based transcription for very long episodes.

### Step 4: Obsidian Vault Structure

```
Podcast/
  Episodes/
  Templates/
  Promo/
  Archive/
  Research/
  index.md
```

### Step 5: Create Your Show Notes Template

Create `Podcast/Templates/shownotes-template.md` with your preferred structure. Example:

```
# Episode [NUMBER]: [TITLE]

## Guest
[Guest name, title, and one-line bio]

## Episode Summary
[3-4 sentences summarizing the conversation]

## Key Takeaways
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

## Timestamped Segments
- 00:00 — Introduction
- [MM:SS] — [Segment title]

## Resources Mentioned
- [Resource name](URL)

## Quotable Moments
> "[Quote]" — [Speaker], [Timestamp]

## Credits
Hosted by [Your Name]. Produced by [Producer].
```

### Step 6: Verify Connections

```
openclaw "list files in Google Drive at Podcast/Recordings/ via gog"
openclaw "transcribe a 30-second test audio clip using openai-whisper"
openclaw "create a test note in Obsidian at Podcast/Episodes/test.md"
```

## Core Automation Recipes

### 1. Automatic Transcription on File Drop

Monitor your recording drop folder and transcribe new audio files immediately.

```
openclaw cron add --every 15m "check Google Drive via gog for new audio files in the Podcast/Recordings/ folder that do not have a matching transcript file, transcribe each new file using openai-whisper with timestamps enabled, and save the transcript to Obsidian at Podcast/Episodes/{{episode-name}}-transcript.md"
```

### 2. Structured Show Notes Generation

Once a transcript exists, generate full show notes from it.

```
openclaw cron add --every 30m "check Obsidian at Podcast/Episodes/ for any transcript file that does not have a matching show notes file, read the transcript and the template at Podcast/Templates/shownotes-template.md, generate show notes with these sections: Episode Summary (3-4 sentences), Key Takeaways (5-7 bullets), Timestamped Segments (MM:SS format), Resources Mentioned, Guest Bio (if applicable), and save to Podcast/Episodes/{{episode-name}}-shownotes.md"
```

### 3. Resource Link Discovery

Find URLs for every book, tool, person, and resource mentioned in the episode.

```
openclaw cron add --every 30m "check Obsidian for any show notes file updated in the last hour, extract the Resources Mentioned section, search tavily-web-search for the official URL of each resource (prefer official sites over affiliate links), and update the show notes file with hyperlinked resource names"
```

### 4. Pull Quote Extraction

Extract the most quotable moments from the transcript for promotional use.

```
openclaw cron add --every 1h "check Obsidian at Podcast/Episodes/ for any new transcript file from today, identify the 5-8 most quotable, shareable, or provocative statements from the transcript, include the timestamp and speaker name for each quote, and save them to Podcast/Promo/{{episode-name}}-quotes.md"
```

### 5. Social Media Draft Generation

Draft promotional copy for X, LinkedIn, and newsletter announcements.

```
openclaw cron add --every day --at 16:00 "check Obsidian at Podcast/Episodes/ for any show notes file created today, draft the following promotional materials: (1) an X thread of 4-6 tweets highlighting key insights with the episode link, (2) a LinkedIn post of 150-200 words with a hook and CTA, (3) a 3-sentence newsletter blurb, and save all drafts to Podcast/Promo/{{episode-name}}-social.md"
```

### 6. Chapter Markers Generation

Create podcast chapter markers in the standard format for podcast apps.

```
openclaw cron add --every 1h "check Obsidian at Podcast/Episodes/ for any show notes file that does not have a matching chapters file, read the timestamped segments section, convert them into podcast chapter marker format (HH:MM:SS Title), and save to Podcast/Episodes/{{episode-name}}-chapters.txt"
```

### 7. Guest Research Prep

Before a scheduled interview, compile a research dossier on the guest.

```
openclaw cron add --every day --at 08:00 "check my Google Calendar via gog for any podcast recording sessions scheduled in the next 3 days, for each guest name found in the calendar event, search tavily-web-search for their recent interviews and articles, check bird for their recent X posts and engagement topics, and save a guest research dossier to Obsidian at Podcast/Research/{{guest-name}}-dossier.md"
```

### 8. Episode Archive and Index Update

After publishing, archive the episode and update the master index.

```
openclaw cron add --every monday --at 10:00 "check Obsidian at Podcast/Episodes/ for any episode published last week (look for files with [PUBLISHED] tag), move all related files (transcript, show notes, chapters, promo) to Podcast/Archive/{{episode-number}}/, update the master index at Podcast/index.md with episode number, title, date, guest name, and top 3 topics, and clean up the Episodes folder"
```

## Guardrails and Safety

### What the Agent Should NEVER Do Autonomously

1. **Never publish show notes, social posts, or promotional content without human approval.** The agent drafts and stages everything. You (or your producer) review and publish.

2. **Never upload audio files to any external service.** Whisper runs locally for a reason — your raw recordings may contain pre-release content, private conversations, or unedited remarks. The agent must never send audio outside your machine.

3. **Never contact guests directly.** The agent prepares guest research and drafts outreach emails, but it must never send emails to guests, post about guests on social media, or interact with guests' accounts.

4. **Never edit the raw transcript after initial generation.** The transcript is the source of truth. Show notes and promotional content derive from it, but the transcript itself should remain unmodified as a record.

5. **Never generate affiliate links.** When finding resource URLs, the agent must link to official sources only. Inserting affiliate tracking codes is a manual editorial decision.

6. **Never disclose unreleased episode content.** If the agent has access to transcripts for episodes not yet published, it must not reference that content in any external-facing output (social posts, newsletters, etc.).

7. **Never delete audio files.** The agent can move files between folders for organization but must never delete original recordings.

### Recommended `agentguard` Rules

```
agentguard rule add "block any outbound social media post or email send"
agentguard rule add "block file uploads to any external service"
agentguard rule add "block deletion of any file with .mp3, .wav, .m4a, or .aac extension"
agentguard rule add "require confirmation before modifying any file tagged [PUBLISHED]"
```

## Sample Prompts

### Prompt 1: First Episode Setup

```
I just recorded Episode 47 of my podcast "The Builder's Mindset" — it's a 55-minute interview with Sarah Chen about bootstrapping developer tools. The recording is in Google Drive at Podcast/Recordings/ep47-sarah-chen.m4a.

Transcribe the episode, generate full show notes using my template in Obsidian, find links for every tool and book Sarah mentioned, extract the top 5 quotable moments, and draft an X thread to promote the episode. Save everything to the appropriate folders.
```

### Prompt 2: Batch Processing Backlog

```
I have 12 old episodes in Google Drive at Podcast/Recordings/ that were never properly transcribed or documented. Process all of them: transcribe each one, generate show notes, and create a chapter markers file for each. Do not generate promotional materials for old episodes — just the core documentation.
```

### Prompt 3: Pre-Interview Research

```
I'm interviewing Dr. James Okoye next Thursday about clinical AI regulation in the EU. He's a professor at King's College London and has published extensively on AI ethics in healthcare. Build me a research dossier: his recent papers, media appearances, key positions on AI regulation, and 10 interview questions based on his public work.
```

### Prompt 4: Cross-Episode Analysis

```
Look at my last 20 episode transcripts in the archive. What topics come up most frequently? Which guests referenced each other? Are there any recurring themes I should consider building a "best of" compilation episode around? Give me a data-driven content strategy recommendation.
```

## Maintenance and Optimization

### Per-Episode Checklist

After each episode goes through the pipeline, verify these outputs before publishing:

1. Transcript generated and spot-checked for accuracy (especially names, technical terms, and non-English words).
2. Show notes match your template structure.
3. All resource links verified as working and pointing to official sources.
4. Chapter markers align with actual audio timestamps (check at least 3 random markers).
5. Pull quotes attributed to the correct speaker.
6. Social media drafts reviewed for tone and accuracy.

### Monthly Maintenance

1. **Run `skills-audit`** to verify all installed skills remain current and secure.
2. **Review Whisper accuracy** by comparing a random transcript segment against the audio. If accuracy has degraded (new microphone, different recording environment), adjust your audio preprocessing.
3. **Archive old episodes** to keep the active Episodes folder manageable. The agent works faster when it does not need to scan hundreds of files.
4. **Update your show notes template** if your format has evolved. The agent uses whatever template it finds — if your template is stale, your show notes will be stale.

### Scaling Considerations

- **Multiple shows:** Create separate top-level folders (`ShowA/`, `ShowB/`) and run independent cron jobs for each. Each show can have its own template.
- **Production team:** Add the `slack` skill and post drafts to a production channel. Editors review and approve before publishing.
- **Video podcast:** Add `youtube-summarizer` and configure the pipeline to process both audio transcription (via `openai-whisper`) and video metadata extraction for YouTube uploads.

## Advanced Workflows

### Cross-Episode Topic Index

Build a searchable topic index across your entire back catalog.

```
openclaw cron add --every sunday --at 20:00 "scan all show notes files in Podcast/Archive/, extract every topic tag and guest name, build a cross-referenced topic index at Podcast/index-topics.md showing which episodes cover which topics, and flag any topics that appear in 3+ episodes as potential series themes"
```

### Listener Feedback Integration

If you receive listener feedback via email, integrate it into the production pipeline.

```
openclaw cron add --every day --at 09:00 "check Gmail via gog for emails containing 'podcast' or 'episode' in the subject line received in the last 24 hours, extract any topic suggestions or questions, save them to Obsidian at Podcast/Research/listener-feedback-{{date}}.md, and flag questions that could become future episode topics"
```

### Automated Transcript Cleanup

Raw Whisper transcripts include filler words, false starts, and repetitions. Run a cleanup pass.

```
openclaw cron add --every 1h "check Obsidian at Podcast/Episodes/ for any transcript file tagged [RAW], create a clean version that removes obvious filler words (um, uh, like, you know) and false starts while preserving the speaker's natural phrasing and meaning, save the clean version alongside the raw version with a [CLEAN] tag, and never modify the original raw transcript"
```

## Common Gotchas

### 1. Whisper Timestamp Accuracy Degrades with Poor Audio

Whisper's timestamps are reliable with clean, single-speaker or two-speaker audio. If your recording has background noise, overlapping speakers, or inconsistent volume levels, timestamps can drift by 10-30 seconds over a 60-minute episode. Clean your audio before transcription (noise reduction, normalization) or manually spot-check timestamps at the 15, 30, and 45-minute marks. This is the single most common source of inaccurate chapter markers.

### 2. Resource Link Rot

The agent finds URLs at the time of episode processing, but links go stale. If you process episodes weeks after recording, some mentioned resources may have moved, rebranded, or disappeared. Process episodes within 48 hours of recording for the best link accuracy. For evergreen show notes, consider running a quarterly link-check cron job against your archive.

### 3. Show Notes Voice Takes Time to Calibrate

Like newsletter curation, the agent starts with generic show notes phrasing. Actively correct the first 5-6 episodes: edit the generated show notes, tell the agent what you changed and why, and let `self-improving-agent` learn your style. Users who skip this step get functional but personality-free show notes that sound like every other AI-generated summary.

### 4. Speaker Identification Errors in Multi-Speaker Episodes

Whisper transcribes audio into a single text stream without speaker diarization (identifying who said what). For interview-format podcasts, this means the transcript does not automatically label which statements belong to the host vs. the guest. You have two options: (a) use a pre-processing tool that adds speaker labels before the agent generates show notes, or (b) manually add speaker labels to the first few minutes of the transcript so the agent can infer the pattern. This is the most common complaint from interview-format podcasters.

### 5. Google Drive Sync Delays

If you save recordings to Google Drive from a different device (e.g., record on a Zoom call, which saves to Google Drive), there can be a sync delay of 5-30 minutes before the file appears via the `gog` API. The 15-minute cron job in Recipe #1 accounts for this, but if you are processing immediately after recording, the file may not be available yet. Check the file manually in Google Drive before assuming the cron failed.

## Frequently Asked Questions

**Q: Can I use this with video podcasts?**
A: Yes. `openai-whisper` transcribes the audio track from video files as well. For YouTube-published episodes, add `youtube-summarizer` to extract additional metadata. The show notes pipeline works the same way regardless of whether the source is audio-only or video.

**Q: What audio formats does Whisper support?**
A: Whisper handles MP3, WAV, M4A, FLAC, OGG, and most common audio formats. For video files (MP4, MOV, MKV), it extracts the audio track automatically. No pre-conversion needed in most cases.

**Q: How long does transcription take?**
A: On Apple Silicon (M1/M2), expect roughly 1 minute of processing per 10 minutes of audio using the medium-quality Whisper model. A 60-minute episode takes approximately 6-8 minutes. The large model is slower but more accurate for technical content or accented speech.

**Q: Can the agent handle multiple languages in one episode?**
A: Whisper supports 99 languages and can detect language switches within an episode. However, accuracy drops at language boundaries. If your podcast regularly switches languages, consider specifying the primary language in your cron configuration and reviewing multilingual segments manually.

**Q: What if my guest's name is consistently misspelled in the transcript?**
A: Add a correction list to your show notes template or a dedicated note in Obsidian. Before generating show notes, the agent can reference this list to fix known misspellings. Common for guests with unusual names or technical jargon specific to your niche.
