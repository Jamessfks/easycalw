import React, { useState } from 'react';
import { Phone, PhoneOff, ArrowLeft, Activity, CheckCircle, RefreshCw, AlertTriangle, X, Lightbulb } from 'lucide-react';
import useVapi from './useVapi';
import AgentPresence from './components/AgentPresence';
import Transcript from './components/Transcript';

const MIN_TRANSCRIPT_LENGTH = 400;
const MIN_WORD_COUNT = 50;

const TALKING_POINTS = [
    'Name + what your business does',
    'Biggest pain point or what you\'d automate first',
    'Tech comfort — terminal or apps only?',
    'Devices + messaging channel (WhatsApp, Slack, etc.)',
    'Tools you already use (POS, CRM, calendar)',
    'Autonomy: AI checks with you or acts on its own?',
];

function DemoCoachingCard({ visible }) {
    const [dismissed, setDismissed] = useState(false);
    if (!visible || dismissed) return null;

    return (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-30 w-auto sm:w-64 glass rounded-xl border border-amber-500/20 bg-surface-1/90 backdrop-blur-md p-4 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Lightbulb size={14} className="text-amber-400" />
                    <span className="text-xs font-display font-semibold text-amber-300">Demo Script</span>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={12} />
                </button>
            </div>
            <ul className="space-y-1.5">
                {TALKING_POINTS.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] font-mono text-gray-400 leading-relaxed">
                        <span className="text-amber-500/60 mt-0.5 shrink-0">&#x2022;</span>
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function mapErrorMessage(raw) {
    if (!raw) return raw;
    const m = raw.toLowerCase();
    if (m.includes('meeting has ended')) return 'The interview ended unexpectedly. Click Try Again.';
    if (m.includes('ejected') || m.includes('stopped')) return 'Call was stopped.';
    if (m.includes('microphone') || m.includes('audio')) return 'Microphone error. Check your browser permissions.';
    if (m.includes('network') || m.includes('fetch') || m.includes('failed to connect') || m.includes('offline'))
        return 'Network error. Check your connection and try again.';
    return raw;
}

export default function InterviewView({ onInterviewComplete, onBack }) {
    const { callStatus, voiceState, transcript, formattedTranscript, error, startCall, endCall } = useVapi();

    // Check if user said enough (both character and word minimums)
    const userText = transcript
        .filter(e => e.isFinal && e.role === 'user')
        .map(e => e.text)
        .join(' ');
    const userWordCount = userText.trim().split(/\s+/).filter(Boolean).length;
    const isTooShort = callStatus === 'ended' && !error && (userText.length < MIN_TRANSCRIPT_LENGTH || userWordCount < MIN_WORD_COUNT);

    React.useEffect(() => {
        // Only proceed if call ended successfully with enough transcript data
        if (callStatus === 'ended' && !error && !isTooShort && onInterviewComplete) {
            const finalEntries = transcript.filter(e => e.isFinal);
            if (finalEntries.length === 0) return;

            const rawText = finalEntries
                .map(e => `${e.role === 'user' ? 'User' : 'Agent'}: ${e.text}`)
                .join('\n');
            const timer = setTimeout(() => {
                onInterviewComplete(formattedTranscript || rawText);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [callStatus, error, isTooShort, onInterviewComplete, formattedTranscript, transcript]);

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
                        <button
                            onClick={endCall}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-display font-semibold
                                       bg-gradient-to-r from-rose-500/80 to-red-600/80 text-white
                                       transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Activity size={14} className="animate-spin" />
                            Cancel
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

            {/* Error overlay with retry */}
            {error && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-surface-0/90 backdrop-blur-md">
                    <div className="text-center max-w-sm px-6 animate-fade-up">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
                            <PhoneOff size={24} className="text-rose-400" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-white mb-2">
                            Connection Issue
                        </h2>
                        <p className="text-gray-400 text-sm font-mono mb-6">{mapErrorMessage(error)}</p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !text-sm"
                            >
                                <RefreshCw size={14} />
                                Try Again
                            </button>
                            {onBack && (
                                <button onClick={onBack} className="btn-ghost !py-2.5 !px-5 !text-sm">
                                    Back
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Too short — not enough context */}
            {isTooShort && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface-0/90 backdrop-blur-md">
                    <div className="text-center max-w-sm px-6 animate-fade-up">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle size={24} className="text-amber-400" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-white mb-2">
                            Interview Too Brief
                        </h2>
                        <p className="text-gray-400 text-sm mb-3">
                            Your guide quality depends on what you share. For a great personalized setup guide, please describe:
                        </p>
                        <ul className="text-gray-400 text-sm text-left max-w-xs mx-auto mb-6 space-y-1.5">
                            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#x2022;</span> Your industry or what you do</li>
                            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#x2022;</span> What you want OpenClaw to help with</li>
                            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#x2022;</span> Your comfort level with technology</li>
                        </ul>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !text-sm"
                            >
                                <RefreshCw size={14} />
                                Retry
                            </button>
                            {onBack && (
                                <button onClick={onBack} className="btn-ghost !py-2.5 !px-5 !text-sm">
                                    Go Back
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Interview complete overlay */}
            {callStatus === 'ended' && !error && !isTooShort && (
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

            {/* Two-panel layout — stacks vertically on mobile */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left — Agent Presence */}
                <div className="hidden md:block md:w-2/5 border-r border-white/[0.04] bg-surface-0/50">
                    <AgentPresence voiceState={voiceState} callStatus={callStatus} />
                </div>

                {/* Right — Transcript */}
                <div className="flex-1 md:w-3/5 bg-surface-1/30 relative">
                    <Transcript entries={transcript} />
                    <DemoCoachingCard visible={callStatus === 'active'} />
                </div>
            </div>
        </div>
    );
}
