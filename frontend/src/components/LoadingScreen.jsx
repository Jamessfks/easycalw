import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, FileText, BookOpen, Search, Clock, Cpu } from 'lucide-react';

// Fallback stages when no real progress is available (polling mode)
const FALLBACK_STAGES = [
    { icon: Search,    label: 'Reading your interview transcript...', detail: 'Understanding your requirements', progress: 15 },
    { icon: Sparkles,  label: 'Exploring the knowledge base...', detail: 'Matching docs to your use case', progress: 35 },
    { icon: FileText,  label: 'Writing your setup guide...', detail: 'Generating step-by-step instructions', progress: 55 },
    { icon: BookOpen,  label: 'Creating reference documents...', detail: 'Building SOUL.md, config, and skill guides', progress: 75 },
    { icon: Sparkles,  label: 'Generating prompts & final review...', detail: 'Security check + quality validation', progress: 90 },
    { icon: Sparkles,  label: 'Wrapping up...', detail: 'Almost there', progress: 98 },
];

// Fun facts to rotate during the wait
const FUN_FACTS = [
    'Your guide will include skill recommendations from a registry of 435 verified tools',
    'We search through 499 knowledge base documents to find what matters for your setup',
    'The AI reads OpenClaw docs, domain knowledge, and setup guides — all tailored to you',
    'Your guide includes security hardening steps specific to your deployment type',
    'Average guide length: 20,000+ characters of personalized setup instructions',
    'Each guide is unique — no two users get the same recommendations',
];

// Document names to cycle through during "Reading documents..." stage
const DOC_NAMES = [
    'KNOWLEDGE_INDEX.md',
    'skill_registry.md',
    'setup_guides/existing_mac_setup.md',
    'openclaw-docs/docs/channels/telegram.md',
    'domain_knowledge_final/summaries/personal_morning_briefing.md',
    'openclaw-docs/docs/automation/cron-jobs.md',
    'templates/onboarding_guide.md',
    'openclaw-docs/docs/install/macos.md',
    'setup_guides/mac_mini_setup.md',
    'domain_knowledge_final/references/smallbiz_customer_support.md',
    'openclaw-docs/docs/security/THREAT-MODEL-ATLAS.md',
    'skill_registry.md (checking guardrails...)',
];

// Map SSE stage strings to icons
function getStageIcon(stage) {
    if (!stage) return Sparkles;
    const s = stage.toLowerCase();
    if (s.includes('read')) return BookOpen;
    if (s.includes('scan') || s.includes('search') || s.includes('glob')) return Search;
    if (s.includes('writ')) return FileText;
    if (s.includes('process') || s.includes('start')) return Cpu;
    if (s.includes('final')) return Sparkles;
    return Sparkles;
}

function formatElapsed(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
}

function formatTokens(tokens) {
    if (!tokens || tokens === 0) return null;
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}k tokens`;
    return `${tokens} tokens`;
}

function estimateTimeRemaining(turn, maxTurns, elapsedSeconds) {
    if (!turn || turn < 2 || !elapsedSeconds || elapsedSeconds < 5) return null;
    const secsPerTurn = elapsedSeconds / turn;
    const remainingTurns = (maxTurns || 40) - turn;
    if (remainingTurns <= 0) return null;
    const remainingSecs = Math.round(secsPerTurn * remainingTurns);
    if (remainingSecs < 60) return `~${remainingSecs}s remaining`;
    const m = Math.floor(remainingSecs / 60);
    const s = remainingSecs % 60;
    return `~${m}m ${s > 0 ? `${s}s` : ''} remaining`;
}

function DocumentScroller() {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setExiting(true);
            setTimeout(() => {
                setCurrentIdx(prev => (prev + 1) % DOC_NAMES.length);
                setExiting(false);
            }, 300);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 h-6 overflow-hidden mb-4">
            <FileText size={12} className="text-cyan-500/60 shrink-0" />
            <span
                className={`text-xs font-mono text-cyan-400/70 transition-all duration-300 ${
                    exiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                }`}
            >
                Reading: {DOC_NAMES[currentIdx]}
            </span>
        </div>
    );
}

function FactTicker() {
    const [idx, setIdx] = useState(0);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setIdx(prev => (prev + 1) % FUN_FACTS.length);
                setFading(false);
            }, 400);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-sm mx-auto mt-6 h-10 flex items-center justify-center">
            <p
                className={`text-[11px] font-mono text-gray-500 text-center leading-relaxed transition-opacity duration-400 ${
                    fading ? 'opacity-0' : 'opacity-100'
                }`}
            >
                💡 {FUN_FACTS[idx]}
            </p>
        </div>
    );
}

function getTimeEstimateFromElapsed(elapsed) {
    if (elapsed < 60) return 'Estimated time: ~5 minutes';
    if (elapsed < 180) return 'Estimated time: ~4 minutes';
    if (elapsed < 300) return 'Estimated time: ~2 minutes';
    return 'Almost done...';
}

function QualityMeter({ elapsed }) {
    // Smoother curve over ~6 minutes:
    // 0→40% in first 2 min, 40→80% in next 2 min, 80→95% in last 2 min
    let target;
    if (elapsed <= 120) {
        target = (elapsed / 120) * 40;
    } else if (elapsed <= 240) {
        target = 40 + ((elapsed - 120) / 120) * 40;
    } else if (elapsed <= 360) {
        target = 80 + ((elapsed - 240) / 120) * 15;
    } else {
        target = 95;
    }
    const displayPct = Math.round(target);

    return (
        <div className="w-48 mx-auto mt-4">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Quality</span>
                <span className="text-[10px] font-mono text-cyan-400/80">{displayPct}%</span>
            </div>
            <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${target}%`,
                        background: `linear-gradient(90deg, #06b6d4 0%, #3b82f6 ${Math.min(100, target + 20)}%, #8b5cf6 100%)`,
                    }}
                />
            </div>
        </div>
    );
}

const LoadingScreen = ({ progress, isDemo }) => {
    const [fallbackIdx, setFallbackIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [demoProgress, setDemoProgress] = useState(0);

    const hasRealProgress = progress && progress.turn > 0;

    // Demo fast-path: animate from 0→100% in 5 seconds
    useEffect(() => {
        if (!isDemo) return;
        const interval = setInterval(() => {
            setDemoProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100; }
                return prev + 2; // 50 steps × 100ms = 5s
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isDemo]);

    // Fallback timer-based stages (when SSE isn't connected)
    useEffect(() => {
        if (hasRealProgress) return;
        const durations = [4000, 6000, 8000, 6000, 5000, 30000];
        const timer = setTimeout(() => {
            setFallbackIdx(prev => (prev < FALLBACK_STAGES.length - 1 ? prev + 1 : prev));
        }, durations[fallbackIdx]);
        return () => clearTimeout(timer);
    }, [fallbackIdx, hasRealProgress]);

    // Elapsed time counter
    useEffect(() => {
        const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Determine what to display
    let label, detail, progressPct, StageIcon;

    const timeEstimate = hasRealProgress
        ? estimateTimeRemaining(progress.turn, progress.maxTurns, elapsed)
        : null;

    // Show doc scroller during reading/exploring stages (skip in demo mode)
    const showDocScroller = isDemo
        ? false
        : hasRealProgress
            ? (progress.stage || '').toLowerCase().match(/read|scan|search|glob|explor/)
            : fallbackIdx <= 1;

    if (isDemo) {
        // Demo mode: fast animation, no scroller
        label = demoProgress < 100 ? 'Loading demo guide...' : 'Ready!';
        detail = 'Demo mode';
        progressPct = Math.min(demoProgress, 100);
        StageIcon = Sparkles;
    } else if (hasRealProgress) {
        // Real progress from SSE
        const maxTurns = progress.maxTurns || 40;
        const displayTurn = Math.min(progress.turn, maxTurns);
        label = progress.stage || 'Processing...';
        detail = `Turn ${displayTurn}${progress.maxTurns ? ` / ${progress.maxTurns}` : ''}`;
        progressPct = Math.min((progress.turn / maxTurns) * 100, 100);
        StageIcon = getStageIcon(progress.stage);

        const tokenStr = formatTokens(progress.tokens);
        if (tokenStr) {
            detail += ` · ${tokenStr}`;
        }
        if (progress.cost > 0) {
            detail += ` · $${progress.cost.toFixed(3)}`;
        }
    } else {
        // Fallback fake stages
        const stage = FALLBACK_STAGES[fallbackIdx];
        label = stage.label;
        detail = stage.detail;
        progressPct = stage.progress;
        StageIcon = stage.icon;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 text-gray-100 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 grid-bg opacity-20" />
            <div className="ambient-glow bg-cyan-500 top-[30%] left-[40%] opacity-10" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-md px-6 animate-fade-up">
                {/* Spinner */}
                <div className="relative w-28 h-28 mx-auto mb-10">
                    <div className="absolute inset-0 rounded-full border-2 border-white/[0.04]" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin-slow" />
                    <div className="absolute inset-3 rounded-full border-2 border-t-transparent border-r-blue-400 border-b-transparent border-l-transparent animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <StageIcon size={28} className="text-cyan-400" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Stage label */}
                <h2 className="text-xl font-display font-semibold text-white mb-2">
                    {label}
                </h2>
                <p className="text-sm text-gray-500 font-mono mb-4">
                    {detail}
                </p>

                {/* Document scroller */}
                {showDocScroller && (
                    <div className="flex justify-center">
                        <DocumentScroller />
                    </div>
                )}

                {/* Progress bar */}
                <div className="w-64 mx-auto h-1 bg-surface-2 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>

                {/* Quality meter */}
                <QualityMeter elapsed={elapsed} />

                {/* Elapsed-based time estimate (always visible) */}
                <div className="mt-3">
                    <span className="text-[11px] font-mono text-gray-500">
                        {hasRealProgress && timeEstimate ? timeEstimate : getTimeEstimateFromElapsed(elapsed)}
                    </span>
                </div>

                {/* Live indicator + time estimate when SSE is connected */}
                {hasRealProgress && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider">
                                Live
                            </span>
                        </div>
                        {timeEstimate && (
                            <span className="text-[10px] font-mono text-gray-500">
                                {timeEstimate}
                            </span>
                        )}
                    </div>
                )}

                {/* Fallback stage indicators */}
                {!hasRealProgress && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {FALLBACK_STAGES.slice(0, -1).map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                    i === fallbackIdx ? 'bg-cyan-400 scale-125' :
                                    i < fallbackIdx ? 'bg-cyan-400/40' :
                                    'bg-gray-700'
                                }`}
                            />
                        ))}
                    </div>
                )}

                {/* Elapsed time */}
                <div className="flex items-center justify-center gap-1.5 mt-8 text-gray-600">
                    <Clock size={12} />
                    <span className="text-xs font-mono">{formatElapsed(elapsed)}</span>
                </div>

                <p className="text-xs font-mono text-gray-600 mt-3">
                    Building your personalized guide. Please don't close this page.
                </p>

                {/* Fun fact ticker */}
                <FactTicker />
            </div>
        </div>
    );
};

export default LoadingScreen;
