import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip markdown heading markers, bold/italic/code — keep link text */
function stripMdBasic(text) {
    return text
        .replace(/^#{1,6}\s+/, '')           // ## heading markers
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_{2}([^_]+)_{2}/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim();
}


/** Render a line of text with [label](url) links, raw URLs, and known product names as safe <a> tags */
function InlineText({ text }) {
    const KNOWN_LINKS = {
        OpenClaw: 'https://openclaw.ai',
        Anthropic: 'https://console.anthropic.com',
        Tailscale: 'https://tailscale.com',
        Homebrew: 'https://brew.sh',
        Supabase: 'https://supabase.com',
        Vapi: 'https://vapi.ai',
        GitHub: 'https://github.com',
        docs: 'https://docs.openclaw.ai',
    };

    const linkRe = /(?:\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(https?:\/\/[^\s]+)/g;
    const termRe = new RegExp(`\\b(${Object.keys(KNOWN_LINKS).join('|')})\\b`, 'gi');

    const output = [];
    let last = 0;
    let m;

    const addTextSegment = (segment) => {
        if (!segment) return;
        let fragLast = 0;
        let tm;
        while ((tm = termRe.exec(segment)) !== null) {
            if (tm.index > fragLast) output.push(stripMdBasic(segment.slice(fragLast, tm.index)));
            const key = Object.keys(KNOWN_LINKS).find(k => k.toLowerCase() === tm[1].toLowerCase());
            if (key) {
                output.push(
                    <a
                        key={`term-${tm.index}`}
                        href={KNOWN_LINKS[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-accent-primary hover:text-accent-hover underline underline-offset-2 transition-colors"
                    >
                        {tm[0]}
                        <ExternalLink size={10} className="shrink-0" />
                    </a>
                );
            } else {
                output.push(stripMdBasic(tm[0]));
            }
            fragLast = tm.index + tm[0].length;
        }
        if (fragLast < segment.length) output.push(stripMdBasic(segment.slice(fragLast)));
    };

    while ((m = linkRe.exec(text)) !== null) {
        if (m.index > last) {
            addTextSegment(text.slice(last, m.index));
        }

        const label = m[1] || m[3];
        const href = m[2] || m[3];

        output.push(
            <a
                key={`link-${m.index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-accent-primary hover:text-accent-hover underline underline-offset-2 transition-colors"
            >
                {label}
                <ExternalLink size={10} className="shrink-0" />
            </a>
        );

        last = m.index + m[0].length;
    }

    // Auto-link Amphetamine mentions when no explicit link is provided
    if (output.length === 0 && /amphetamine/i.test(text)) {
        const parts = text.split(/(Amphetamine)/gi);
        return (
            <>{parts.map((part, idx) => {
                if (/^amphetamine$/i.test(part)) {
                    return (
                        <a
                            key={`amphetamine-${idx}`}
                            href="https://apps.apple.com/us/app/amphetamine/id937984704"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-accent-primary hover:text-accent-hover underline underline-offset-2 transition-colors"
                        >
                            {part}
                            <ExternalLink size={10} className="shrink-0" />
                        </a>
                    );
                }
                return stripMdBasic(part);
            })}</>
        );
    }

    if (last < text.length) addTextSegment(text.slice(last));

    return <>{output}</>;
}

/** Score a candidate line — higher = more useful to show */
function lineScore(raw) {
    let s = 0;
    if (/https?:\/\//.test(raw)) s += 4;                          // has a link
    if (/`[^`]+`/.test(raw)) s += 3;                              // has a command
    if (/\[.+\]\(https?/.test(raw)) s += 2;                       // markdown link
    if (/\b(go to|open|click|create|install|run|enter|type|copy|enable|connect|download|sign|set|add|navigate|launch)\b/i.test(raw)) s += 2; // action verb
    if (/\[ \]|\[x\]/i.test(raw)) s += 1;                         // checkbox item
    if (raw.length < 20) s -= 2;                                   // too short
    if (raw.length > 250) s -= 1;                                  // too long
    return s;
}

/**
 * Extract the 4-5 most useful bullets from a section.
 * Prefers lines with links, commands, and clear action verbs.
 */
function extractBullets(lines, max = 5) {
    const candidates = [];

    for (const line of lines) {
        // Skip code fences, table rows, blank lines, pure headings
        const t = line.trim();
        if (!t || t.startsWith('```') || t.startsWith('|') || t.startsWith('#')) continue;

        const m = t.match(/^[-*]\s+(.+)/)
               || t.match(/^\d+\.\s+(.+)/)
               || t.match(/^[-*]\s*\[[ x]\]\s*(.+)/i);  // checkbox
        if (m) {
            const raw = m[1].trim();
            if (raw.length >= 10 && raw.length <= 320) {
                candidates.push({ raw, score: lineScore(raw) });
            }
        }
    }

    // Sort by score descending, then take up to `max`, then restore original order
    const top = candidates
        .map((c, i) => ({ ...c, idx: i }))
        .sort((a, b) => b.score - a.score)
        .slice(0, max)
        .sort((a, b) => a.idx - b.idx);

    return top.map(c => c.raw);
}

// ---------------------------------------------------------------------------
// Guide parser — splits into: keyMoments | preflight | setupSteps
// ---------------------------------------------------------------------------

function parseGuide(content) {
    if (!content) return { keyMoments: null, preflight: null, setupSteps: [] };

    // Split on ## headings
    const chunks = content.split(/^(?=##\s)/m).filter(s => s.trimStart().startsWith('##'));

    let keyMoments = null;
    let preflight = null;
    const setupSteps = [];

    for (const chunk of chunks) {
        const lines = chunk.split('\n');
        const header = lines[0] || '';

        // Key Moments section
        if (/key\s+moments/i.test(header)) {
            keyMoments = {
                title: 'Key Moments',
                bullets: extractBullets(lines.slice(1), 6),
                fullContent: chunk,
            };
            continue;
        }

        // Pre-flight / Checklist / Requirements (## 00 or keyword match)
        const isSection00 = /^##\s+00[\s|]/.test(header);
        const isChecklist = /checklist|pre-?flight|requirement|before\s+you\s+begin/i.test(header);
        if (isSection00 || isChecklist) {
            const titleMatch = header.match(/^##\s+(?:\d+\s*\|\s*)?(.+)/);
            preflight = {
                title: titleMatch ? stripMdBasic(titleMatch[1]) : 'Pre-Flight Checklist',
                bullets: extractBullets(lines.slice(1), 6),
                fullContent: chunk,
            };
            continue;
        }

        // Numbered setup steps (## 01+)
        const numMatch = header.match(/^##\s+(\d+)[\s|]/);
        if (numMatch && parseInt(numMatch[1], 10) >= 1) {
            const titleMatch = header.match(/^##\s+(?:\d+\s*\|\s*)?(.+)/);
            const title = titleMatch ? stripMdBasic(titleMatch[1]) : `Step ${numMatch[1]}`;
            const stepNum = numMatch[1].padStart(2, '0');
            const bullets = extractBullets(lines.slice(1), 5);

            // Fallback: grab first prose lines if no bullets
            if (bullets.length === 0) {
                for (const line of lines.slice(1)) {
                    const t = line.trim();
                    if (t && !t.startsWith('#') && !t.startsWith('```') && !t.startsWith('|') && t.length >= 15) {
                        bullets.push(t);
                        if (bullets.length === 4) break;
                    }
                }
            }

            setupSteps.push({ stepNum, title, bullets, fullContent: chunk });
        }
    }

    return { keyMoments, preflight, setupSteps };
}

// ---------------------------------------------------------------------------
// Top summary card (Key Moments or Pre-Flight)
// ---------------------------------------------------------------------------

function SummaryCard({ data, accentColor = 'primary' }) {
    const accent = {
        primary:   { dot: 'bg-accent-primary/60',   border: 'border-accent-primary/20'   },
        secondary: { dot: 'bg-accent-secondary/60', border: 'border-accent-secondary/20' },
    }[accentColor];

    return (
        <div className={`flex-1 glass rounded-2xl border ${accent.border} flex flex-col overflow-hidden`}>
            <div className="px-6 pt-6 pb-4 border-b border-white/[0.06] text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-1">Overview</p>
                <h3 className="text-2xl font-display font-bold text-white">{data.title}</h3>
            </div>
            <div className="px-6 py-5">
                <ul className="space-y-2.5">
                    {data.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <span className={`mt-2 shrink-0 w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                            <span className="text-sm text-stone-300 leading-relaxed">
                                {stripMdBasic(b)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main StepWizard
// ---------------------------------------------------------------------------

export default function StepWizard({ content }) {
    const { keyMoments, preflight, setupSteps } = useMemo(() => parseGuide(content), [content]);
    const [current, setCurrent] = useState(0);

    const steps = setupSteps;
    if (steps.length === 0 && !keyMoments && !preflight) return null;

    const step = steps[current];
    const isFirst = current === 0;
    const isLast = current === steps.length - 1;
    const go = (delta) => {
        setCurrent(c => c + delta);
    };

    return (
        <div className="flex flex-col gap-8">

            {/* ── Top overview: Key Moments + Pre-Flight side by side ── */}
            {(keyMoments || preflight) && (
                <div className="flex flex-col sm:flex-row gap-4">
                    {keyMoments && <SummaryCard data={keyMoments} accentColor="primary" />}
                    {preflight  && <SummaryCard data={preflight}  accentColor="secondary" />}
                </div>
            )}

            {/* ── Divider ── */}
            {steps.length > 0 && (
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <p className="text-[10px] font-mono uppercase tracking-widest text-accent-primary shrink-0">
                        Step-by-Step Setup
                    </p>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
            )}

            {steps.length > 0 && (
                <>
                    {/* ── Progress ── */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-stone-500 shrink-0">Step {current + 1} of {steps.length}</span>
                        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent-primary rounded-full transition-all duration-500"
                                style={{ width: `${((current + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono text-stone-500 shrink-0">{Math.round(((current + 1) / steps.length) * 100)}%</span>
                    </div>

                    {/* ── Full step detail card ── */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="px-8 pt-8 pb-6 border-b border-white/[0.06]">
                            <div className="flex items-start gap-4">
                                <span className="shrink-0 w-12 h-12 rounded-xl bg-accent-primary/15 border border-accent-primary/25 flex items-center justify-center text-lg font-display font-bold text-accent-primary">
                                    {(current + 1).toString().padStart(2, '0')}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-1">What to do</p>
                                    <h2 className="text-xl font-display font-bold text-white leading-snug">{step.title}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6">
                            <ul className="space-y-3">
                                {step.bullets.map((b, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-[10px] font-mono text-accent-primary">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm text-stone-300 leading-relaxed">
                                            <InlineText text={b} />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* ── Navigation ── */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => go(-1)}
                            disabled={isFirst}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-medium border transition-all duration-200
                                ${isFirst
                                    ? 'opacity-30 cursor-not-allowed border-white/[0.06] text-stone-600'
                                    : 'border-white/[0.10] text-stone-300 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.18]'}`}
                        >
                            <ChevronLeft size={16} />
                            Back
                        </button>

                        <div className="flex items-center gap-1.5">
                            {steps.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`rounded-full transition-all duration-200 ${
                                        i === current ? 'w-6 h-2 bg-accent-primary' : 'w-2 h-2 bg-white/[0.12] hover:bg-white/[0.25]'
                                    }`}
                                    aria-label={`Go to step ${i + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => go(1)}
                            disabled={isLast}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-medium border transition-all duration-200
                                ${isLast
                                    ? 'opacity-30 cursor-not-allowed border-white/[0.06] text-stone-600'
                                    : 'border-accent-primary/30 text-accent-primary hover:text-white hover:bg-accent-primary/10 hover:border-accent-hover/50'}`}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>

                </>
            )}
        </div>
    );
}
