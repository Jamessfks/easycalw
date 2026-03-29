# Positioning Matrix

**Status:** reviewed
**Author:** Travis
**Updated:** 2026-03-27

---

## The Question
Where does EasyClaw sit across all 3 layers relative to the entire competitive landscape?

## What We Know

### Cross-layer companies span multiple layers, making them the most relevant comparisons `P0`

Most competitors live in a single layer. The handful that span layers are the closest competitive analogs to EasyClaw:

| Company | Layers Spanned | What They Do | Price Range |
|---------|---------------|--------------|-------------|
| Klaus | Setup + Upgrade | Hosting ($19-200/mo) + managed rollout ($1K+/mo) | $19-$1K+/mo |
| setupclaw | Setup (could extend to Upgrade) | White-glove deployment | $3K-6K one-time |
| ManageMyClaw | Setup + light Observability | One-time setup ($499) + managed care ($99/mo) | $499 + $99/mo |
| Done For You AI | Upgrade + light Observability | Custom builds + ongoing management + monthly reporting | Custom pricing |
| Salesforce Agentforce | Setup + Observability | Pre-built agents (free) + platform-bundled monitoring | Bundled into Salesforce |
| GoHighLevel | Setup + Upgrade | Platform + CRM + AI config (agencies do customization) | $97-497/mo |
| Stammer/Parallel | Setup + Upgrade | White-label platform (agencies using them do consulting) | Platform fees + agency markup |

> Source: competitor analysis across product pages, pricing pages, and demo walkthroughs (March 2026)

### The 3-layer positioning matrix reveals clear gaps `P0`

| Layer | Commoditized End | Differentiated End | EasyClaw Position |
|-------|-----------------|-------------------|-------------------|
| **Setup** | Budget hosting ($4-15/mo): agent37, EasyClaw Pro, RunClaw.ai | White-glove ($499-6K): setupclaw, ManageMyClaw; Security-focused: Clawctl, ClawTrust | Not competing on hosting price. Bundles setup with configuration value. |
| **Upgrade** | Self-serve ($0-199/mo): Lindy, Relevance, MindStudio; One-time kits ($29): HiredYou | Full consulting ($10K-$100K+): Morningside, Deloitte; Managed ($1K+/mo): Klaus | Occupies the vacant $200-$2,000 range. Automated discovery replaces manual consulting. Upper-right quadrant. |
| **Observability** | OSS tools (free): Langfuse, AgentOps, Promptfoo | Enterprise ($50K+/yr): Datadog, Arize; Managed services: consulting agencies | Future opportunity. A $49-149/mo SMB maintenance product does not exist yet. |

> Source: pricing analysis across 30+ competitors (March 2026)

### Four empty quadrants represent strategic opportunities `P1`

1. **Setup + Upgrade bundle at mid-market price** — not white-glove, not self-serve. This is EasyClaw's current position.
2. **Automated workflow discovery for agent configuration** — EasyClaw's unique capability. No one else does voice-interview-driven discovery.
3. **SMB-focused agent maintenance/observability as a product** — future EasyClaw opportunity at $49-149/mo. This product category does not exist.
4. **Voice AI + OpenClaw + configuration as a single managed service** — nobody combines these today.

> Source: gap analysis from competitive mapping exercise

### ASCII landscape visualization `P1`

```
                    COMPETITIVE LANDSCAPE — ALL 3 LAYERS
                    ====================================

  Price/Complexity
  ^
  |
  |  $100K+ ·····  Deloitte, Morningside
  |                 (full consulting)
  |
  |   $10K+ ·····  setupclaw ($3-6K)
  |                 Done For You AI
  |
  |   $1K+  ·····  Klaus managed ($1K+/mo)
  |                 GoHighLevel + agency
  |
  |  ┌─────────────────────────────────┐
  |  │  $200-$2K  EASYCLAW             │  <── VACANT QUADRANT
  |  │  Automated discovery + setup    │
  |  │  Voice interview → setup guide  │
  |  └─────────────────────────────────┘
  |
  |   $99    ·····  ManageMyClaw ($499 + $99/mo)
  |                  MindStudio ($99/mo)
  |
  |   $29    ·····  HiredYou (one-time kit)
  |
  |   $4-19  ·····  agent37, RunClaw.ai, Klaus basic
  |                  Lindy (free tier), Relevance (free tier)
  |
  |   Free   ·····  Salesforce Agentforce (pre-built)
  |                  Langfuse, AgentOps, Promptfoo (OSS)
  |
  +──────────────────────────────────────────────────────> Automation
    Manual/          Forms/           Automated         Full AI-driven
    Human-only       Templates        Platform          Discovery

    Deloitte         GoHighLevel      Lindy             EasyClaw
    setupclaw        Stammer          Relevance         (only one here)
    Klaus managed    Klaus basic      MindStudio
```

```
  LAYER COVERAGE MAP
  ==================

  Company              Setup    Upgrade    Observability
  ─────────────────    ─────    ───────    ─────────────
  EasyClaw             [██]     [████]     [    ] future
  Klaus                [██]     [████]     [    ]
  setupclaw            [████]   [    ]     [    ]
  ManageMyClaw         [██]     [    ]     [██  ]
  Done For You AI      [    ]   [████]     [██  ]
  Salesforce           [██]     [    ]     [████]
  GoHighLevel          [██]     [██  ]     [    ]
  Stammer/Parallel     [██]     [██  ]     [    ]
  Lindy                [    ]   [██  ]     [    ]
  Langfuse             [    ]   [    ]     [████]
  Datadog/Arize        [    ]   [    ]     [████]

  Legend: [████] = primary focus  [██  ] = partial/light  [    ] = absent
```

## What We Think

### EasyClaw occupies a genuinely vacant position `P0`

The $200-$2,000 range with automated discovery is empty. Below it, self-serve platforms skip discovery entirely. Above it, human consultants charge $3K-$100K+. EasyClaw is the only company attempting to automate the consulting/discovery step at a mid-market price.

### Klaus is the closest structural competitor `P1`

Klaus is the only other company that spans Setup and Upgrade in a meaningful way. However, their Upgrade tier ($1K+/mo) is manual — human-led managed rollout. If Klaus adds automated discovery, they become a direct competitor. This is the single most important competitive risk to monitor.

### The Observability layer is wide open at the SMB level `P1`

Enterprise observability (Datadog, Arize) starts at $50K+/yr. OSS tools (Langfuse, AgentOps) are free but require technical setup. There is no $49-149/mo "managed maintenance for your AI agent" product aimed at SMBs. This is a natural expansion for EasyClaw: "we helped you set up your agent, now we keep it running."

### White-label platforms are a structural threat `P2`

Stammer and Parallel provide white-label infrastructure for agencies. If they add onboarding interviews or automated discovery as a feature, every agency on their platform gets it. This would flood the market with EasyClaw-like functionality at the agency level.

## What We Don't Know
- [ ] Whether any competitor is actively building automated discovery (Klaus, Lindy, Stammer)
- [ ] How sticky the Upgrade layer is — do customers churn after initial setup?
- [ ] Whether Salesforce Agentforce will expand beyond pre-built into customizable agents
- [ ] The real TAM for the $200-$2,000 automated discovery segment
- [ ] Whether the Observability opportunity is big enough to justify building a product

## So What

EasyClaw's positioning is defensible in the short term because no one else automates discovery at this price point. The strategic priority is to build volume in the Upgrade layer (voice interview to setup guide) before competitors close the gap. The Observability layer represents a future revenue stream that would increase LTV and create switching costs — but it is not urgent today.

**Key actions:**
1. Monitor Klaus, Lindy, and Stammer/Parallel for any automated discovery features.
2. Validate the $200-$2,000 price range with early customers.
3. Begin scoping the Observability product ($49-149/mo maintenance) for H2 2026.
