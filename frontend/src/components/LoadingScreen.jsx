import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, BookOpen, Search, Clock, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ClawScene from './ClawScene';

const FALLBACK_STAGES = [
    { icon: Search,    label: 'Reading your transcript...', detail: 'Understanding your needs', progress: 15 },
    { icon: Sparkles,  label: 'Exploring the knowledge base...', detail: 'Matching docs to your use case', progress: 35 },
    { icon: FileText,  label: 'Writing your setup guide...', detail: 'Generating step-by-step instructions', progress: 55 },
    { icon: BookOpen,  label: 'Creating reference documents...', detail: 'Building config and skill guides', progress: 75 },
    { icon: Sparkles,  label: 'Final review...', detail: 'Security check + quality validation', progress: 90 },
    { icon: Sparkles,  label: 'Wrapping up...', detail: 'Almost there', progress: 98 },
];

const FUN_FACTS = [
    'Your guide draws from a registry of 435 verified skills',
    'We search 499 knowledge base documents tailored to you',
    'Each guide includes security hardening for your deployment',
    'Average guide: 20,000+ characters of personalized instructions',
    'No two users get the same recommendations',
];

const DOC_NAMES = [
    'KNOWLEDGE_INDEX.md', 'skill_registry.md', 'setup_guides/existing_mac_setup.md',
    'openclaw-docs/docs/channels/telegram.md', 'openclaw-docs/docs/automation/cron-jobs.md',
    'templates/onboarding_guide.md', 'openclaw-docs/docs/install/macos.md',
    'openclaw-docs/docs/security/THREAT-MODEL-ATLAS.md',
];

function getStageIcon(stage) {
    if (!stage) return Sparkles;
    const s = stage.toLowerCase();
    if (s.includes('read')) return BookOpen;
    if (s.includes('scan') || s.includes('search') || s.includes('glob')) return Search;
    if (s.includes('writ')) return FileText;
    if (s.includes('process') || s.includes('start')) return Cpu;
    return Sparkles;
}

function formatElapsed(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m === 0 ? `${s}s` : `${m}m ${s}s`;
}

function formatTokens(tokens) {
    if (!tokens || tokens === 0) return null;
    return tokens > 1000 ? `${(tokens / 1000).toFixed(1)}k tokens` : `${tokens} tokens`;
}

function estimateTimeRemaining(turn, maxTurns, elapsedSeconds) {
    if (!turn || turn < 2 || !elapsedSeconds || elapsedSeconds < 5) return null;
    const remainingTurns = (maxTurns || 40) - turn;
    if (remainingTurns <= 0) return null;
    const remainingSecs = Math.round((elapsedSeconds / turn) * remainingTurns);
    if (remainingSecs < 60) return `~${remainingSecs}s remaining`;
    return `~${Math.floor(remainingSecs / 60)}m remaining`;
}

const DOC_LABELS = {
    setup_guide: 'Setup Guide',
    prompts: 'System Prompts',
    reference_docs: 'Reference Docs',
};

function DocChecklist({ docStatuses, selectedOutputs }) {
    const docs = selectedOutputs || ['setup_guide', 'prompts', 'reference_docs'];
    if (!docStatuses || Object.keys(docStatuses).length === 0) return null;

    return (
        <div className="w-56 mx-auto mt-6 text-left space-y-2.5">
            {docs.map((doc) => {
                const info = docStatuses[doc];
                const label = DOC_LABELS[doc] || doc;
                let icon, statusText, color;

                if (info?.status === 'complete') {
                    icon = <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />;
                    const chars = info.chars ? `${(info.chars / 1000).toFixed(0)}k` : '';
                    statusText = <span className="text-emerald-400/70">{chars ? `(${chars})` : ''} done</span>;
                    color = 'text-emerald-300';
                } else if (info?.status === 'writing') {
                    icon = <Loader2 size={14} className="text-accent-primary animate-spin shrink-0" />;
                    statusText = <span className="text-accent-primary/70">generating...</span>;
                    color = 'text-accent-soft';
                } else {
                    icon = <span className="text-stone-600 shrink-0 text-xs">○</span>;
                    statusText = <span className="text-stone-600">queued</span>;
                    color = 'text-stone-500';
                }

                return (
                    <div key={doc} className="flex items-center gap-2">
                        {icon}
                        <span className={`text-xs font-mono ${color}`}>{label}</span>
                        <span className="text-[10px] font-mono ml-auto">{statusText}</span>
                    </div>
                );
            })}
        </div>
    );
}

const LoadingScreen = ({ progress, isDemo }) => {
    const [fallbackIdx, setFallbackIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [demoProgress, setDemoProgress] = useState(0);
    const [factIdx, setFactIdx] = useState(0);
    const [docIdx, setDocIdx] = useState(0);

    const hasRealProgress = progress && progress.turn > 0;

    // Demo fast-path
    useEffect(() => {
        if (!isDemo) return;
        const interval = setInterval(() => {
            setDemoProgress(prev => { if (prev >= 100) { clearInterval(interval); return 100; } return prev + 2; });
        }, 100);
        return () => clearInterval(interval);
    }, [isDemo]);

    // Fallback stages
    useEffect(() => {
        if (hasRealProgress) return;
        const durations = [4000, 6000, 8000, 6000, 5000, 30000];
        const timer = setTimeout(() => setFallbackIdx(prev => Math.min(prev + 1, FALLBACK_STAGES.length - 1)), durations[fallbackIdx]);
        return () => clearTimeout(timer);
    }, [fallbackIdx, hasRealProgress]);

    // Elapsed counter
    useEffect(() => {
        const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fun fact ticker
    useEffect(() => {
        const timer = setInterval(() => setFactIdx(prev => (prev + 1) % FUN_FACTS.length), 12000);
        return () => clearInterval(timer);
    }, []);

    // Doc scroller
    useEffect(() => {
        const timer = setInterval(() => setDocIdx(prev => (prev + 1) % DOC_NAMES.length), 1500);
        return () => clearInterval(timer);
    }, []);

    let label, detail, progressPct;
    const timeEstimate = hasRealProgress ? estimateTimeRemaining(progress.turn, progress.maxTurns, elapsed) : null;
    const showDocScroller = isDemo ? false : hasRealProgress ? (progress.stage || '').toLowerCase().match(/read|scan|search|glob|explor/) : fallbackIdx <= 1;

    if (isDemo) {
        label = demoProgress < 100 ? 'Loading demo guide...' : 'Ready!';
        detail = 'Demo mode';
        progressPct = Math.min(demoProgress, 100);
    } else if (hasRealProgress) {
        const maxTurns = progress.maxTurns || 40;
        label = progress.stage || 'Processing...';
        detail = `Turn ${Math.min(progress.turn, maxTurns)}${progress.maxTurns ? ` / ${progress.maxTurns}` : ''}`;
        progressPct = Math.min((progress.turn / maxTurns) * 100, 100);
        const tokenStr = formatTokens(progress.tokens);
        if (tokenStr) detail += ` · ${tokenStr}`;
        if (progress.cost > 0) detail += ` · $${progress.cost.toFixed(3)}`;
    } else {
        const stage = FALLBACK_STAGES[fallbackIdx];
        label = stage.label;
        detail = stage.detail;
        progressPct = stage.progress;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 text-stone-100 relative overflow-hidden">
            <div className="fixed inset-0 grid-bg opacity-15" />
            <div className="ambient-glow bg-accent-primary top-[30%] left-[40%] opacity-15" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center max-w-md px-6"
            >
                {/* 3D Claw — building state */}
                <div className="mb-8">
                    <ClawScene state="building" size="md" />
                </div>

                {/* Stage label */}
                <h2 className="text-lg font-display font-semibold text-white mb-1">{label}</h2>
                <p className="text-sm text-stone-500 font-mono mb-4">{detail}</p>

                {/* Doc scroller */}
                {showDocScroller && (
                    <div className="flex items-center justify-center gap-2 h-5 mb-3">
                        <FileText size={11} className="text-accent-primary/50 shrink-0" />
                        <span className="text-[11px] font-mono text-accent-primary/60 transition-all duration-300">
                            Reading: {DOC_NAMES[docIdx]}
                        </span>
                    </div>
                )}

                {/* Progress bar — thin, orange */}
                <div className="w-64 mx-auto h-1 bg-surface-2 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${progressPct}%`,
                            background: 'linear-gradient(90deg, #F97316, #FB923C, #FBBF24)',
                        }}
                    />
                </div>

                {/* Doc checklist */}
                {hasRealProgress && progress.docStatuses && (
                    <DocChecklist docStatuses={progress.docStatuses} />
                )}

                {/* Time + live indicator */}
                <div className="flex items-center justify-center gap-3 mt-4">
                    {hasRealProgress && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider">Live</span>
                        </div>
                    )}
                    {(hasRealProgress && timeEstimate) && (
                        <span className="text-[10px] font-mono text-stone-500">{timeEstimate}</span>
                    )}
                </div>

                {/* Elapsed */}
                <div className="flex items-center justify-center gap-1.5 mt-6 text-stone-600">
                    <Clock size={12} />
                    <span className="text-xs font-mono">{formatElapsed(elapsed)}</span>
                </div>

                <p className="text-xs font-mono text-stone-600 mt-2">Please don't close this page.</p>

                {/* Fun fact */}
                <div className="max-w-xs mx-auto mt-6 h-8 flex items-center justify-center">
                    <p className="text-[11px] font-mono text-stone-600 text-center leading-relaxed transition-opacity duration-500">
                        💡 {FUN_FACTS[factIdx]}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
