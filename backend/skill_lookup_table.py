"""
OpenClaw Concierge — Hardcoded Skill Lookup Table
==================================================
Maps natural language use cases (extracted from voice call) to verified
ClawHub skill slugs. Every slug in this file exists in the VoltAgent
awesome-openclaw-skills registry as of March 2026.

Usage:
    from skill_lookup_table import get_skills_for_use_cases

    user_use_cases = ["email automation", "calendar management", "web research"]
    results = get_skills_for_use_cases(user_use_cases)
"""

from difflib import SequenceMatcher
from typing import Dict, List

# ─────────────────────────────────────────────────────────────────────
# THE LOOKUP TABLE
# Format: "use_case_keyword" -> list of verified ClawHub skill slugs
# Each slug has been verified against the VoltAgent/awesome-openclaw-skills repo
# ─────────────────────────────────────────────────────────────────────

SKILL_MAP: Dict[str, Dict] = {

    # ── EMAIL & INBOX ────────────────────────────────────────────────
    "email": {
        "skills": ["clawemail", "agent-mail", "email-autoreply", "custom-smtp-sender"],
        "description": "Email management, reading, sending, and auto-replies",
        "category": "Communication"
    },
    "gmail": {
        "skills": ["clawemail", "aa", "gmail-last5", "expanso-email-triage"],
        "description": "Gmail-specific integration and triage",
        "category": "Communication"
    },
    "email triage": {
        "skills": ["expanso-email-triage", "daily-brief-digest", "email-autoreply"],
        "description": "Smart email sorting, prioritisation, and auto-response",
        "category": "Communication"
    },

    # ── CALENDAR & SCHEDULING ────────────────────────────────────────
    "calendar": {
        "skills": ["briefing", "coordinate-meeting", "meetlark", "bookameeting"],
        "description": "Calendar management, meeting scheduling, and daily briefings",
        "category": "Calendar & Scheduling"
    },
    "meetings": {
        "skills": ["coordinate-meeting", "meetlark", "bookameeting", "meeting-coordinator"],
        "description": "Meeting coordination and scheduling",
        "category": "Calendar & Scheduling"
    },
    "daily briefing": {
        "skills": ["briefing", "ai-daily-briefing", "daily-brief-digest"],
        "description": "Morning briefing with calendar, tasks, and news",
        "category": "Productivity & Tasks"
    },

    # ── TASK MANAGEMENT ──────────────────────────────────────────────
    "task management": {
        "skills": ["brainz-tasks", "agent-task-manager", "clickup-mcp", "family-todo-management"],
        "description": "Task tracking, to-do lists, and project management",
        "category": "Productivity & Tasks"
    },
    "todoist": {
        "skills": ["brainz-tasks", "4todo"],
        "description": "Todoist and 4todo task management",
        "category": "Productivity & Tasks"
    },
    "project management": {
        "skills": ["clickup-mcp", "clickup-skill", "asana", "kanboard-skill", "lofy-projects"],
        "description": "Project management across ClickUp, Asana, Kanboard",
        "category": "Productivity & Tasks"
    },
    "goals": {
        "skills": ["goal-setting-okrs", "build-discipline", "4to1-planner"],
        "description": "Goal setting, OKRs, and discipline building",
        "category": "Productivity & Tasks"
    },

    # ── SOCIAL MEDIA ─────────────────────────────────────────────────
    "social media": {
        "skills": ["adaptlypost", "blogburst", "kiro-x-publisher"],
        "description": "Social media posting across Instagram, X, LinkedIn, TikTok, Facebook",
        "category": "Marketing & Sales"
    },
    "twitter": {
        "skills": ["kiro-x-publisher", "bird-dms", "adaptlypost"],
        "description": "X/Twitter posting, DMs, and content discovery",
        "category": "Communication"
    },
    "content creation": {
        "skills": ["blogburst", "adaptlypost", "kiro-x-publisher", "moments-copy"],
        "description": "Generate social posts, blog content, and viral copy",
        "category": "Marketing & Sales"
    },

    # ── WEB SEARCH & RESEARCH ────────────────────────────────────────
    "web search": {
        "skills": ["tavily-search", "agent-browser", "firecrawl"],
        "description": "Web searching, browsing, and content extraction",
        "category": "Search & Research"
    },
    "research": {
        "skills": ["tavily-search", "arxiv-search-collector", "facticity-ai"],
        "description": "Deep research, academic papers, and fact-checking",
        "category": "Search & Research"
    },
    "news": {
        "skills": ["finance-news", "daily-brief-digest", "ai-daily-briefing"],
        "description": "News monitoring and daily digests",
        "category": "Search & Research"
    },

    # ── FINANCE & BUDGETING ──────────────────────────────────────────
    "finance": {
        "skills": ["actual-budget", "financial-data", "invoice-tracker-pro"],
        "description": "Personal finance, budgeting, and financial data",
        "category": "Productivity & Tasks"
    },
    "budgeting": {
        "skills": ["actual-budget", "arc-budget-tracker", "card-optimizer"],
        "description": "Budget tracking, spending alerts, and financial planning",
        "category": "Productivity & Tasks"
    },
    "invoicing": {
        "skills": ["invoice-tracker-pro", "freelance-pilot"],
        "description": "Invoice generation and freelance billing",
        "category": "Productivity & Tasks"
    },
    "stock market": {
        "skills": ["financial-data", "banana-farmer", "portfolio-watcher"],
        "description": "Stock monitoring, portfolio tracking, and market data",
        "category": "Communication"
    },

    # ── CODING & DEVELOPMENT ─────────────────────────────────────────
    "coding": {
        "skills": ["claw-conductor", "autonomous-executor", "checkmate"],
        "description": "Autonomous coding, task execution, and development workflows",
        "category": "Coding Agents & IDEs"
    },
    "github": {
        "skills": ["auto-pr-merger", "alex-session-wrap-up", "arc-skill-gitops"],
        "description": "GitHub automation, PR management, and commit workflows",
        "category": "Git & GitHub"
    },
    "devops": {
        "skills": ["azure-devops", "arc-skill-gitops", "bitbucket-automation"],
        "description": "DevOps, CI/CD, and cloud deployment",
        "category": "DevOps & Cloud"
    },

    # ── NOTES & KNOWLEDGE ────────────────────────────────────────────
    "notes": {
        "skills": ["capacities", "focusnoteapp", "codifica"],
        "description": "Note-taking, knowledge management, and context preservation",
        "category": "Notes & PKM"
    },
    "notion": {
        "skills": ["composio-integration"],
        "description": "Notion integration via Composio connector",
        "category": "Productivity & Tasks"
    },

    # ── DOCUMENTS & FILES ────────────────────────────────────────────
    "documents": {
        "skills": ["excel-workflow", "castreader"],
        "description": "Document processing, Excel workflows, and content reading",
        "category": "PDF & Documents"
    },
    "spreadsheets": {
        "skills": ["excel-workflow", "biz-reporter"],
        "description": "Excel and spreadsheet automation",
        "category": "PDF & Documents"
    },

    # ── SMART HOME ───────────────────────────────────────────────────
    "smart home": {
        "skills": ["control4-home", "lifx", "lametric-cli"],
        "description": "Smart home control: lights, displays, home automation",
        "category": "Smart Home & IoT"
    },

    # ── PHONE CALLS & VOICE ──────────────────────────────────────────
    "phone calls": {
        "skills": ["clawring", "outbound-call", "aliyun-asr"],
        "description": "Make and receive phone calls, voice transcription",
        "category": "Communication"
    },
    "voice": {
        "skills": ["miranda-elevenlabs-speech", "castreader", "aliyun-asr"],
        "description": "Text-to-speech, speech-to-text, and audio content",
        "category": "Speech & Transcription"
    },

    # ── MESSAGING PLATFORMS ──────────────────────────────────────────
    "whatsapp": {
        "skills": ["agentmesh", "malayalam-whatsapp"],
        "description": "WhatsApp messaging integration",
        "category": "Communication"
    },
    "telegram": {
        "skills": ["apipick-telegram-phone-check", "pidgesms"],
        "description": "Telegram bot and messaging",
        "category": "Communication"
    },
    "sms": {
        "skills": ["pidgesms", "freemobile-sms"],
        "description": "SMS text messaging",
        "category": "Communication"
    },
    "slack": {
        "skills": ["composio-integration"],
        "description": "Slack workspace integration via Composio",
        "category": "Communication"
    },
    "microsoft 365": {
        "skills": ["microsoft365", "m365-pnp-cli", "exchange2010"],
        "description": "Outlook, Calendar, OneDrive, SharePoint via Microsoft Graph",
        "category": "Communication"
    },

    # ── SHOPPING & ECOMMERCE ─────────────────────────────────────────
    "shopping": {
        "skills": ["amazon-product-api-skill", "ecommerce-price-watcher", "camelcamelcamel-alerts"],
        "description": "Product search, price tracking, and deal alerts",
        "category": "Shopping & E-commerce"
    },
    "ecommerce": {
        "skills": ["amazon-product-api-skill", "ecommerce-price-watcher", "envato-comment-task-to-sheet"],
        "description": "E-commerce management and marketplace integration",
        "category": "Shopping & E-commerce"
    },

    # ── HEALTH & FITNESS ─────────────────────────────────────────────
    "health": {
        "skills": ["lembrete-agua"],
        "description": "Health reminders and wellness tracking",
        "category": "Health & Fitness"
    },
    "fitness": {
        "skills": ["lembrete-agua"],
        "description": "Fitness and hydration tracking",
        "category": "Health & Fitness"
    },

    # ── MEDIA & IMAGES ───────────────────────────────────────────────
    "image generation": {
        "skills": ["app-store-screenshot-generation"],
        "description": "AI image generation and screenshot creation",
        "category": "Image & Video Generation"
    },

    # ── AUTOMATION & WORKFLOWS ───────────────────────────────────────
    "automation": {
        "skills": ["agent-autopilot", "autonomous-executor", "hylo-ghl", "composio-integration"],
        "description": "Workflow automation, autonomous execution, and multi-app integration",
        "category": "Self-Hosted & Automation"
    },
    "crm": {
        "skills": ["hylo-ghl", "composio-integration"],
        "description": "CRM and customer management via GoHighLevel or Composio",
        "category": "Marketing & Sales"
    },

    # ── SECURITY ─────────────────────────────────────────────────────
    "security": {
        "skills": ["arc-security-audit", "arc-trust-verifier", "clawgatesecure"],
        "description": "Security auditing, trust verification, and agent protection",
        "category": "Security & Passwords"
    },

    # ── MEMORY & LEARNING ────────────────────────────────────────────
    "memory": {
        "skills": ["agent-chronicle", "basal-ganglia-memory", "close-loop"],
        "description": "Long-term memory, habit formation, and session persistence",
        "category": "Productivity & Tasks"
    },

    # ── FILE SHARING ─────────────────────────────────────────────────
    "file sharing": {
        "skills": ["localsend", "dji-backup"],
        "description": "Local file transfer and backup",
        "category": "Communication"
    },

    # ── WEATHER ──────────────────────────────────────────────────────
    "weather": {
        "skills": ["mh-weather"],
        "description": "Current weather and forecasts",
        "category": "Communication"
    },
}


def _similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def get_skills_for_use_cases(
    use_cases: List[str],
    threshold: float = 0.5
) -> Dict[str, Dict]:
    """
    Given a list of natural language use cases from the voice call,
    return matched skills with their install commands.
    """
    results = {}

    for use_case in use_cases:
        use_case_lower = use_case.lower().strip()

        if use_case_lower in SKILL_MAP:
            match = SKILL_MAP[use_case_lower]
            results[use_case] = {
                "matched_key": use_case_lower,
                "skills": match["skills"],
                "install_commands": [f"clawhub install {s}" for s in match["skills"]],
                "description": match["description"],
                "category": match["category"],
                "confidence": "exact"
            }
            continue

        substring_match = None
        for key in SKILL_MAP:
            if key in use_case_lower or use_case_lower in key:
                substring_match = key
                break

        if substring_match:
            match = SKILL_MAP[substring_match]
            results[use_case] = {
                "matched_key": substring_match,
                "skills": match["skills"],
                "install_commands": [f"clawhub install {s}" for s in match["skills"]],
                "description": match["description"],
                "category": match["category"],
                "confidence": "substring"
            }
            continue

        best_score = 0.0
        best_key = None
        for key in SKILL_MAP:
            score = _similarity(use_case_lower, key)
            if score > best_score:
                best_score = score
                best_key = key

        if best_score >= threshold and best_key:
            match = SKILL_MAP[best_key]
            results[use_case] = {
                "matched_key": best_key,
                "skills": match["skills"],
                "install_commands": [f"clawhub install {s}" for s in match["skills"]],
                "description": match["description"],
                "category": match["category"],
                "confidence": f"fuzzy ({best_score:.0%})"
            }
        else:
            results[use_case] = {
                "matched_key": None,
                "skills": [],
                "install_commands": [],
                "description": "No match found. User should browse ClawHub manually.",
                "category": "Unknown",
                "confidence": "none"
            }

    return results


def get_stats() -> Dict:
    all_slugs = set()
    for entry in SKILL_MAP.values():
        all_slugs.update(entry["skills"])

    categories = set(entry["category"] for entry in SKILL_MAP.values())

    return {
        "use_case_keywords": len(SKILL_MAP),
        "unique_skill_slugs": len(all_slugs),
        "categories_covered": len(categories),
        "category_list": sorted(categories)
    }
