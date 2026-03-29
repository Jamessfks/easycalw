# EasyClaw UI Redesign Prompt — "One-Click Concierge"

> Use this prompt to guide a complete frontend redesign of EasyClaw.
> Targeted at: Claude Code, Cursor, or any AI coding assistant.

---

## Prompt

You are redesigning the EasyClaw frontend — a voice-interview-to-setup-guide web app for OpenClaw. The current frontend is React 18 + Vite + Tailwind CSS with a dark cyber-blue theme. Transform it into an **award-winning, elite yet minimal, one-click-to-go** experience with warm bright colors and a signature 3D interactive element.

### Design Philosophy

Follow the **Vercel/Linear standard** of ruthless simplicity with one twist: warm, inviting color instead of cold monochrome. The UI should feel like a premium concierge — not a dashboard, not a wizard, not a chatbot. Think: "Apple Store meets AI assistant." Every screen should have ONE dominant action and ZERO visual clutter.

### Color System (Science-Backed, 60-30-10 Rule)

Replace the current cyan/blue palette with a warm-bright scheme:

```
// tailwind.config.js extended colors
colors: {
  // 60% — Base surfaces (warm dark, not cold blue-black)
  surface: {
    0: '#0C0A09',    // stone-950 — warm near-black
    1: '#1C1917',    // stone-900
    2: '#292524',    // stone-800
    3: '#44403C',    // stone-700
  },
  // 30% — Secondary / cards / elevated surfaces
  cream: {
    50:  '#FFFBEB',  // warm white
    100: '#FEF3C7',  // soft cream
    200: '#FDE68A',  // light gold
  },
  // 10% — Accent (orange spectrum + complementary)
  accent: {
    primary:   '#F97316',  // orange-500 — main CTA, active states
    hover:     '#EA580C',  // orange-600 — hover/pressed
    soft:      '#FFEDD5',  // orange-100 — badges, subtle highlights
    glow:      '#FB923C',  // orange-400 — ambient glow effects
    secondary: '#8B5CF6',  // violet-500 — complementary accent for contrast
    success:   '#34D399',  // emerald-400 — completion states
    danger:    '#F87171',  // red-400 — errors only
  },
  // Text
  text: {
    primary:   '#FAFAF9',  // stone-50
    secondary: '#A8A29E',  // stone-400
    muted:     '#78716C',  // stone-500
  }
}
```

**Why these colors:** Orange fosters camaraderie and creativity (Crisp research). Warm stone backgrounds feel inviting vs cold blue-black. The 60-30-10 split ensures orange pops without overwhelming. Violet secondary creates complementary contrast per color wheel theory.

### Typography

```
// Two fonts only — clean and modern
fontFamily: {
  display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

Replace Space Grotesk with Plus Jakarta Sans — rounder, warmer, better at small sizes. Keep JetBrains Mono for code blocks.

### Component Redesign Specifications

#### 1. Landing Page (`EasyClawLanding.jsx`) — "The Lobby"

**Layout:** Single full-viewport hero. No scrolling needed to start.

```
┌─────────────────────────────────────────────┐
│  [Logo]                    [View Demo] [?]  │  ← minimal nav
│                                             │
│         ┌──────────────────┐                │
│         │   3D CLAW MODEL  │                │  ← interactive 3D (see §3D below)
│         │   (hover to play)│                │
│         └──────────────────┘                │
│                                             │
│     Set up OpenClaw in 2 minutes.           │  ← single headline
│     Just talk to us.                        │
│                                             │
│        [ 🎙 Start Interview ]               │  ← ONE orange button, pill-shaped
│                                             │
│     "800+ setups generated"  ⭐⭐⭐⭐⭐        │  ← social proof line
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │ ☕  │ │ 🏥  │ │ 💻  │  ... →            │  ← industry chips (horizontal scroll)
│  │Coffee│ │Health│ │DevOps│                  │
│  └─────┘ └─────┘ └─────┘                   │
│                                             │
│         Powered by OpenClaw + Claude        │  ← footer line
└─────────────────────────────────────────────┘
```

**Key changes:**
- Remove "How it works" section, feature grid, demo navigator from initial view
- Industry chips are small, horizontally scrollable, tap to pre-fill context
- The 3D element IS the visual interest — no need for orbiting dots or gradients
- Background: subtle warm gradient `from-surface-0 via-surface-1 to-surface-0` with a faint radial orange glow behind the 3D element
- One CTA button: large pill, `bg-accent-primary hover:bg-accent-hover`, with subtle `shadow-[0_0_40px_rgba(249,115,22,0.3)]` glow

#### 2. Interview View (`InterviewView.jsx`) — "The Conversation"

**Layout:** Centered single-column. The avatar IS the interface.

```
┌─────────────────────────────────────────────┐
│  ← Back                          02:31 ⏱    │
│                                             │
│              ┌──────────┐                   │
│              │  AVATAR   │                   │  ← large, centered, breathing animation
│              │  (state)  │                   │
│              └──────────┘                   │
│           "Listening..."                    │  ← single state label
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ transcript bubble                    │    │  ← minimal transcript, last 2-3 lines
│  │ with gentle fade for older messages  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│         [ End & Generate Guide ]            │  ← appears after 30s
│                                             │
└─────────────────────────────────────────────┘
```

**Key changes:**
- Remove two-panel layout — center everything
- Avatar much larger (w-40 h-40), with Framer Motion `layoutId` for smooth transition from landing
- Waveform replaced with concentric ring pulse (orange glow rings expanding outward)
- Transcript shows only last 3 messages with upward fade-out gradient
- Timer in top-right, minimal
- "End & Generate" button fades in after minimum interview time (use Framer Motion `AnimatePresence`)

#### 3. Loading/Generation Screen (`LoadingScreen.jsx`) — "The Workshop"

**Layout:** Full-screen immersive experience.

```
┌─────────────────────────────────────────────┐
│                                             │
│         ┌──────────────────┐                │
│         │   3D CLAW MODEL  │                │  ← same 3D model, now "building" animation
│         │   (assembling)   │                │
│         └──────────────────┘                │
│                                             │
│     ████████████░░░░  68%                   │  ← thin orange progress bar
│     Reading skill_registry.md...            │  ← current action text
│                                             │
│     ┌──────────────────────────────┐        │
│     │ 📄 Setup Guide      ✅ Done  │        │  ← doc checklist with animated checks
│     │ 📋 Reference Docs   ⏳ ...   │        │
│     │ 💬 Prompts          ○ Queue  │        │
│     └──────────────────────────────┘        │
│                                             │
│     💡 "OpenClaw supports 400+ skills..."   │  ← rotating fun facts
│                                             │
└─────────────────────────────────────────────┘
```

**Key changes:**
- Reuse the 3D claw with a different animation state (assembling/spinning)
- Replace complex quality meter with simple thin progress bar
- Micro-celebration: Lottie confetti burst when each doc completes
- Fun facts ticker stays (it's good), but style as a subtle bottom banner

#### 4. Output Display (`OutputDisplay.jsx`) — "The Deliverable"

**Layout:** Clean document viewer with floating action bar.

```
┌─────────────────────────────────────────────┐
│  ← Back to Home          [📋 Copy] [⬇ ZIP] │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ YOUR OPENCLAW SETUP GUIDE           │    │
│  │ Coffee Shop • 12 skills • 8 min read│    │
│  │ Quality: ████████░░ 82%             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Guide] [References] [Prompts]  ← tabs     │
│  ─────────────────────────────────────────  │
│                                             │
│  ## 1. Initial Setup                        │
│  ...rendered markdown...                    │
│                                             │
│  ┌─ TOC (floating, right edge) ──┐          │
│  │ 1. Initial Setup        ✓     │          │
│  │ 2. Channel Config             │          │
│  │ 3. Skills & Prompts           │          │
│  └───────────────────────────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

**Key changes:**
- Hero summary card: warm gradient `from-accent-primary/10 to-accent-secondary/10` with blur backdrop
- Tabs: underline style (not boxed), accent-primary active color
- TOC: floating pill on right edge, auto-hides on scroll-down, shows on scroll-up
- Prose styling: `prose-stone` base with orange accents for links and callout borders
- Code blocks: warm stone background `bg-stone-900` with orange copy button

### 3D Interactive Element — "The Claw"

**Library:** Spline (`@splinetool/react-spline`) for fastest implementation with visual quality.

**Concept:** A stylized, low-poly lobster claw / robot gripper that:

1. **Landing page:** Floats gently with idle animation. Responds to mouse movement (subtle parallax). On hover, opens/closes playfully. Clicking triggers a wave animation. Warm orange/amber material with subtle metallic sheen.

2. **Interview:** Claw shrinks into the avatar area. During listening, it cups open (receiving). During thinking, fingers tap. During speaking, it gestures. These state changes use Spline events API.

3. **Loading:** Claw "assembles" the guide — picking up document pieces and stacking them. Loop animation synced to progress percentage.

4. **Completion:** Claw presents the finished guide with a flourish, then settles into a small corner mascot.

**Implementation:**

```jsx
// Install: npm install @splinetool/react-spline
import Spline from '@splinetool/react-spline';
import { Suspense, lazy } from 'react';

const SplineScene = lazy(() => import('@splinetool/react-spline'));

function ClawHero({ state = 'idle' }) {
  const onLoad = (splineApp) => {
    // Access Spline API for state-driven animations
    // splineApp.emitEvent('mouseDown', 'claw-body');
  };

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Ambient glow behind */}
      <div className="absolute inset-0 bg-accent-primary/20 rounded-full blur-3xl" />
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
        </div>
      }>
        <SplineScene
          scene="YOUR_SPLINE_SCENE_URL"
          onLoad={onLoad}
          className="w-full h-full"
        />
      </Suspense>
    </div>
  );
}
```

**Alternative if Spline is too heavy:** Use React Three Fiber with a GLTF claw model + `useFrame` for animations. Or use a CSS-only 3D claw with `transform-style: preserve-3d` and `perspective` for a lighter but still impressive effect.

**Fallback for fast load:** Show a 2D animated SVG claw (Lottie) while the 3D scene loads in the background. Swap once ready.

### Animation System

**Install:** `npm install framer-motion`

Use Framer Motion for all page transitions and micro-interactions:

```jsx
// Page transition wrapper
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// Wrap each view
<AnimatePresence mode="wait">
  <motion.div key={phase} variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {renderPhase()}
  </motion.div>
</AnimatePresence>
```

**Micro-celebrations:** Use Lottie for completion confetti. Install `lottie-react` and use a free confetti animation from LottieFiles.

```jsx
import Lottie from 'lottie-react';
import confettiData from './assets/confetti.json';

// Trigger on guide completion
{showConfetti && (
  <div className="fixed inset-0 pointer-events-none z-50">
    <Lottie animationData={confettiData} loop={false} className="w-full h-full" />
  </div>
)}
```

### Button Design

**Primary CTA (the ONE button):**
```jsx
<button className="
  relative px-8 py-4 rounded-full
  bg-accent-primary hover:bg-accent-hover
  text-white font-display font-semibold text-lg
  shadow-[0_0_40px_rgba(249,115,22,0.3)]
  hover:shadow-[0_0_60px_rgba(249,115,22,0.5)]
  hover:scale-105
  active:scale-95
  transition-all duration-200
  group
">
  <span className="flex items-center gap-3">
    <MicIcon className="w-5 h-5 group-hover:animate-pulse" />
    Start Interview
  </span>
</button>
```

**Ghost/Secondary buttons:** `border border-stone-700 text-stone-300 hover:border-accent-primary/50 hover:text-accent-soft rounded-full`

### Glass Card Style

Replace current `.glass` with warmer version:

```css
.glass {
  @apply bg-stone-900/60 backdrop-blur-xl border border-stone-800/50 rounded-2xl;
}
.glass:hover {
  @apply border-accent-primary/30;
}
```

### Custom Scrollbar

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: theme('colors.stone.700'); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: theme('colors.accent.primary'); }
```

### Mobile Responsiveness

- Landing: stack vertically, 3D element scales to `w-48 h-48`
- Interview: already centered, just reduce avatar size
- Output: full-width tabs, TOC becomes a bottom sheet (not modal)
- All touch targets ≥ 44px (WCAG)
- `@media (prefers-reduced-motion: reduce)` — disable 3D, use static SVG claw

### Files to Modify

1. **`tailwind.config.js`** — New color palette, fonts, animations
2. **`index.css`** — Updated glass, button, prose, scrollbar styles
3. **`EasyClawLanding.jsx`** — Complete redesign to single-viewport hero
4. **`InterviewView.jsx`** — Centered single-column layout
5. **`LoadingScreen.jsx`** — Simplified with 3D integration
6. **`OutputDisplay.jsx`** — Clean document viewer
7. **`AgentPresence.jsx`** — Larger avatar with orange ring pulse
8. **`Transcript.jsx`** — Minimal last-3-messages view
9. **`App.jsx`** — Add Framer Motion page transitions
10. **`DemoNavigator.jsx`** — Horizontal chip scroll instead of grid

### New Files to Create

1. **`components/ClawScene.jsx`** — Spline 3D wrapper component
2. **`components/PageTransition.jsx`** — Framer Motion wrapper
3. **`components/Confetti.jsx`** — Lottie celebration overlay
4. **`assets/confetti.json`** — Lottie confetti animation data

### New Dependencies

```bash
npm install framer-motion @splinetool/react-spline lottie-react
```

### Design Tokens Summary

| Token | Value | Usage |
|-------|-------|-------|
| Border radius (cards) | `rounded-2xl` (16px) | All cards, panels |
| Border radius (buttons) | `rounded-full` (999px) | All buttons — pill shape |
| Border radius (chips) | `rounded-xl` (12px) | Tags, badges |
| Shadow (CTA) | `0 0 40px rgba(249,115,22,0.3)` | Primary button glow |
| Shadow (cards) | `0 20px 60px rgba(0,0,0,0.3)` | Elevated surfaces |
| Transition | `duration-200` | Default micro-interaction |
| Transition (page) | `duration-400` | Page enter/exit |
| Font size (hero) | `text-5xl sm:text-6xl` | Main headline |
| Font size (body) | `text-base` (16px) | Default reading |
| Font weight (CTA) | `font-semibold` (600) | Buttons, labels |
| Spacing (section) | `py-16 sm:py-24` | Between major sections |

---

**Execute this redesign by modifying files in order of visual impact: tailwind.config.js → index.css → EasyClawLanding.jsx → InterviewView.jsx → LoadingScreen.jsx → OutputDisplay.jsx. Create the 3D component last since it requires a Spline scene URL.**
