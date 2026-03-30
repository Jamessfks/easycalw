import React from 'react';
import { Mic, MicOff } from 'lucide-react';

const AVATAR_MAP = {
    'idle': '/agent_listening_avatar.png',
    'user-speaking': '/agent_listening_avatar.png',
    'agent-thinking': '/agent_thinking_avatar.png',
    'agent-speaking': '/agent_talking_avatar.png',
};

const STATE_CONFIG = {
    'idle': {
        label: 'Ready',
        color: 'text-stone-400',
        ringColor: 'border-stone-700',
        glowColor: 'shadow-transparent',
        barColor: 'bg-stone-600',
        bgGlow: 'transparent',
    },
    'user-speaking': {
        label: 'Listening',
        color: 'text-emerald-400',
        ringColor: 'border-emerald-400/60',
        glowColor: 'shadow-emerald-400/20',
        barColor: 'bg-emerald-400',
        bgGlow: 'rgba(52,211,153,0.15)',
    },
    'agent-thinking': {
        label: 'Thinking',
        color: 'text-accent-primary',
        ringColor: 'border-accent-primary/50',
        glowColor: 'shadow-accent-primary/20',
        barColor: 'bg-accent-primary',
        bgGlow: 'rgba(249,115,22,0.1)',
    },
    'agent-speaking': {
        label: 'Speaking',
        color: 'text-accent-primary',
        ringColor: 'border-accent-primary/60',
        glowColor: 'shadow-accent-primary/30',
        barColor: 'bg-accent-primary',
        bgGlow: 'rgba(249,115,22,0.15)',
    },
};

const Waveform = ({ active, color }) => (
    <div className="flex items-center gap-[3px] h-6">
        {[0, 1, 2, 3, 4, 3, 2, 1, 0].map((delay, i) => (
            <div
                key={i}
                className={`w-[3px] rounded-full transition-all duration-300 ${color} ${
                    active ? 'animate-waveform' : 'h-1 opacity-30'
                }`}
                style={{
                    animationDelay: active ? `${delay * 100}ms` : '0ms',
                    height: active ? undefined : '4px',
                }}
            />
        ))}
    </div>
);

const AgentPresence = ({ voiceState = 'idle', callStatus = 'idle' }) => {
    const avatarSrc = AVATAR_MAP[voiceState] || AVATAR_MAP['idle'];
    const config = STATE_CONFIG[voiceState] || STATE_CONFIG['idle'];
    const isActive = voiceState === 'user-speaking' || voiceState === 'agent-speaking';

    return (
        <div className="flex flex-col items-center justify-center gap-4 px-4 relative py-4">
            {/* Avatar */}
            <div className="relative">
                {isActive && (
                    <div className="absolute -inset-3 rounded-full border-2 animate-pulse-ring" style={{ borderColor: config.bgGlow }} />
                )}
                <div
                    className={`w-28 h-28 rounded-full bg-surface-2 border-2 ${config.ringColor}
                        flex items-center justify-center shadow-xl ${config.glowColor}
                        transition-all duration-500 ${voiceState === 'agent-speaking' ? 'animate-float' : ''}`}
                >
                    <img src={avatarSrc} alt="AI Agent" className="w-20 h-20 object-contain drop-shadow-lg" />
                </div>
            </div>

            {/* Waveform + label */}
            <Waveform active={isActive} color={config.barColor} />
            <p className={`text-xs font-mono tracking-widest uppercase transition-colors duration-300 ${config.color}`}>
                {callStatus === 'idle' ? 'Press Start' : config.label}
            </p>
        </div>
    );
};

export default AgentPresence;
