import React from 'react';
import { Mic, Zap, FileText, Shield, ChevronRight, Volume2, Sparkles, ArrowRight } from 'lucide-react';

const STEPS = [
    {
        icon: Mic,
        title: 'Voice Interview',
        desc: 'Speak naturally with our Vapi-powered concierge. No forms, no friction.',
        accent: 'sky',
    },
    {
        icon: Zap,
        title: 'AI Extraction',
        desc: 'Gemini parses your transcript into a structured setup profile in seconds.',
        accent: 'violet',
    },
    {
        icon: FileText,
        title: 'Setup Guide',
        desc: 'A personalized OPENCLAW_ENGINE_SETUP_GUIDE.md, packaged as a ready-to-use ZIP.',
        accent: 'sky',
    },
];

const FEATURES = [
    { icon: Volume2, label: 'Native Audio', detail: 'Full-duplex voice via Gemini Live' },
    { icon: Shield, label: 'Privacy First', detail: 'Runs on your own infrastructure' },
    { icon: Sparkles, label: 'Smart Defaults', detail: 'Registry-aware skill matching' },
];

export default function EasyClawLanding({ onStartVoice }) {
    return (
        <div className="noise-overlay min-h-screen bg-[var(--ec-bg)] grid-bg relative overflow-hidden">
            {/* Ambient glow orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-sky-500/[0.04] blur-[120px]" />
                <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
                <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-sky-500/[0.03] blur-[140px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🐾</span>
                    <span className="text-lg font-semibold tracking-tight text-white">
                        Easy<span className="text-sky-400">Claw</span>
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <a href="#how" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">How it works</a>
                    <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Features</a>
                    <button
                        onClick={onStartVoice}
                        className="text-sm font-medium px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sky-300 hover:bg-white/[0.1] hover:border-sky-500/30 transition-all"
                    >
                        Launch
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-24 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/[0.08] border border-sky-500/20 text-sky-300 text-xs font-medium mb-8">
                    <Sparkles size={12} />
                    Powered by Vapi + Google ADK
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                    <span className="text-white">Install OpenClaw</span>
                    <br />
                    <span className="text-glow bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent animate-gradient">
                        with your voice.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    No forms. No config files. Just tell our AI concierge what you need,
                    and get a personalized setup guide in seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onStartVoice}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300
                                   bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950
                                   hover:shadow-[0_0_40px_rgba(56,189,248,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Mic size={20} />
                        Start Voice Setup
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    <a
                        href="#how"
                        className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-medium text-sm text-slate-300 border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all"
                    >
                        See how it works
                        <ChevronRight size={14} />
                    </a>
                </div>

                {/* Avatar */}
                <div className="mt-16 md:mt-20 relative mx-auto w-fit">
                    <div className="absolute inset-0 rounded-full bg-sky-500/10 blur-[60px] scale-110" />
                    <div className="relative animate-float">
                        <div className="absolute -inset-4 rounded-full border border-sky-500/20 animate-pulse-ring" />
                        <img
                            src="/listen.png"
                            alt="EasyClaw Concierge"
                            className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover border-2 border-sky-500/30 shadow-[0_0_60px_rgba(56,189,248,0.15)]"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-24">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sky-400/70 mb-3">Process</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Three steps. Zero friction.</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 hover:bg-white/[0.04] hover:border-sky-500/20 transition-all duration-300"
                        >
                            <div className="absolute top-0 left-8 -translate-y-1/2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--ec-bg)] border border-white/[0.1] text-xs font-bold text-slate-500">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </div>

                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                                step.accent === 'violet'
                                    ? 'bg-violet-500/[0.1] text-violet-400'
                                    : 'bg-sky-500/[0.1] text-sky-400'
                            }`}>
                                <step.icon size={22} />
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Architecture strip */}
            <section className="relative z-10 border-y border-white/[0.04] bg-white/[0.01]">
                <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex-1">
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400/70 mb-3">Architecture</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Two agents, one pipeline.</h2>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                Agent 1 conducts a natural voice interview via Vapi,
                                capturing your use-cases, preferred channels, and persona traits.
                                Agent 2 maps your profile to the OpenClaw registry and generates
                                a fully personalized engine setup guide.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Vapi', 'Gemini', 'Google ADK', 'RocketRide'].map((t) => (
                                    <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="rounded-xl border border-white/[0.06] bg-[var(--ec-surface)] p-5 font-mono text-xs space-y-3">
                                <PipelineRow label="VAPI" detail="Voice Interview" color="sky" />
                                <PipelineArrow />
                                <PipelineRow label="INPUT AGENT" detail="Gemini Formatter" color="violet" />
                                <PipelineArrow />
                                <PipelineRow label="OUTPUT AGENT" detail="ADK Batch Runner" color="sky" />
                                <PipelineArrow />
                                <PipelineRow label="GUIDE" detail="SETUP_GUIDE.md" color="emerald" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-24">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sky-400/70 mb-3">Capabilities</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Built for developers.</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {FEATURES.map((f, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-sky-500/20 hover:bg-white/[0.04] transition-all duration-300"
                        >
                            <div className="w-10 h-10 rounded-lg bg-sky-500/[0.08] text-sky-400 flex items-center justify-center mb-4">
                                <f.icon size={18} />
                            </div>
                            <h3 className="font-semibold text-white mb-1">{f.label}</h3>
                            <p className="text-sm text-slate-400">{f.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-24 text-center">
                <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/[0.06] to-transparent p-12 box-glow">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to set up OpenClaw?</h2>
                    <p className="text-slate-400 mb-8">It takes less than two minutes. Just talk.</p>
                    <button
                        onClick={onStartVoice}
                        className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300
                                   bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950
                                   hover:shadow-[0_0_40px_rgba(56,189,248,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Mic size={20} />
                        Start Voice Setup
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.04] px-6 md:px-12 py-8">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>🐾</span>
                        Easy<span className="text-sky-500">Claw</span>
                    </div>
                    <p className="text-xs text-slate-600">OpenClaw Concierge &middot; Vapi + Google ADK</p>
                </div>
            </footer>
        </div>
    );
}

function PipelineRow({ label, detail, color }) {
    const colors = {
        sky: 'border-sky-500/30 text-sky-400 bg-sky-500/[0.06]',
        violet: 'border-violet-500/30 text-violet-400 bg-violet-500/[0.06]',
        emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.06]',
    };
    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${colors[color]}`}>
            <span className="font-semibold tracking-wider text-[10px] uppercase w-28 shrink-0">{label}</span>
            <span className="text-slate-400 text-[11px]">{detail}</span>
        </div>
    );
}

function PipelineArrow() {
    return (
        <div className="flex justify-center">
            <div className="w-px h-4 bg-gradient-to-b from-sky-500/30 to-transparent" />
        </div>
    );
}
