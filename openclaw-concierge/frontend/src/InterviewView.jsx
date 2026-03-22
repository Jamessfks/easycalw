import React from 'react';
import { Phone, PhoneOff, ArrowLeft, Activity, CheckCircle } from 'lucide-react';
import useVapi from './useVapi';
import AgentPresence from './components/AgentPresence';
import Transcript from './components/Transcript';

export default function InterviewView({ onInterviewComplete, onBack }) {
    const { callStatus, voiceState, transcript, formattedTranscript, startCall, endCall } = useVapi();

    React.useEffect(() => {
        if (callStatus === 'ended' && onInterviewComplete) {
            const rawText = transcript
                .filter(e => e.isFinal)
                .map(e => `${e.role === 'user' ? 'User' : 'Agent'}: ${e.text}`)
                .join('\n');
            const timer = setTimeout(() => {
                onInterviewComplete(formattedTranscript || rawText);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [callStatus, onInterviewComplete, formattedTranscript, transcript]);

    const statusConfig = {
        idle: { label: 'Ready', cls: 'border-gray-600/50 text-gray-400 bg-gray-500/10' },
        connecting: { label: 'Connecting', cls: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
        active: { label: 'Live', cls: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
        ended: { label: 'Complete', cls: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' },
    };
    const status = statusConfig[callStatus] || statusConfig.idle;

    return (
        <div className="w-screen h-screen bg-surface-0 text-gray-100 flex flex-col overflow-hidden relative">
            {/* Background */}
            <div className="fixed inset-0 grid-bg opacity-30" />
            <div className="ambient-glow bg-cyan-500 top-[-50px] right-[20%] opacity-10" />

            {/* Header */}
            <header className="relative z-20 h-16 border-b border-white/[0.06] glass flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🐾</span>
                        <div>
                            <p className="section-label leading-none mb-0.5">EasyClaw</p>
                            <p className="text-sm font-display font-semibold text-white leading-none">
                                Voice Interview
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <span className={`status-badge ${status.cls}`}>
                        {callStatus === 'active' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {callStatus === 'ended' && <CheckCircle size={12} />}
                        {status.label}
                    </span>

                    {/* Call controls */}
                    {callStatus === 'idle' && (
                        <button onClick={startCall} className="btn-primary flex items-center gap-2 !py-2 !px-5 !text-sm">
                            <Phone size={14} />
                            Start
                        </button>
                    )}
                    {callStatus === 'connecting' && (
                        <button disabled className="btn-primary flex items-center gap-2 !py-2 !px-5 !text-sm opacity-60 cursor-wait">
                            <Activity size={14} className="animate-spin" />
                            Connecting
                        </button>
                    )}
                    {callStatus === 'active' && (
                        <button
                            onClick={endCall}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-display font-semibold
                                       bg-gradient-to-r from-rose-500 to-red-600 text-white
                                       shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30
                                       transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <PhoneOff size={14} />
                            End
                        </button>
                    )}
                </div>
            </header>

            {/* Interview complete overlay */}
            {callStatus === 'ended' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface-0/90 backdrop-blur-md">
                    <div className="text-center animate-fade-up">
                        <div className="w-20 h-20 rounded-full bg-surface-2 border-2 border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={36} className="text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white mb-3">
                            Interview Complete
                        </h2>
                        <p className="text-gray-400 font-mono text-sm">
                            Preparing your setup guide...
                        </p>
                    </div>
                </div>
            )}

            {/* Two-panel layout */}
            <div className="relative z-10 flex-1 flex overflow-hidden">
                {/* Left — Agent Presence */}
                <div className="w-2/5 border-r border-white/[0.04] bg-surface-0/50">
                    <AgentPresence voiceState={voiceState} callStatus={callStatus} />
                </div>

                {/* Right — Transcript */}
                <div className="w-3/5 bg-surface-1/30">
                    <Transcript entries={transcript} />
                </div>
            </div>
        </div>
    );
}
