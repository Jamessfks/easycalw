import React from 'react';
import { Mic } from 'lucide-react';

const AVATAR_MAP = {
    'idle': '/agent_listening_avatar.png',
    'user-speaking': '/agent_listening_avatar.png',
    'agent-thinking': '/agent_thinking_avatar.png',
    'agent-speaking': '/agent_talking_avatar.png',
};

const STATE_CONFIG = {
    'idle': {
        label: 'Ready',
        color: 'slate',
        micClass: 'border-white/[0.1] text-slate-500',
        labelClass: 'text-slate-500',
        ringClass: 'border-white/[0.05]',
    },
    'user-speaking': {
        label: 'Listening...',
        color: 'emerald',
        micClass: 'border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.15)]',
        labelClass: 'text-emerald-400',
        ringClass: 'border-emerald-500/20 animate-pulse-ring',
    },
    'agent-thinking': {
        label: 'Thinking...',
        color: 'amber',
        micClass: 'border-amber-500/40 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.1)]',
        labelClass: 'text-amber-400',
        ringClass: 'border-amber-500/20 animate-pulse-ring',
    },
    'agent-speaking': {
        label: 'Speaking...',
        color: 'sky',
        micClass: 'border-sky-500/40 text-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.2)]',
        labelClass: 'text-sky-400',
        ringClass: 'border-sky-500/20 animate-pulse-ring',
    },
};

export default function AgentPresence({ voiceState = 'idle' }) {
    const avatarSrc = AVATAR_MAP[voiceState] || AVATAR_MAP['idle'];
    const cfg = STATE_CONFIG[voiceState] || STATE_CONFIG['idle'];

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-8 relative">
            {/* Avatar with ambient glow */}
            <div className="relative">
                <div className={`absolute -inset-8 rounded-full ${cfg.ringClass}`} style={{ borderWidth: '1px', borderStyle: 'solid' }} />
                <div className={`absolute inset-0 rounded-full blur-[40px] transition-all duration-700 ${
                    voiceState === 'agent-speaking' ? 'bg-sky-500/10' :
                    voiceState === 'user-speaking' ? 'bg-emerald-500/8' :
                    voiceState === 'agent-thinking' ? 'bg-amber-500/6' :
                    'bg-white/[0.02]'
                }`} />
                <img
                    src={avatarSrc}
                    alt="Agent"
                    className="w-52 h-52 md:w-64 md:h-64 object-contain drop-shadow-2xl transition-all duration-500 relative z-10"
                />
            </div>

            {/* Mic indicator */}
            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${cfg.micClass}`}>
                <Mic
                    size={26}
                    className={voiceState === 'agent-thinking' ? 'animate-bounce' : ''}
                />
            </div>

            {/* State label */}
            <p className={`text-xs font-mono tracking-[0.2em] uppercase transition-colors duration-300 ${cfg.labelClass}`}>
                {cfg.label}
            </p>
        </div>
    );
}
