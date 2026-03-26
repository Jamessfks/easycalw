import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import AgentPresence from './components/AgentPresence';
import Transcript from './components/Transcript';

const DEMO_MESSAGES = [
    {
        role: 'user',
        text: "Hi, I'm a real estate agent working solo in Austin, Texas. I handle about 15 listings at a time and I'm drowning in follow-ups, showing schedules, and market reports for my clients.",
    },
    {
        role: 'agent',
        text: "That sounds like a lot to juggle! What tools are you currently using day-to-day?",
    },
    {
        role: 'user',
        text: "I use Gmail for everything, Google Calendar, and a CRM called Follow Up Boss. I also post listings on Zillow and Realtor.com manually.",
    },
    {
        role: 'agent',
        text: "Got it. What would be the most impactful thing an AI agent could help you with?",
    },
    {
        role: 'user',
        text: "Honestly, three things — automating follow-up emails after showings, generating weekly market reports for my active clients, and managing my showing schedule so I stop double-booking.",
    },
    {
        role: 'agent',
        text: "Great use case. What messaging platform would you like your agent to communicate through?",
    },
    {
        role: 'user',
        text: "Telegram. I already use it for quick notes to myself.",
    },
    {
        role: 'agent',
        text: "And what hardware will you be running OpenClaw on?",
    },
    {
        role: 'user',
        text: "I have a Mac Mini sitting on my desk that I barely use. It's always on.",
    },
    {
        role: 'agent',
        text: "What's your comfort level with technology? Are you comfortable with terminal commands?",
    },
    {
        role: 'user',
        text: "I'd say intermediate. I can follow instructions but I don't write code.",
    },
];

const MESSAGE_DELAY_MS = 800;

export default function DemoInterviewView({ onInterviewComplete, onBack }) {
    const [visibleCount, setVisibleCount] = useState(0);
    const [allRevealed, setAllRevealed] = useState(false);
    const timerRef = useRef(null);

    // Build transcript entries matching useVapi shape
    const transcriptEntries = DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => ({
        role: msg.role,
        text: msg.text,
        timestamp: Date.now() - (DEMO_MESSAGES.length - i) * 5000,
        isFinal: true,
    }));

    // Animate messages appearing one by one
    useEffect(() => {
        if (visibleCount < DEMO_MESSAGES.length) {
            timerRef.current = setTimeout(() => {
                setVisibleCount(prev => prev + 1);
            }, MESSAGE_DELAY_MS);
            return () => clearTimeout(timerRef.current);
        } else {
            setAllRevealed(true);
        }
    }, [visibleCount]);

    const handleGenerateGuide = () => {
        const formatted = DEMO_MESSAGES
            .map(msg => `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.text}`)
            .join('\n');
        onInterviewComplete(formatted);
    };

    // Derive a voice state for agent presence display
    const currentMsg = visibleCount > 0 ? DEMO_MESSAGES[visibleCount - 1] : null;
    const voiceState = !currentMsg
        ? 'idle'
        : allRevealed
        ? 'idle'
        : currentMsg.role === 'agent'
        ? 'agent-speaking'
        : 'user-speaking';

    const callStatus = allRevealed ? 'ended' : visibleCount > 0 ? 'active' : 'idle';

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
                                Demo Interview
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`status-badge ${
                        allRevealed
                            ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
                            : visibleCount > 0
                            ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                            : 'border-gray-600/50 text-gray-400 bg-gray-500/10'
                    }`}>
                        {!allRevealed && visibleCount > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {allRevealed ? 'Complete' : visibleCount > 0 ? 'Playing' : 'Demo Mode'}
                    </span>
                </div>
            </header>

            {/* Generate Guide overlay */}
            {allRevealed && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface-0/80 backdrop-blur-md">
                    <div className="text-center animate-fade-up">
                        <div className="w-20 h-20 rounded-full bg-surface-2 border-2 border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
                            <Play size={36} className="text-cyan-400 ml-1" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white mb-3">
                            Demo Interview Complete
                        </h2>
                        <p className="text-gray-400 font-mono text-sm mb-8 max-w-md">
                            This pre-recorded transcript is ready. Generate a personalized setup guide from it.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={handleGenerateGuide}
                                className="btn-primary flex items-center gap-2.5 text-base"
                            >
                                Generate Guide
                                <ArrowRight size={16} />
                            </button>
                            <button onClick={onBack} className="btn-ghost !py-2.5 !px-5 !text-sm">
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Two-panel layout — stacks vertically on mobile */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left — Agent Presence */}
                <div className="w-full md:w-2/5 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.04] bg-surface-0/50 h-48 md:h-auto">
                    <AgentPresence voiceState={voiceState} callStatus={callStatus} />
                </div>

                {/* Right — Transcript */}
                <div className="flex-1 w-full md:w-3/5 bg-surface-1/30">
                    <Transcript entries={transcriptEntries} />
                </div>
            </div>
        </div>
    );
}
