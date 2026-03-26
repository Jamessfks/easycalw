# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | {{user_name}} — {{industry}} professional |
| **MISSION** | {{primary_pain_point}} |
| **DATE** | {{date}} |
| **DEPLOYMENT** | {{deployment_type}} |
| **CHANNEL** | {{channel}} |
| **MODEL** | {{model_provider}} |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to {{specific_outcome_from_interview}} — built around your {{industry}} workflow and the tools you already use.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your {{deployment_type}}, connected to {{channel}} and ready for daily use
- **{{number}} tailored automations** that handle {{primary_automation_description}} without manual intervention
- **Industry-grade guardrails** ensuring your agent operates within {{industry}}-specific compliance boundaries

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create
- [ ] **{{model_provider}} account** — Create at {{provider_signup_url}}. You need an API key. Set a monthly spending limit of **$20–$50** to start.
- [ ] **{{channel}} account** — Install the {{channel}} app on your phone if you haven't already.

### API Keys to Obtain
- [ ] **{{model_provider}} API Key** — In your provider console: API Keys → Create Key. Copy and save it somewhere secure.
- [ ] **{{search_provider}} API Key** — For web search capability (if applicable).

### Hardware & Software
- [ ] {{hardware_checklist_item_1}}
- [ ] {{hardware_checklist_item_2}}
- [ ] Terminal access confirmed on your machine

> 💡 **TIP:** {{user_first_name}}, gather all API keys in a password manager before starting — this prevents context-switching mid-setup.

---

## 01 | 🖥️ PLATFORM SETUP

{{user_first_name}}, these steps prepare your {{deployment_type}} to run OpenClaw reliably.

> ⚠️ **WARNING:** {{industry_specific_warning — e.g., "HIPAA requires full-disk encryption for any machine processing patient data. Complete Step 1A before proceeding." for healthcare, or "Fair Housing Act compliance means your agent must never filter or prioritize leads by protected class characteristics." for real estate, or "PCI DSS requires that no cardholder data be stored in plain text on this machine." for finance}}

### 1A — {{Platform-Specific Step}}

```bash
{{platform_specific_command}}
```

**Verify it worked:**
```
{{expected_successful_output}}
```

### 1B — Configure Always-On Settings

> 💡 **TIP:** Why this matters for you: a {{deployment_type}} that sleeps will miss your scheduled {{automation_name}}, and {{user_first_name}}'s {{channel}} messages will go unanswered.

{{platform_specific_always_on_steps}}

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Prerequisites

```bash
{{prerequisite_install_commands}}
```

**Verify it worked:**
```
$ node --version
v22.16.0   ← must be 22.16 or higher
```

### 2B — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← any version 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access. If you see a gateway auth error after updates, run `openclaw onboard` to reconfigure.

### 2C — Run the Onboarding Wizard

```bash
openclaw onboard {{onboard_flags}}
```

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **{{model_provider}}** — paste your API key |
| Model | **`{{model_slug}}`** (best balance for {{industry}} operations) |
| Messaging channels | **{{channel}}** — set up in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — you'll install skills deliberately in Section 05 |

![Security Handshake](templates/images/image12.png)

> ✅ **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

---

## 03 | 📱 CONNECT YOUR CHANNEL ({{CHANNEL}})

{{user_first_name}}, this connects your agent to {{channel}} so you can communicate from your phone or desktop.

{{channel_specific_setup_steps}}

### 3A — Create Your Bot / Connection

> ✅ **ACTION:** Follow the step-by-step below. Each command includes verification.

{{channel_bot_creation_steps}}

**Verify it worked:**
```
$ openclaw channels status
{{channel}}   ✓ connected   user_id: {{user_id}}
```

### 3B — Lock Down Access

> ⚠️ **WARNING:** Without this step, anyone who discovers your bot can send it commands.

{{channel_lockdown_steps}}

![Channel Selection](templates/images/image3.png)

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER ({{PROVIDER}})

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: {{provider}}   Status: ✓ active   Model: {{model_slug}}
```

If not configured:
```bash
openclaw onboard --{{provider_flag}} "YOUR_{{PROVIDER}}_API_KEY"
```

> 💡 **TIP:** {{user_first_name}}, set a monthly spending cap in your provider console. Typical usage for {{use_case_description}} is ${{low_estimate}}–${{high_estimate}}/month.

![Model Provider Selection](templates/images/image11.png)

---

## 05 | 🔧 INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill. Approximately 17–20% of community skills contain suspicious code.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

### Phase 2: Core {{Industry}} Skills

| Your Need | Skill | What It Does |
|---|---|---|
| {{user_need_1}} | `{{skill_slug_1}}` | {{skill_description_1}} |
| {{user_need_2}} | `{{skill_slug_2}}` | {{skill_description_2}} |
| {{user_need_3}} | `{{skill_slug_3}}` | {{skill_description_3}} |

```bash
skill-vetter {{skill_slug_1}}
clawhub install {{skill_slug_1}}

skill-vetter {{skill_slug_2}}
clawhub install {{skill_slug_2}}
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter     v1.x.x   ✓ active
prompt-guard     v1.x.x   ✓ active
{{skill_slug_1}} v1.x.x   ✓ active
{{skill_slug_2}} v1.x.x   ✓ active
```

---

## 06 | ⚡ CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters: these automations are the core of your {{industry}} workflow — they replace the manual {{manual_task_description}} you described in your interview.

### Automation 1 — {{Automation Name}}

**What it does:** {{automation_description}}
**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Takes no action.

```bash
openclaw cron add \
  --name "{{automation_name}}" \
  --cron "{{cron_expression}}" \
  --tz "{{timezone}}" \
  --session isolated \
  --message "{{automation_prompt}}" \
  --announce \
  --channel {{channel}} \
  --to "YOUR_{{CHANNEL}}_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                     Schedule        Timezone          Status
1    {{automation_name}}      {{cron_expr}}   {{timezone}}      ✓ active
```

> {{industry_specific_callout — e.g., "⚕️ **HIPAA Note:** This automation is NOTIFY-tier — your agent compiles information but never sends patient-facing messages automatically." or "🏠 **Fair Housing Note:** Ensure automation prompts never reference protected class characteristics when filtering or prioritizing leads." or "💳 **PCI Note:** No cardholder data should appear in automation prompts or outputs."}}

---

## 07 | 💉 INJECT YOUR SOUL

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time**, in order.

```bash
openclaw dashboard
```

**Prompt sequence:**
1. **Identity Prompt** → establishes who the agent is
2. **{{Dynamic Prompt 2 Title}}** → {{brief description}}
3. **{{Dynamic Prompt 3 Title}}** → {{brief description}}
4. **Security Audit Prompt** → final verification before going live

> 💡 **TIP:** Wait for the agent to acknowledge each prompt before sending the next. This ensures each layer of configuration is properly absorbed.

![OpenClaw Web UI](templates/images/image6.png)

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** {{user_first_name}}, do not skip this section. {{industry_security_reason — e.g., "Your dental practice handles PHI under HIPAA." or "Your financial advisory handles client portfolio data under PCI DSS." or "Your real estate business must comply with Fair Housing Act data handling."}}

### {{Platform}}-Specific Hardening

{{platform_security_steps}}

### {{Industry}}-Specific Compliance Checklist

- [ ] {{compliance_item_1}}
- [ ] {{compliance_item_2}}
- [ ] {{compliance_item_3}}
- [ ] API key spending limit set in provider console
- [ ] OpenClaw conversation logs retained (audit trail)
- [ ] API keys rotated quarterly

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for real {{industry}} operations.

```bash
openclaw security audit --deep
```

**Verify it worked:**
```
Security Audit Complete
Critical warnings: 0
Recommendations: X (review below)
```

```bash
openclaw security audit --fix
openclaw doctor
openclaw health
```

**Manual verification:**
- [ ] `openclaw security audit --deep` completes with no critical warnings
- [ ] Gateway shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly the jobs you configured — no unexpected entries
- [ ] `openclaw skills list` matches exactly what you installed in Section 05
- [ ] {{channel}} bot only responds to your account
- [ ] No API keys stored in plain text — check `~/.openclaw/`
- [ ] {{platform_specific_security_check}}
- [ ] Review skill permissions: `openclaw skills list --verbose`

**Do NOT begin live {{industry}} operations until all checks pass.**

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
```

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**{{channel}} bot not responding**
- Verify bot token: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- Confirm access lockdown settings from Step 3B

**Cron jobs not firing**
- Verify gateway: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test manually: `openclaw cron run <job-id>`

### Next Steps After Stable Setup

Once you've run the system for 1–2 weeks, {{user_first_name}}, consider:

1. **{{next_step_1}}** — {{description}}
2. **{{next_step_2}}** — {{description}}
3. **Context hygiene** — after week 5, use separate channels per major workflow to prevent context pollution

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (tokenized — don't type manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | {{provider}} (`{{model_slug}}`) |
| **Channel** | {{channel}} |
| **Cron Timezone** | `{{timezone}}` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**

---

# PROMPTS FORMAT REFERENCE

> The `prompts_to_send.md` file should follow this structure:

```markdown
# INITIALIZATION PROMPTS FOR YOUR OPENCLAW INSTANCE

> **Instructions:** Paste each prompt below into your OpenClaw chat interface,
> one at a time, in order. Wait for the agent to acknowledge each before
> sending the next.

---

## Prompt 1: Identity & Role Definition

> 📋 **What this does:** Establishes your agent's identity, role, and operating parameters.

` ` `
You are [Agent Name], the personal AI assistant for [User Name],
a [role] at [business]. Your primary mission is [mission].

Operating parameters:
- Industry: [industry]
- Location: [location]
- Operating hours: [hours]
- Communication style: [style]
` ` `

---

## Prompt 2: [Dynamic Title Based on User Needs]

> 📋 **What this does:** [One-line description of what this prompt configures]

` ` `
[Prompt content — concrete, specific to this user's interview responses]
` ` `

---

## Prompt N: Security Audit (ALWAYS LAST)

> 📋 **What this does:** Final security verification before going live.

` ` `
Run the following security checks before operating:

1. Run: openclaw security audit --deep
2. Verify authentication is enabled
3. Confirm installed skills match expected list
4. Review cron jobs: openclaw cron list
5. Check no API keys stored in plain text
6. [Platform-specific check]
7. Review permissions: openclaw skills list --verbose

Do NOT proceed until all checks pass.
If any check fails, report the failure and wait for instructions.
` ` `
```
