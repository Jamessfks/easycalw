# AI Language Learning Partner — OpenClaw Reference Guide

## What This Does

OpenClaw acts as a persistent, always-available language learning partner that combines structured lesson delivery with immersive conversational practice. It conducts vocabulary drills, grammar exercises, and reading comprehension sessions on a schedule, then switches to freeform conversation practice in the target language at your current proficiency level. It tracks your progress, identifies weak areas, adjusts difficulty dynamically, and maintains a personalized vocabulary bank that grows with you. Unlike language apps that reset context every session, OpenClaw remembers your level, mistakes, and goals across every interaction.

## Who This Is For

**Primary user:** Adult language learners at beginner-to-intermediate levels (A1-B2 on the CEFR scale) who want daily practice but cannot afford or schedule regular human tutoring. Also valuable for heritage speakers rebuilding fluency and professionals preparing for work in a second language.

**Industry:** Education, professional development, immigration preparation, travel, expatriate communities.

**Pain point:** Language apps gamify vocabulary but do not provide real conversation practice. Human tutors are expensive and scheduling is difficult. You need something between Duolingo and a private tutor — a patient, available partner that actually adapts to your level, remembers what you have learned, and pushes you when you are ready. Most of all, you need consistency: daily practice that happens even when motivation is low.

**Technical level:** Basic comfort with chat interfaces. No technical setup experience needed beyond following step-by-step instructions.

## OpenClaw Setup

### Required Skills

Install these skills via `clawhub install <skill-name>`:

| Skill | Purpose in This Workflow |
|---|---|
| `skill-vetter` | Security-first: scan every skill before installing |
| `prompt-guard` | Protect the agent from prompt injection in any external content it reads |
| `agentguard` | Safety net for runtime actions |
| `obsidian` | Store vocabulary banks, lesson history, progress logs, and grammar notes locally |
| `gog` | Google Calendar integration for scheduling practice sessions and sending reminders |
| `summarize` | Condense articles, news stories, and reading materials in the target language |
| `tavily-web-search` | Find authentic target-language content (news articles, blog posts, cultural content) |
| `self-improving-agent` | Learn your error patterns, preferred topics, and optimal difficulty level over time |
| `deepl-translate` | High-quality translation for checking your work and understanding nuances |
| `tts-multilingual` | Text-to-speech for pronunciation practice — hear words and sentences spoken naturally |
| `openai-whisper` | Transcribe your spoken practice attempts for pronunciation feedback |

### Optional Skills

| Skill | Purpose |
|---|---|
| `brave-search` | Alternative search for finding target-language content from diverse sources |
| `exa-web-search-free` | Find target-language technical or academic content |
| `agent-browser` | Access target-language websites, news portals, and learning platforms |
| `apple-reminders` | Push practice reminders to all Apple devices via iCloud sync |
| `todoist` | Cross-platform practice reminders and streak tracking |
| `whatsapp-cli` | Practice via WhatsApp — the agent sends you exercises and you reply conversationally |
| `telegram` | Alternative messaging channel for practice drills throughout the day |
| `translate-image` | Translate text in images — useful for practicing with menus, signs, and real-world materials |
| `notion` | Alternative to Obsidian for storing vocabulary and progress data |
| `elevenlabs-agents` | Premium voice quality for listening comprehension and pronunciation modeling |

### Channels to Configure

1. **Obsidian vault:** Create a `Language/` folder with subfolders: `Vocabulary/`, `Lessons/`, `Progress/`, `Reading/`, and `Grammar/`.
2. **Google Calendar:** Set up recurring practice session blocks via `gog` — ideally 20-30 minutes daily at the same time.
3. **Messaging channel (optional):** Configure `whatsapp-cli` or `telegram` for micro-practice throughout the day (vocabulary flashcards, quick translation challenges).

### Hardware Recommendations

- **Minimum:** Any Mac with 8 GB RAM. Language learning is text-based and not compute-intensive.
- **Recommended:** Mac with 16 GB RAM if you want local Whisper transcription for pronunciation practice (processing your spoken audio).
- **Audio:** A decent microphone (AirPods or built-in Mac mic is fine) for pronunciation practice sessions.
- **Storage:** Minimal. A year of vocabulary and lesson data is well under 100 MB.

## Installation Walkthrough

### Step 1: Security Foundation

```
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

### Step 2: Core Skills

```
skill-vetter obsidian && clawhub install obsidian
skill-vetter gog && clawhub install gog
skill-vetter summarize && clawhub install summarize
skill-vetter tavily-web-search && clawhub install tavily-web-search
skill-vetter self-improving-agent && clawhub install self-improving-agent
skill-vetter deepl-translate && clawhub install deepl-translate
skill-vetter tts-multilingual && clawhub install tts-multilingual
skill-vetter openai-whisper && clawhub install openai-whisper
```

### Step 3: API Key Configuration

- **DeepL API Key:** Sign up at deepl.com. The free tier provides 500,000 characters/month, which is generous for language learning.
- **TTS Provider API Key:** Varies by provider. Check `tts-multilingual` documentation for supported providers and their free tiers.
- **Google Account (OAuth):** Required for `gog` to manage Google Calendar scheduling.
- **Tavily API Key:** Required for `tavily-web-search` to find target-language reading materials.

### Step 4: Obsidian Vault Structure

```
Language/
  Vocabulary/
    active-words.md
    mastered-words.md
  Lessons/
  Progress/
    current-level.md
    weekly-YYYY-MM-DD.md
  Reading/
  Grammar/
    progress.md
    notes/
```

### Step 5: Initialize Your Learner Profile

Create `Language/Progress/current-level.md` with your starting information:

```
## Learner Profile
- Target Language: [e.g., Spanish]
- Current CEFR Level: [e.g., A1]
- Native Language: [e.g., English]
- Daily Practice Time: [e.g., 25 minutes]
- Practice Schedule: [e.g., 07:30 AM weekdays, 09:00 AM weekends]
- Interests: [e.g., travel, food, football, technology]
- Weak Areas: [e.g., verb conjugation, listening comprehension]
- Quiet Hours (no messages): [e.g., 22:00-07:00]
```

The agent reads this file before every session to calibrate difficulty and content.

### Step 6: Verify Connections

```
openclaw "translate 'Good morning, how are you?' to Spanish using deepl-translate"
openclaw "use tts-multilingual to speak the phrase 'Buenos dias, como estas' in Spanish"
openclaw "search tavily-web-search for a simple news article in Spanish for beginners"
openclaw "create a test note in Obsidian at Language/Vocabulary/test.md"
```

## Core Automation Recipes

### 1. Daily Vocabulary Review (Spaced Repetition)

Every morning, present vocabulary cards based on spaced repetition intervals.

```
openclaw cron add --every day --at 07:30 "read my vocabulary bank from Obsidian at Language/Vocabulary/active-words.md, select 15-20 words due for review today based on spaced repetition intervals (words I got wrong recently appear more frequently), present them as a quiz: show the word in the target language and ask me for the meaning, then show new words from this week's lesson, update the review dates and accuracy scores after the session"
```

### 2. New Vocabulary Introduction

Introduce new vocabulary three times per week based on the current lesson theme.

```
openclaw cron add --every mon,wed,fri --at 08:00 "read my current lesson theme and proficiency level from Obsidian at Language/Progress/current-level.md, select 8-10 new vocabulary words appropriate for this level and theme, present each word with: the word in the target language, pronunciation guide, English translation, an example sentence, and a memory aid or cognate note, then add all new words to Language/Vocabulary/active-words.md with today's date and initial review interval of 1 day"
```

### 3. Grammar Lesson Delivery

Deliver a structured grammar lesson twice per week.

```
openclaw cron add --every tue,thu --at 08:00 "read my grammar progress from Obsidian at Language/Grammar/progress.md, select the next grammar concept in the curriculum sequence, explain the rule clearly with 5 example sentences at my current proficiency level, provide 3 practice exercises (fill-in-the-blank, sentence construction, error correction), wait for my answers, grade them with detailed explanations for any mistakes, and update the grammar progress file"
```

### 4. Conversation Practice Session

Every evening, conduct a 15-minute freeform conversation in the target language.

```
openclaw cron add --every day --at 19:00 "initiate a 15-minute conversation practice session in [target language] at my current CEFR level (read from Language/Progress/current-level.md), choose a topic from my interest list or current events, speak entirely in the target language but provide gentle corrections when I make errors, note any vocabulary gaps for future lessons, and after the session save a brief summary to Language/Lessons/conversation-{{date}}.md including errors made and new words encountered"
```

### 5. Reading Comprehension Exercise

Three times per week, present an authentic reading exercise.

```
openclaw cron add --every mon,wed,fri --at 12:00 "search tavily-web-search for a short news article or blog post in [target language] appropriate for CEFR level [my-level] on a topic from my interest list, use summarize to verify the difficulty level is appropriate, present the article with 5 comprehension questions (mix of factual recall, inference, and vocabulary-in-context), grade my answers, and save the article and my responses to Language/Reading/{{date}}-reading.md"
```

### 6. Micro-Practice Throughout the Day

Send quick vocabulary challenges via messaging throughout the day.

```
openclaw cron add --every 3h "select 2 vocabulary words from my review queue in Obsidian at Language/Vocabulary/active-words.md, send a quick challenge via whatsapp-cli: one translation prompt and one fill-in-the-blank sentence, wait for my reply, confirm if correct, and update the spaced repetition score"
```

### 7. Weekly Progress Report

Every Sunday, compile a progress report and adjust the learning plan.

```
openclaw cron add --every sunday --at 10:00 "read all lesson and conversation logs from this week in Obsidian at Language/Lessons/, calculate: total practice time, vocabulary words reviewed, new words learned, grammar concepts covered, conversation sessions completed, most common error patterns, and overall accuracy trend, save the report to Language/Progress/weekly-{{date}}.md and recommend adjustments to next week's difficulty level or focus areas"
```

### 8. Pronunciation Practice Session

Twice per week, run a focused pronunciation practice session.

```
openclaw cron add --every tue,sat --at 18:00 "select 10 words or phrases from my vocabulary bank that contain sounds I struggle with (read error patterns from Language/Progress/current-level.md), use tts-multilingual to play the correct pronunciation of each one, ask me to repeat each word (I will record and you transcribe with openai-whisper), compare my pronunciation against the target, give specific feedback on which sounds to adjust, and log the results to Language/Lessons/pronunciation-{{date}}.md"
```

## Guardrails and Safety

### What the Agent Should NEVER Do Autonomously

1. **Never claim to be a certified language teacher or tutor.** The agent is a practice partner and drill tool, not a credentialed instructor. For formal certification preparation (DELF, JLPT, HSK, etc.), recommend consulting a qualified teacher.

2. **Never provide translations of legal, medical, or official documents.** The agent practices conversational and educational language. It must not serve as a translation service for anything with legal or safety implications.

3. **Never share the learner's progress data, error patterns, or personal information externally.** All learning data stays in the local Obsidian vault.

4. **Never skip error correction to be "encouraging."** The agent must be honest about mistakes. Gentle correction is fine; ignoring errors to avoid discouragement defeats the purpose. However, correction should always include the correct form, not just flag the error.

5. **Never advance the curriculum faster than the learner demonstrates readiness.** If accuracy on current-level material is below 70%, the agent should consolidate rather than introduce new concepts.

6. **Never use culturally offensive or inappropriate example sentences.** All generated content should be culturally respectful and appropriate for adult learners.

7. **Never send practice messages outside the learner's configured quiet hours.** If micro-practice via messaging is enabled, respect the hours defined in the configuration.

### Recommended `agentguard` Rules

```
agentguard rule add "block any outbound message outside configured practice hours (22:00-07:00)"
agentguard rule add "block sharing of any file from the Language/ folder with external services"
agentguard rule add "require confirmation before resetting vocabulary review intervals"
```

## Sample Prompts

### Prompt 1: Getting Started

```
I want to learn Spanish. I'm a complete beginner (A1) — I know "hola," "gracias," and a few food words from restaurants. I can practice 20-30 minutes per day, preferably mornings before work (7:30 AM). I'm interested in travel, food, and football.

Set up my learning environment: create the Obsidian folder structure, build an initial vocabulary list of the 50 most essential Spanish words organized by theme, set up my daily practice crons, and outline a 12-week curriculum that gets me to basic conversational ability (A2).
```

### Prompt 2: Resuming After a Break

```
I studied French in university 8 years ago and haven't practiced since. I could probably handle B1 reading but my speaking and listening have regressed to A2. I want to rebuild to B2 over the next 6 months for a work assignment in Paris.

Assess my current level with a quick diagnostic (10 vocabulary questions, 5 grammar questions, a short reading passage), then adjust the curriculum to focus on business French and daily life conversations. Prioritize speaking confidence and listening comprehension over written accuracy.
```

### Prompt 3: Conversation Practice Request

```
Let's practice Japanese conversation. Today I want to talk about what I did last weekend. Stay at N4 level, use mostly polite form (desu/masu), and correct my particle usage — that's my weakest area. If I get stuck, give me a hint in English but don't translate the whole sentence for me.
```

### Prompt 4: Targeted Weakness Drill

```
I keep mixing up ser and estar in Spanish. Give me a focused 15-minute drill: explain the core difference with 5 clear examples of each, then test me with 20 sentences where I have to choose the correct verb. Track my accuracy and tell me which specific contexts I'm still confused about.
```

### Prompt 5: Real-World Preparation

```
I'm traveling to Tokyo next month. I need survival Japanese for: ordering food, asking for directions, using public transit, checking in at hotels, and basic polite interactions. Build me a 4-week crash course focused exclusively on these scenarios. Include the 100 most critical phrases with pronunciation guides.
```

## Maintenance and Optimization

### Weekly Maintenance

1. **Review the weekly progress report** (Recipe #7). Identify whether accuracy is trending up or plateauing. If accuracy has been flat for two weeks, the agent should suggest a curriculum adjustment — either consolidate at the current level or change the learning approach (more conversation, less grammar drill, or vice versa).

2. **Check the vocabulary queue size.** If the review queue exceeds 40 words per day, throttle new word introductions. The agent should do this automatically, but verify it monthly.

3. **Refresh your interest topics.** Update the interests list in `current-level.md` to keep reading materials and conversation topics engaging. Stale topics reduce practice motivation.

### Monthly Maintenance

1. **Level assessment.** Once a month, run a diagnostic prompt: "Give me a comprehensive level assessment covering vocabulary breadth, grammar accuracy, reading comprehension, and conversational fluency. Compare my current performance to the CEFR descriptors for my target level."

2. **Run `skills-audit`** to verify skill security.

3. **Review `self-improving-agent` memory.** Check what patterns it has learned about your error tendencies. Correct any misinterpretations.

### Progression Milestones

Use these as rough benchmarks for how long each CEFR level transition typically takes with consistent daily practice:

- **A1 to A2:** 8-12 weeks (20 minutes/day). You can handle basic survival conversations.
- **A2 to B1:** 12-20 weeks. You can sustain simple conversations on familiar topics.
- **B1 to B2:** 20-36 weeks. You can discuss abstract topics and understand most native content.
- **B2 and beyond:** Diminishing returns from structured drills. Shift to immersion — consume target-language media, have real conversations, and use OpenClaw primarily for vocabulary maintenance and error logging.

### Supported Languages and Considerations

OpenClaw works for any language, but some features work better for certain language families:

- **Romance and Germanic languages (Spanish, French, German, Italian, Portuguese, Dutch):** Full feature support. DeepL translation quality is excellent. TTS is natural-sounding. Whisper accuracy is high.
- **East Asian languages (Japanese, Mandarin, Korean):** Vocabulary drills and reading exercises work well. Pronunciation feedback via Whisper is limited for tonal languages (Mandarin) and pitch-accent languages (Japanese). Consider supplementing with dedicated pronunciation tools.
- **Arabic, Hindi, Thai, and other scripts:** The agent handles these in Obsidian notes, but your text rendering depends on your system fonts. TTS quality varies by language and provider. Test TTS output quality before committing to pronunciation practice workflows.

## Common Gotchas

### 1. Over-Reliance on Translation Instead of Immersion

The biggest risk is that learners use `deepl-translate` as a crutch, translating everything rather than working through comprehension in the target language. Configure the agent to delay providing translations — first prompt the learner to guess from context, then give hints, and only translate as a last resort. Set a guideline: if you are translating more than 30% of words in a reading exercise, the material is too advanced for your current level.

### 2. Spaced Repetition Overload

If you add vocabulary aggressively without reviewing, the spaced repetition queue grows faster than you can process it. Start with 5-8 new words per session, not 15-20. A review queue above 40 words per day causes session fatigue and declining accuracy. The agent should automatically throttle new word introduction if the review backlog exceeds 30 words.

### 3. Pronunciation Feedback Limitations

Whisper transcription can verify that you are producing recognizable words, but it cannot give fine-grained phonetic feedback (tone accuracy in Mandarin, vowel length in Japanese, nasal vowels in French). Use the pronunciation practice sessions as a self-awareness tool — if Whisper consistently mistranscribes a word you say, your pronunciation needs work — but supplement with human feedback or dedicated pronunciation apps for phonetic precision. The agent should be transparent about this limitation.

### 4. Conversation Practice Defaults to English

When you are stuck during a conversation practice session, the natural impulse is to switch to English. The agent should resist this: instead of accepting English input during a target-language conversation, it should prompt you to try expressing the same idea in simpler target-language words. Configure the agent with a "no English during conversation sessions" rule, with the exception of explicitly asking for help (e.g., "How do I say X?").

### 5. Reading Material Difficulty Mismatch

Finding appropriate-level reading material via `tavily-web-search` is imprecise. A search for "simple Spanish news" may return articles at B2 level that are far too advanced for an A1 learner. The agent should use `summarize` to assess readability before presenting the article. If the article contains more than 40% unknown vocabulary (based on your active words list), it is too advanced. The agent should either find a simpler article or pre-teach the critical vocabulary before the reading exercise.

## Frequently Asked Questions

**Q: Can I learn multiple languages simultaneously?**
A: Yes, but create separate folder structures for each language (`Language-Spanish/`, `Language-Japanese/`). The agent maintains independent vocabulary banks, progress tracking, and curricula for each language. However, be realistic about practice time — splitting 25 minutes between two languages is far less effective than dedicating 25 minutes to one.

**Q: Does this replace apps like Duolingo or Anki?**
A: It replaces the functionality of both while offering more flexibility. The spaced repetition system replaces Anki's flashcard decks. The structured lessons and gamified progression replace Duolingo's course structure. The key advantage is that OpenClaw adapts to you — it does not force a one-size-fits-all curriculum path.

**Q: Can the agent practice writing with me?**
A: Absolutely. Ask the agent to assign writing exercises (e.g., "Write a 100-word paragraph about your weekend in Spanish") and it will correct your grammar, vocabulary, and style. Writing practice is not included in the default cron recipes because it requires active engagement, but you can initiate it in any session.

**Q: How accurate is the grammar correction?**
A: For well-resourced languages (Spanish, French, German, Japanese, Mandarin), the agent's grammar correction is very reliable for A1-B2 level learners. For less commonly studied languages or advanced grammatical nuances (subjunctive mood edge cases, literary registers), accuracy decreases. The agent should flag cases where it is uncertain about a grammar rule rather than guessing.

**Q: Can the agent help me prepare for a specific certification exam (DELF, JLPT, HSK)?**
A: The agent can structure practice around exam formats (reading comprehension, listening exercises, grammar drills in the exam style), but it cannot replicate official exam conditions or guarantee score predictions. Use OpenClaw for daily practice and supplement with official practice exams from the certification body. For high-stakes exams, a qualified teacher who specializes in exam preparation is still recommended.

**Q: What if I travel and change timezones?**
A: Update your practice schedule and quiet hours in `Language/Progress/current-level.md`. The cron jobs run based on your Mac's system clock, so if you travel with your Mac, the schedule adjusts automatically. If your Mac stays at home, adjust the cron times to match your remote timezone.
