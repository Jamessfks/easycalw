import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import AgentPresence from './components/AgentPresence';
import Transcript from './components/Transcript';

const PERSONAS = [
    {
        id: 'realestate',
        label: 'Real Estate Agent',
        emoji: '🏠',
        messages: [
            { role: 'user', text: "Hi, I'm a real estate agent working solo in Austin, Texas. I handle about 15 listings at a time and I'm drowning in follow-ups, showing schedules, and market reports for my clients." },
            { role: 'agent', text: "That sounds like a lot to juggle! What tools are you currently using day-to-day?" },
            { role: 'user', text: "I use Gmail for everything, Google Calendar, and a CRM called Follow Up Boss. I also post listings on Zillow and Realtor.com manually." },
            { role: 'agent', text: "Got it. What would be the most impactful thing an AI agent could help you with?" },
            { role: 'user', text: "Honestly, three things — automating follow-up emails after showings, generating weekly market reports for my active clients, and managing my showing schedule so I stop double-booking." },
            { role: 'agent', text: "Great use case. What messaging platform would you like your agent to communicate through?" },
            { role: 'user', text: "Telegram. I already use it for quick notes to myself." },
            { role: 'agent', text: "And what hardware will you be running OpenClaw on?" },
            { role: 'user', text: "I have a Mac Mini sitting on my desk that I barely use. It's always on." },
            { role: 'agent', text: "What's your comfort level with technology? Are you comfortable with terminal commands?" },
            { role: 'user', text: "I'd say intermediate. I can follow instructions but I don't write code." },
        ],
    },
    {
        id: 'devops',
        label: 'Developer / DevOps',
        emoji: '💻',
        messages: [
            { role: 'user', text: "Hey, I'm a DevOps engineer at a 30-person startup. We run everything on AWS — ECS, RDS, the works. I spend half my day triaging alerts and reviewing CI/CD pipeline failures." },
            { role: 'agent', text: "Sounds like a lot of context-switching. What's your current toolchain for communication and project tracking?" },
            { role: 'user', text: "Slack for everything, GitHub for code and issues, Linear for project tracking. We use GitHub Actions for CI/CD and Datadog for monitoring." },
            { role: 'agent', text: "Nice stack. What would you want an AI agent to handle first?" },
            { role: 'user', text: "Three things — summarizing Datadog alerts with root-cause suggestions so I stop manually digging through logs, auto-drafting incident postmortems from our Slack threads, and flagging flaky CI tests so devs fix them before merging." },
            { role: 'agent', text: "Makes sense. What messaging channel should the agent use to reach you?" },
            { role: 'user', text: "Slack, definitely. We already have a #ops-alerts channel. The agent should post there and DM me for critical stuff." },
            { role: 'agent', text: "What hardware will you run OpenClaw on?" },
            { role: 'user', text: "I've got a dedicated Ubuntu box in our office rack. It runs Docker and has 32 gigs of RAM. Always on, already SSH-accessible." },
            { role: 'agent', text: "And your comfort level with the terminal and config files?" },
            { role: 'user', text: "Very comfortable. I live in the terminal — vim, tmux, the whole deal. Just point me at a config and I'll wire it up." },
        ],
    },
    {
        id: 'dental',
        label: 'Healthcare / Dental',
        emoji: '🏥',
        messages: [
            { role: 'user', text: "Hi there. I own a small dental practice in Portland — three dentists, two hygienists, front desk staff. We're drowning in appointment reminders and insurance follow-ups." },
            { role: 'agent', text: "I hear that a lot from healthcare practices. What systems are you currently using?" },
            { role: 'user', text: "We use Dentrix for patient records, Google Calendar for scheduling, and honestly a lot of sticky notes. Our front desk calls patients manually for reminders." },
            { role: 'agent', text: "Got it. What would be the biggest time-saver for your practice?" },
            { role: 'user', text: "Automated appointment reminders — text and email, 48 hours and 2 hours before. Also, I'd love help drafting insurance pre-auth letters. And a daily morning summary of the day's schedule with any cancellations flagged." },
            { role: 'agent', text: "That's a solid use case. Any compliance concerns I should know about?" },
            { role: 'user', text: "Yes — HIPAA is non-negotiable. Patient data cannot leave our local network. That's actually why I'm interested in OpenClaw — everything stays on our hardware. No cloud storage of patient info." },
            { role: 'agent', text: "Understood. What messaging platform works best for you?" },
            { role: 'user', text: "Telegram for me personally. But the front desk should get notifications through email — they don't use Telegram." },
            { role: 'agent', text: "And what hardware would you run this on?" },
            { role: 'user', text: "We have a Mac Mini in the back office that runs our backup system. It's always on. I'm not very technical though — I'd need step-by-step instructions." },
        ],
    },
];

// Pick a random persona on mount
const getRandomPersona = () => PERSONAS[Math.floor(Math.random() * PERSONAS.length)];

const MESSAGE_DELAY_MS = 800;

export default function DemoInterviewView({ onInterviewComplete, onBack }) {
    const [persona, setPersona] = useState(() => getRandomPersona());
    const [visibleCount, setVisibleCount] = useState(0);
    const [allRevealed, setAllRevealed] = useState(false);
    const timerRef = useRef(null);

    const DEMO_MESSAGES = persona.messages;

    const switchPersona = (p) => {
        clearTimeout(timerRef.current);
        setPersona(p);
        setVisibleCount(0);
        setAllRevealed(false);
    };

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
    }, [visibleCount, DEMO_MESSAGES.length]);

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

                <div className="flex items-center gap-2">
                    {/* Persona selector */}
                    {PERSONAS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => switchPersona(p)}
                            title={p.label}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer
                                ${persona.id === p.id
                                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                                    : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-white hover:border-white/10'
                                }`}
                        >
                            <span className="mr-1">{p.emoji}</span>
                            <span className="hidden sm:inline">{p.label}</span>
                        </button>
                    ))}
                    <span className={`status-badge ml-1 ${
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
