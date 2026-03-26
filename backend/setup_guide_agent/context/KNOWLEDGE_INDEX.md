# EasyClaw Knowledge Base Index
> Read this file FIRST. It tells you exactly which files to read for each user scenario.
> Do NOT Glob the knowledge base. Use this index to read only what you need.

## Quick Reference: Deployment Scenarios
| Scenario | Files to Read |
|---|---|
| Mac Mini (new hardware) | setup_guides/mac_mini_setup.md |
| Existing Mac | setup_guides/existing_mac_setup.md |
| Docker | setup_guides/docker_setup.md |
| VPS/Cloud | setup_guides/vps_setup.md |

## Quick Reference: Channels
| Channel | Files to Read |
|---|---|
| Telegram | openclaw-docs/docs/channels/telegram.md |
| WhatsApp | openclaw-docs/docs/channels/whatsapp.md |
| Discord | openclaw-docs/docs/channels/discord.md |
| iMessage | openclaw-docs/docs/channels/imessage.md |
| Slack | openclaw-docs/docs/channels/slack.md |

## Quick Reference: Model Providers
| Provider | Files to Read |
|---|---|
| Anthropic (Claude) | openclaw-docs/docs/providers/anthropic.md |
| OpenAI | openclaw-docs/docs/providers/openai.md |
| Google (Gemini) | openclaw-docs/docs/providers/google.md |
| Ollama (local) | openclaw-docs/docs/providers/ollama.md |
| OpenRouter | openclaw-docs/docs/providers/openrouter.md |

## Quick Reference: Automations
| Need | Files to Read |
|---|---|
| Cron jobs / schedules | openclaw-docs/docs/automation/cron-jobs.md |
| Standing orders | openclaw-docs/docs/automation/standing-orders.md |
| Webhooks | openclaw-docs/docs/automation/webhook.md |
| Heartbeats | openclaw-docs/docs/gateway/heartbeat.md |

## Quick Reference: Security
| Need | Files to Read |
|---|---|
| Security hardening | openclaw-docs/docs/security/THREAT-MODEL-ATLAS.md |
| Firewall/VPS | setup_guides/vps_setup.md (security section) |
| Skill vetting | skill_registry.md (search for "skill-vetter") |

## Quick Reference: Industries
| Industry | Domain Knowledge File |
|---|---|
| Healthcare | domain_knowledge_final/references/healthcare_therapy_intake.md |
| Finance | domain_knowledge_final/references/finance_expense_tracking.md |
| Real Estate | domain_knowledge_final/references/realestate_voice_crm.md |
| Content/Media | domain_knowledge_final/references/content_newsletter_curation.md |
| Education | domain_knowledge_final/references/education_lesson_scheduler.md |
| Freelance/Consulting | domain_knowledge_final/references/consulting_client_onboarding.md |
| Small Business | domain_knowledge_final/references/smallbiz_customer_support.md |
| E-commerce | domain_knowledge_final/references/ecommerce_listing_management.md |
| Personal | domain_knowledge_final/references/personal_morning_briefing.md |
| Developer/DevOps | domain_knowledge_final/references/devops_autonomous_dev_agent.md |
| Entrepreneur | domain_knowledge_final/references/entrepreneurship_autonomous_business.md |

## Quick Reference: Common Use Cases
| Use Case | Summary File | Reference File |
|---|---|---|
| Morning briefing | domain_knowledge_final/summaries/personal_morning_briefing.md | domain_knowledge_final/references/personal_morning_briefing.md |
| Email triage | domain_knowledge_final/summaries/personal_email_triage.md | domain_knowledge_final/references/personal_email_triage.md |
| Invoice tracking | domain_knowledge_final/summaries/freelance_invoice_tracking.md | domain_knowledge_final/references/freelance_invoice_tracking.md |
| Client onboarding | domain_knowledge_final/summaries/consulting_client_onboarding.md | domain_knowledge_final/references/consulting_client_onboarding.md |
| Lead/CRM | domain_knowledge_final/summaries/realestate_voice_crm.md | domain_knowledge_final/references/realestate_voice_crm.md |

## Skill Registry
Always Grep skill_registry.md for skill slugs. Do NOT read it in full — it is 435 lines.
Example: Grep("gmail", skill_registry.md) to find email-related skills.

## OpenClaw Documentation Strategy
For specific documentation questions:
1. Check the relevant section folder in openclaw-docs/docs/
2. Read ONLY the specific file you need
3. Do NOT read the entire openclaw-docs/ tree
The full docs are 347 pages — read selectively.
