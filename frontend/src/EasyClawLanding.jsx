import React, { useState } from 'react';
import { Mic, ArrowRight, FileText, ExternalLink, RotateCcw, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getGuideHistory } from './lib/guideHistory';
import { getTranscriptBackup, clearTranscriptBackup } from './lib/transcriptBackup';
import ClawScene from './components/ClawScene';
import DemoNavigator from './components/DemoNavigator';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function PreWarmIndicator() {
    const [status, setStatus] = useState('warming');
    React.useEffect(() => {
        let cancelled = false;
        fetch(`${API_BASE}/health`)
            .then(res => { if (!cancelled) setStatus(res.ok ? 'ready' : 'error'); })
            .catch(() => { if (!cancelled) setStatus('error'); });
        return () => { cancelled = true; };
    }, []);

    const config = {
        warming: { color: 'bg-amber-400', ring: 'ring-amber-400/30', label: 'Warming up...' },
        ready:   { color: 'bg-emerald-400', ring: 'ring-emerald-400/30', label: 'Ready' },
        error:   { color: 'bg-stone-500', ring: 'ring-stone-500/30', label: 'Offline' },
    };
    const c = config[status];

    return (
        <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
            <span className={`w-2 h-2 rounded-full ${c.color} ring-2 ${c.ring} ${status === 'warming' ? 'animate-pulse' : ''}`} />
            {c.label}
        </div>
    );
}

const INDUSTRIES = [
    { id: 'restaurant', emoji: '☕', label: 'Coffee / Restaurant' },
    { id: 'healthcare', emoji: '🏥', label: 'Healthcare' },
    { id: 'realestate', emoji: '🏠', label: 'Real Estate' },
    { id: 'developer', emoji: '💻', label: 'Developer' },
    { id: 'freelancer', emoji: '📋', label: 'Freelancer' },
    { id: 'other', emoji: '🎯', label: 'Other' },
];

function RecentGuides() {
    const history = getGuideHistory();
    if (history.length === 0) return null;

    return (
        <section className="max-w-3xl mx-auto px-6 pb-12">
            <p className="section-label mb-3 text-center">Recent Guides</p>
            <div className="flex flex-wrap justify-center gap-2">
                {history.slice(0, 5).map(entry => (
                    <a
                        key={entry.id}
                        href={`/view/${entry.id}`}
                        className="glass-light rounded-full px-4 py-2 flex items-center gap-2
                                   hover:border-accent-primary/30 transition-all duration-200 group text-sm"
                    >
                        <FileText size={12} className="text-accent-primary" />
                        <span className="font-display font-medium text-stone-300 group-hover:text-white transition-colors">
                            {entry.label}
                        </span>
                        <ExternalLink size={10} className="text-stone-600 group-hover:text-stone-400 transition-colors" />
                    </a>
                ))}
            </div>
        </section>
    );
}

function ResumeBar({ onResume }) {
    const [backup, setBackup] = useState(() => getTranscriptBackup());
    const [dismissed, setDismissed] = useState(false);
    if (!backup || !backup.formattedTranscript || dismissed) return null;

    return (
        <div className="max-w-md mx-auto px-6 mt-6">
            <div className="glass rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <RotateCcw size={16} className="text-accent-primary shrink-0" />
                    <div>
                        <p className="text-sm font-display font-medium text-white">Unfinished interview</p>
                        <p className="text-[10px] font-mono text-stone-500">{new Date(backup.savedAt).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { onResume(backup.formattedTranscript); clearTranscriptBackup(); }}
                        className="btn-primary !py-2 !px-4 !text-xs"
                    >
                        Resume
                    </button>
                    <button
                        onClick={() => { clearTranscriptBackup(); setDismissed(true); }}
                        className="p-1.5 rounded-full hover:bg-white/5 text-stone-500 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function EasyClawLanding({ onStart, onDemo, onResume, onDemoMode }) {
    const [selectedIndustry, setSelectedIndustry] = useState(null);

    return (
        <div className="min-h-screen bg-surface-0 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 grid-bg opacity-40" />
            <div className="ambient-glow bg-accent-primary top-[-100px] left-[30%]" />
            <div className="ambient-glow bg-accent-secondary bottom-[10%] right-[15%] opacity-10" />

            <div className="relative z-10">
                {/* Nav — minimal */}
                <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🦞</span>
                        <span className="font-display font-bold text-lg text-white tracking-tight">
                            EasyClaw
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <PreWarmIndicator />
                        <button onClick={onDemoMode} className="btn-ghost !py-1.5 !px-4 !text-xs">
                            Try Demo
                        </button>
                    </div>
                </nav>

                {/* Hero — single viewport, one CTA */}
                <section className="flex flex-col items-center text-center px-6 pt-8 sm:pt-16 pb-12 max-w-3xl mx-auto min-h-[calc(100vh-80px)] justify-center">

                    {/* 3D Claw */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-8"
                    >
                        <ClawScene state="idle" size="lg" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-5xl sm:text-6xl font-display font-extrabold tracking-tight leading-[1.05] mb-3"
                    >
                        <span className="text-gradient">Set up OpenClaw</span>
                        <br />
                        <span className="text-white">in 2 minutes.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        className="text-lg font-display text-stone-400 mt-2 max-w-md leading-relaxed"
                    >
                        Just talk to us. One conversation, one personalized setup guide.
                    </motion.p>

                    {/* Industry chips — horizontal scroll */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                        className="mt-8 w-full max-w-lg"
                    >
                        <p className="text-[10px] font-mono text-stone-600 mb-2.5 tracking-wide uppercase">Pick your industry</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {INDUSTRIES.map((ind) => (
                                <button
                                    key={ind.id}
                                    onClick={() => setSelectedIndustry(selectedIndustry?.id === ind.id ? null : ind)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-display font-medium
                                        border transition-all duration-200 cursor-pointer
                                        ${selectedIndustry?.id === ind.id
                                            ? 'border-accent-primary/50 bg-accent-primary/15 text-accent-soft'
                                            : 'border-stone-800 bg-white/[0.03] text-stone-400 hover:border-stone-700 hover:text-white'
                                        }`}
                                >
                                    <span>{ind.emoji}</span>
                                    <span>{ind.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ONE CTA button */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.5 }}
                        className="mt-8 flex flex-col items-center gap-4"
                    >
                        <button
                            onClick={() => onStart({ industry: selectedIndustry?.id === 'other' ? null : selectedIndustry?.id })}
                            className="relative px-10 py-4 rounded-full
                                bg-accent-primary hover:bg-accent-hover
                                text-white font-display font-semibold text-lg
                                shadow-[0_0_40px_rgba(249,115,22,0.3)]
                                hover:shadow-[0_0_60px_rgba(249,115,22,0.5)]
                                hover:scale-105 active:scale-95
                                transition-all duration-200
                                flex items-center gap-3 group"
                        >
                            <Mic size={20} className="group-hover:animate-pulse" />
                            Start Interview
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={onDemoMode}
                            className="text-sm font-display text-stone-500 hover:text-accent-soft transition-colors"
                        >
                            No mic? Try the demo →
                        </button>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="mt-8 flex items-center justify-center gap-3 text-[12px] font-mono text-stone-600"
                    >
                        <span>🎙️ 2 min talk</span>
                        <span className="text-stone-700">→</span>
                        <span>🤖 500+ docs analyzed</span>
                        <span className="text-stone-700">→</span>
                        <span>📋 Your setup guide</span>
                    </motion.div>
                </section>

                {/* Resume bar */}
                {onResume && <ResumeBar onResume={onResume} />}

                {/* Recent Guides */}
                <RecentGuides />

                {/* Demo Navigator — below the fold */}
                <div id="demos">
                    <DemoNavigator onSelectDemo={onDemo} />
                </div>

                {/* Footer */}
                <footer className="text-center py-10">
                    <p className="text-[11px] font-mono text-stone-700">
                        Powered by OpenClaw + Claude
                    </p>
                </footer>
            </div>
        </div>
    );
}
