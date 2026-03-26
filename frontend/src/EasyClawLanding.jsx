import React, { useState } from 'react';
import { Mic, ArrowRight, Sparkles, FileText, Zap, Shield, MessageSquare, Settings, Clock, ExternalLink, RotateCcw, X } from 'lucide-react';
import { getGuideHistory } from './lib/guideHistory';
import { getTranscriptBackup, clearTranscriptBackup } from './lib/transcriptBackup';
import DemoNavigator from './components/DemoNavigator';

const STEPS = [
    {
        icon: Mic,
        label: '01',
        title: 'Voice Interview',
        desc: 'Talk naturally with our AI concierge about your project needs, preferences, and setup requirements.',
        color: 'text-accent-cyan',
        glow: 'bg-cyan-500',
    },
    {
        icon: Sparkles,
        label: '02',
        title: 'AI Processing',
        desc: 'Our agent analyzes your answers and generates a personalized OpenClaw configuration guide.',
        color: 'text-accent-amber',
        glow: 'bg-amber-500',
    },
    {
        icon: FileText,
        label: '03',
        title: 'Setup Guide',
        desc: 'Receive a comprehensive, formatted setup guide with reference docs and ready-to-use prompts.',
        color: 'text-accent-green',
        glow: 'bg-emerald-500',
    },
];

const FEATURES = [
    { icon: Zap, title: 'Instant Setup', desc: 'From voice to config in under 5 minutes' },
    { icon: Shield, title: 'Personalized', desc: 'Tailored to your exact infrastructure' },
    { icon: MessageSquare, title: 'Natural Voice', desc: 'Powered by Vapi conversational AI' },
    { icon: Settings, title: 'Complete Output', desc: 'Guides, reference docs, and prompts' },
];

function RecentGuides() {
    const history = getGuideHistory();
    if (history.length === 0) return null;

    return (
        <section className="max-w-5xl mx-auto px-6 pb-16">
            <div className="text-center mb-6">
                <p className="section-label mb-2">Recent Guides</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
                {history.slice(0, 5).map(entry => (
                    <a
                        key={entry.id}
                        href={`/view/${entry.id}`}
                        className="glass-light rounded-xl px-4 py-3 flex items-center gap-3
                                   hover:border-white/10 transition-all duration-200 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <FileText size={14} className="text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-sm font-display font-medium text-white group-hover:text-cyan-300 transition-colors">
                                {entry.label}
                            </p>
                            <p className="text-[10px] font-mono text-gray-600">
                                {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400 transition-colors ml-1" />
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

    const timeAgo = new Date(backup.savedAt).toLocaleString();

    return (
        <div className="max-w-2xl mx-auto px-6 mt-6">
            <div className="glass rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <RotateCcw size={16} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-display font-medium text-white">
                            Unfinished interview found
                        </p>
                        <p className="text-[11px] font-mono text-gray-500">{timeAgo}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            onResume(backup.formattedTranscript);
                            clearTranscriptBackup();
                        }}
                        className="btn-primary !py-2 !px-4 !text-xs"
                    >
                        Resume → Generate Guide
                    </button>
                    <button
                        onClick={() => {
                            clearTranscriptBackup();
                            setDismissed(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function EasyClawLanding({ onStart, onDemo, onResume, onDemoMode }) {
    return (
        <div className="min-h-screen bg-surface-0 relative overflow-hidden">
            {/* Background grid */}
            <div className="fixed inset-0 grid-bg opacity-50" />

            {/* Ambient glows */}
            <div className="ambient-glow bg-cyan-500 top-[-100px] left-[20%]" />
            <div className="ambient-glow bg-blue-600 bottom-[10%] right-[10%]" />
            <div className="ambient-glow bg-violet-600 top-[40%] left-[-5%] opacity-10" />

            {/* Content */}
            <div className="relative z-10">
                {/* Nav */}
                <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🐾</span>
                        <span className="font-display font-bold text-lg text-white tracking-tight">
                            EasyClaw
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="section-label text-gray-500">
                            Voice-Powered Setup
                        </span>
                    </div>
                </nav>

                {/* Hero */}
                <section className="flex flex-col items-center text-center px-6 pt-16 pb-20 max-w-4xl mx-auto">
                    {/* Tag */}
                    <div className="animate-fade-up opacity-0 mb-8">
                        <span className="status-badge border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            AI Concierge Active
                        </span>
                    </div>

                    {/* Main title */}
                    <h1 className="animate-fade-up opacity-0 delay-100 text-6xl sm:text-7xl font-display font-bold tracking-tight leading-[1.05] mb-2">
                        <span className="text-gradient animate-gradient-x">EasyClaw</span>
                    </h1>
                    <p className="animate-fade-up opacity-0 delay-150 text-sm font-mono text-cyan-400/60 tracking-wide mt-2">
                        Voice interview → Personalized AI setup guide
                    </p>
                    <p className="animate-fade-up opacity-0 delay-200 text-xl sm:text-2xl font-display font-light text-gray-400 mt-4 max-w-2xl leading-relaxed">
                        Install OpenClaw with your voice. One conversation, one personalized setup guide — ready in minutes.
                    </p>

                    {/* CTA */}
                    <div className="animate-fade-up opacity-0 delay-300 mt-10 flex flex-col sm:flex-row items-center gap-4">
                        <button onClick={onStart} className="btn-primary flex items-center gap-2.5 text-base">
                            <Mic size={18} />
                            Start Voice Interview
                            <ArrowRight size={16} className="ml-1" />
                        </button>
                        <button
                            onClick={onDemoMode}
                            className="btn-ghost flex items-center gap-2 text-sm"
                        >
                            <FileText size={16} />
                            Try Demo (No Mic Needed)
                        </button>
                        <a
                            href="#demos"
                            className="text-sm font-display font-medium text-gray-500 hover:text-white transition-colors"
                        >
                            Or explore demo outputs ↓
                        </a>
                    </div>

                    {/* Hero visual — orbiting mic */}
                    <div className="animate-fade-up opacity-0 delay-500 relative mt-20 w-72 h-72 flex items-center justify-center">
                        {/* Outer ring */}
                        <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
                        <div className="absolute inset-4 rounded-full border border-white/[0.06]" />
                        <div className="absolute inset-8 rounded-full border border-cyan-500/10" />

                        {/* Orbiting dot */}
                        <div className="absolute inset-0 animate-orbit">
                            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                        </div>

                        {/* Center avatar */}
                        <div className="relative z-10">
                            <div className="w-28 h-28 rounded-full bg-surface-2 border-2 border-cyan-500/20 flex items-center justify-center shadow-xl shadow-cyan-500/10 animate-float">
                                <img
                                    src="/agent_listening_avatar.png"
                                    alt="AI Agent"
                                    className="w-20 h-20 object-contain"
                                />
                            </div>
                            {/* Pulse ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-pulse-ring" />
                        </div>
                    </div>
                </section>

                {/* Resume bar for dropped interviews */}
                {onResume && <ResumeBar onResume={onResume} />}

                {/* Demo Navigator */}
                <div id="demos">
                    <DemoNavigator onSelectDemo={onDemo} />
                </div>

                {/* How it works */}
                <section className="max-w-5xl mx-auto px-6 pb-24">
                    <div className="text-center mb-14">
                        <p className="section-label mb-3">How it works</p>
                        <h2 className="text-3xl font-display font-bold text-white">
                            Three steps to your setup guide
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map((step, i) => (
                            <div
                                key={step.label}
                                className="card group relative overflow-hidden"
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                {/* Glow dot */}
                                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${step.glow} opacity-60`} />

                                <span className="section-label">{step.label}</span>
                                <div className={`mt-4 mb-3 ${step.color}`}>
                                    <step.icon size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-display font-semibold text-white text-lg mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="max-w-5xl mx-auto px-6 pb-24">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {FEATURES.map((feat, i) => (
                            <div key={feat.title} className="glass-light rounded-xl p-5 text-center group">
                                <feat.icon
                                    size={22}
                                    className="mx-auto text-gray-400 group-hover:text-cyan-400 transition-colors mb-3"
                                    strokeWidth={1.5}
                                />
                                <p className="font-display font-semibold text-sm text-white mb-1">
                                    {feat.title}
                                </p>
                                <p className="text-xs text-gray-500">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Guides */}
                <RecentGuides />

                {/* Bottom CTA */}
                <section className="text-center px-6 pb-20">
                    <button onClick={onStart} className="btn-ghost">
                        Ready to begin? Start your interview →
                    </button>
                </section>
            </div>
        </div>
    );
}
