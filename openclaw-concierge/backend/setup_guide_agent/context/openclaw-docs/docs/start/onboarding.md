---
title: "Onboarding (macOS App)"
source_url: "https://docs.openclaw.ai/start/onboarding"
section: "start"
---

# Onboarding (macOS App)

# Onboarding (macOS App)

This doc describes the **current** first‑run setup flow. The goal is a
smooth “day 0” experience: pick where the Gateway runs, connect auth, run the
wizard, and let the agent bootstrap itself.
For a general overview of onboarding paths, see [Onboarding Overview](/start/onboarding-overview).

    Security trust model:

    * By default, OpenClaw is a personal agent: one trusted operator boundary.
    * Shared/multi-user setups require lock-down (split trust boundaries, keep tool access minimal, and follow [Security](/gateway/security)).
    * Local onboarding now defaults new configs to `tools.profile: "coding"` so fresh local setups keep filesystem/runtime tools without forcing the unrestricted `full` profile.
    * If hooks/webhooks or other untrusted content feeds are enabled, use a strong modern model tier and keep strict tool policy/sandboxing.

    Where does the **Gateway** run?

    * **This Mac (Local only):** onboarding can configure auth and write credentials
      locally.
    * **Remote (over SSH/Tailnet):** onboarding does **not** configure local auth;
      credentials must exist on the gateway host.
    * **Configure later:** skip setup and leave the app unconfigured.

      **Gateway auth tip:**

      * The wizard now generates a **token** even for loopback, so local WS clients must authenticate.
      * If you disable auth, any local process can connect; use that only on fully trusted machines.
      * Use a **token** for multi‑machine access or non‑loopback binds.

    Onboarding requests TCC permissions needed for:

    * Automation (AppleScript)
    * Notifications
    * Accessibility
    * Screen Recording
    * Microphone
    * Speech Recognition
    * Camera
    * Location

    This step is optional
    The app can install the global `openclaw` CLI via npm/pnpm so terminal
    workflows and launchd tasks work out of the box.

    After setup, the app opens a dedicated onboarding chat session so the agent can
    introduce itself and guide next steps. This keeps first‑run guidance separate
    from your normal conversation. See [Bootstrapping](/start/bootstrapping) for
    what happens on the gateway host during the first agent run.