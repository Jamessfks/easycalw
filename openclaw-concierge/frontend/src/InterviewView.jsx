import React from 'react';
import { Phone, PhoneOff, Activity, ArrowLeft } from 'lucide-react';
import useVapi from './useVapi';
import AgentPresence from './components/AgentPresence';
import Transcript from './components/Transcript';

export default function InterviewView({ onBack, onInterviewComplete }) {
    const { callStatus, voiceState, transcript, startCall, endCall } = useVapi();

    React.useEffect(() => {
        if (callStatus === 'ended' && onInterviewComplete) {
            const timer = setTimeout(() => onInterviewComplete(), 2500);
            return () => clearTimeout(timer);
        }
    }, [callStatus, onInterviewComplete]);

    return (
        <div className="w-screen h-screen bg-[var(--ec-bg)] text-slate-200 flex flex-col overflow-hidden grid-bg noise-overlay">
            {/* Header */}
            <header className="h-14 border-b border-white/[0.06] bg-[var(--ec-surface)]/80 flex items-center justify-between px-5 backdrop-blur-md shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm"
                    >
                        <ArrowLeft size={14} />
                    </button>
                    <span className="text-lg">🐾</span>
                    <div>
                        <h1 className="text-sm font-semibold text-white tracking-tight">
                            Easy<span className="text-sky-400">Claw</span>
                            <span className="text-slate-500 font-normal ml-2 text-xs">Voice Interview</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide ${
                        callStatus === 'active'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : callStatus === 'connecting'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            : callStatus === 'ended'
                            ? 'bg-violet-500/10 border border-violet-500/30 text-violet-400'
                            : 'bg-white/[0.03] border border-white/[0.08] text-slate-500'
                    }`}>
                        {callStatus.toUpperCase()}
                    </div>

                    {callStatus === 'idle' && (
                        <button
                            onClick={startCall}
                            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-all hover:shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Phone size={14} />
                            Start Interview
                        </button>
                    )}

                    {callStatus === 'connecting' && (
                        <button disabled className="flex items-center gap-2 px-5 py-2 bg-amber-500/15 border border-amber-500/25 text-amber-300 font-semibold rounded-lg text-sm cursor-wait">
                            <Activity size={14} className="animate-spin" />
                            Connecting...
                        </button>
                    )}

                    {callStatus === 'active' && (
                        <button
                            onClick={endCall}
                            className="flex items-center gap-2 px-5 py-2 bg-red-500/15 border border-red-500/30 text-red-300 font-semibold rounded-lg text-sm transition-all hover:bg-red-500/25"
                        >
                            <PhoneOff size={14} />
                            End Interview
                        </button>
                    )}
                </div>
            </header>

            {/* Interview complete overlay */}
            {callStatus === 'ended' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--ec-bg)]/90 backdrop-blur-md">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/25 flex items-center justify-center mx-auto mb-6">
                            <Activity size={28} className="text-sky-400 animate-spin" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">
                            Interview Complete
                        </h2>
                        <p className="text-slate-400 text-sm font-mono">
                            Generating your setup guide...
                        </p>
                    </div>
                </div>
            )}

            {/* Two-panel layout */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left — Agent Presence */}
                <div className="w-2/5 border-r border-white/[0.06] bg-[var(--ec-surface)]/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/[0.02] to-transparent pointer-events-none" />
                    <AgentPresence voiceState={voiceState} />
                </div>

                {/* Right — Transcript */}
                <div className="w-3/5 bg-[var(--ec-bg)]">
                    <Transcript entries={transcript} />
                </div>
            </div>
        </div>
    );
}
