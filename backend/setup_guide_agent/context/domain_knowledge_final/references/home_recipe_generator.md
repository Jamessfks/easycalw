---
Source: https://chris.eidhof.nl/post/llm-month-food-assistant/
Title: Food Assistant
Author: Chris Eidhof
Date: 2026-03-00
Type: reference
---

Built a small custom food agent in about half a day, inspired by Peter Steinberger's work with OpenClaw. The agent manages food inventory, knows about allergies and dietary wishes, has recipes and a grocery list, and a list of dishes enjoyed.

## Technical Setup
- TypeScript project using OpenAI Agents SDK
- Interface: Telegram bot (text + voice via ffmpeg transcription)
- Storage: Markdown files in a Git repository, auto-committed on changes
- Hosting: Fly.io with GitHub deploy key for single-repo access
- Pattern: persistent memory via Git + change tracking

## Key Insights
- System prompt is also a Markdown file — can tell agent to change its own prompt
- Initially had specific tools for "write shopping list", "write recipe list" etc. — switching to generic read/write markdown file tools produced dramatically better results
- Added support for images and meal planning
- Agent is online 24/7, accessible via chat, has no access beyond needed files

## Usage
Plans meals, generates recipe ideas, creates shopping lists, manages ingredient reuse and meal prep.
