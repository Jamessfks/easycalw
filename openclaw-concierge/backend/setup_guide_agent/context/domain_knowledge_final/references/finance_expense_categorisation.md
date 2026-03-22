---
Source: https://www.paradime.io/guides/expense-categorization-openclaw-paradime
Title: How to Automate Expense Categorization with OpenClaw in Paradime
Author: Paradime
Date: 2026-02-26
Type: reference
---

Stop manually tagging spreadsheet rows. This guide walks through a repeatable workflow: read uncategorized transactions from a Google Sheet, classify them by expense category using OpenClaw's AI agent SDK, update the sheet automatically, and schedule everything to run daily with Paradime Bolt.

## Architecture
Bolt triggers Python script on cron schedule → script reads uncategorized rows from Google Sheets → classifies each using OpenClaw → writes categories back.

## Setup
1. Install Dependencies (openclaw-python, gspread, google-auth via Poetry)
2. Google Cloud Service Account (Sheets API + Drive API)
3. OpenClaw API Key
4. Configure Environment Variables in Paradime (GOOGLE_CREDENTIALS_JSON, OPENCLAW_API_KEY, EXPENSE_SHEET_ID)

## Classification Script
Creates scripts/categorize_expenses.py using OpenClaw chat_completion endpoint with structured JSON output for deterministic parsing. Categories: travel, software, meals, etc. Temperature=0.0 for deterministic responses.

## Bolt Schedule
- Option A: Schedules as Code (YAML in paradime_schedules.yml)
- Option B: Bolt UI

## Monitoring and Debugging
- Run History Dashboard
- Log Types: Summary (DinoAI triage), Console (stdout/stderr), Debug (system-level)
- Notifications: Email, Slack, Microsoft Teams
- Bolt System Alerts: parse errors, OOM, git clone failures, timeouts

## Troubleshooting
- DefaultCredentialsError → verify GOOGLE_CREDENTIALS_JSON env var
- SpreadsheetNotFound → share sheet with service account email
- 401 Unauthorized → regenerate OPENCLAW_API_KEY
- JSONDecodeError → temperature=0.0, retry with explicit prompt
- poetry install fails → check pyproject.toml in project root
- SLA breach → add batching, use rate limit headers
