import React, { useState } from 'react';
import { Phone, PhoneOff, ArrowLeft, Activity, CheckCircle, RefreshCw, AlertTriangle, X, Lightbulb, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useVapi from './useVapi';
import AgentPresence from './components/AgentPresence';
import Transcript from './components/Transcript';

const MIN_TRANSCRIPT_LENGTH = 100;
const MIN_WORD_COUNT = 15;

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-30 w-auto sm:w-60 glass rounded-2xl border border-accent-primary/20 p-4"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Lightbulb size={14} className="text-accent-primary" />
                    <span className="text-xs font-display font-semibold text-accent-soft">Talking Points</span>
                </div>
                <button onClick={() => setDismissed(true)} className="p-1 rounded-full hover:bg-white/10 text-stone-500 hover:text-white transition-colors">
                    <X size={12} />
                </button>
            </div>
            <ul className="space-y-1.5">
                {TALKING_POINTS.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] font-mono text-stone-400 leading-relaxed">
                        <span className="text-accent-primary/60 mt-0.5 shrink-0">&#x2022;</span>
                        {point}
                    </li>
                ))}
            </ul>
        </motion.div>
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

function OverlayScreen({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-surface-0/90 backdrop-blur-md"
        >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm px-6">
                {children}
            </motion.div>
        </motion.div>
    );
}

export default function InterviewView({ onInterviewComplete, onBack }) {
    const { callStatus, voiceState, transcript, formattedTranscript, error, startCall, endCall } = useVapi();
    const [elapsed, setElapsed] = useState(0);

    const userText = transcript.filter(e => e.isFinal && e.role === 'user').map(e => e.text).join(' ');
    const userWordCount = userText.trim().split(/\s+/).filter(Boolean).length;
    const isTooShort = callStatus === 'ended' && !error && (userText.length < MIN_TRANSCRIPT_LENGTH || userWordCount < MIN_WORD_COUNT);

    // Timer
    React.useEffect(() => {
        if (callStatus !== 'active') return;
        const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [callStatus]);

    React.useEffect(() => {
        if (callStatus === 'ended' && !error && !isTooShort && onInterviewComplete) {
            const finalEntries = transcript.filter(e => e.isFinal);
            if (finalEntries.length === 0) return;
            if (formattedTranscript) {
                const timer = setTimeout(() => onInterviewComplete(formattedTranscript), 1500);
                return () => clearTimeout(timer);
            }
            const rawText = finalEntries.map(e => `${e.role === 'user' ? 'User' : 'Agent'}: ${e.text}`).join('\n');
            const fallback = setTimeout(() => onInterviewComplete(rawText), 8000);
            return () => clearTimeout(fallback);
        }
    }, [callStatus, error, isTooShort, onInterviewComplete, formattedTranscript, transcript]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="w-screen h-screen bg-surface-0 text-stone-100 flex flex-col overflow-hidden relative">
            <div className="fixed inset-0 grid-bg opacity-20" />
            <div className="ambient-glow bg-accent-primary top-[-50px] right-[20%] opacity-10" />

            {/* Header */}
            <header className="relative z-20 h-14 border-b border-white/[0.06] glass flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 transition-colors text-stone-400 hover:text-white">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <span className="font-display font-semibold text-white text-sm">Voice Interview</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Timer */}
                    {callStatus === 'active' && (
                        <span className="flex items-center gap-1.5 text-xs font-mono text-stone-400">
                            <Clock size={12} />
                            {formatTime(elapsed)}
                        </span>
                    )}

                    {/* Status badge */}
                    {callStatus === 'active' && (
                        <span className="status-badge border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                        </span>
                    )}

                    {/* Controls */}
                    {callStatus === 'idle' && (
                        <button onClick={startCall} className="btn-primary flex items-center gap-2 !py-2 !px-5 !text-sm">
                            <Phone size={14} /> Start
                        </button>
                    )}
                    {callStatus === 'connecting' && (
                        <button onClick={endCall}
                            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-display font-semibold bg-stone-700 text-white transition-all hover:bg-stone-600">
                            <Activity size={14} className="animate-spin" /> Cancel
                        </button>
                    )}
                    {callStatus === 'active' && (
                        <button onClick={endCall}
                            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-display font-semibold
                                bg-red-500/90 text-white hover:bg-red-500 transition-all duration-200">
                            <PhoneOff size={14} /> End & Generate
                        </button>
                    )}
                </div>
            </header>

            {/* Error overlay */}
            {error && (
                <OverlayScreen>
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                        <PhoneOff size={24} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white mb-2">Connection Issue</h2>
                    <p className="text-stone-400 text-sm font-mono mb-6">{mapErrorMessage(error)}</p>
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={() => window.location.reload()} className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !text-sm">
                            <RefreshCw size={14} /> Try Again
                        </button>
                        {onBack && <button onClick={onBack} className="btn-ghost !py-2.5 !px-5 !text-sm">Back</button>}
                    </div>
                </OverlayScreen>
            )}

            {/* Too short */}
            {isTooShort && (
                <OverlayScreen>
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle size={24} className="text-amber-400" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white mb-2">Too Brief</h2>
                    <p className="text-stone-400 text-sm mb-4">Tell us more about your business, what you want to automate, and your tech comfort level.</p>
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={() => window.location.reload()} className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !text-sm">
                            <RefreshCw size={14} /> Retry
                        </button>
                        {onBack && <button onClick={onBack} className="btn-ghost !py-2.5 !px-5 !text-sm">Back</button>}
                    </div>
                </OverlayScreen>
            )}

            {/* Complete overlay */}
            {callStatus === 'ended' && !error && !isTooShort && (
                <OverlayScreen>
                    <div className="w-20 h-20 rounded-full bg-accent-primary/10 border-2 border-accent-primary/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={36} className="text-accent-primary" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white mb-3">Interview Complete</h2>
                    <p className="text-stone-400 font-mono text-sm">Preparing your setup guide...</p>
                </OverlayScreen>
            )}

            {/* Main layout — centered */}
            <div className="relative z-10 flex-1 flex flex-col items-center overflow-hidden">
                {/* Agent presence — centered, larger */}
                <div className="w-full max-w-sm pt-6 pb-2 shrink-0">
                    <AgentPresence voiceState={voiceState} callStatus={callStatus} />
                </div>

                {/* Transcript — below, with fade */}
                <div className="flex-1 w-full max-w-2xl relative overflow-hidden">
                    {/* Top fade gradient */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-surface-0 to-transparent z-10 pointer-events-none" />
                    <Transcript entries={transcript} />
                    <AnimatePresence>
                        <DemoCoachingCard visible={callStatus === 'active'} />
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
