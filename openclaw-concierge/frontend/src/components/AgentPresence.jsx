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
        color: 'text-gray-400',
        ringColor: 'border-gray-600/50',
        glowColor: 'shadow-gray-500/0',
        barColor: 'bg-gray-600',
    },
    'user-speaking': {
        label: 'Listening to you',
        color: 'text-emerald-400',
        ringColor: 'border-emerald-400/60',
        glowColor: 'shadow-emerald-400/30',
        barColor: 'bg-emerald-400',
    },
    'agent-thinking': {
        label: 'Processing',
        color: 'text-amber-400',
        ringColor: 'border-amber-400/50',
        glowColor: 'shadow-amber-400/20',
        barColor: 'bg-amber-400',
    },
    'agent-speaking': {
        label: 'Speaking',
        color: 'text-cyan-400',
        ringColor: 'border-cyan-400/60',
        glowColor: 'shadow-cyan-400/30',
        barColor: 'bg-cyan-400',
    },
};

const Waveform = ({ active, color }) => (
    <div className="flex items-center gap-[3px] h-8">
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
        <div className="flex flex-col items-center justify-center h-full gap-8 px-8 relative">
            {/* Ambient glow behind avatar */}
            {isActive && (
                <div className={`absolute w-64 h-64 rounded-full blur-[80px] opacity-20 transition-opacity duration-700 ${
                    voiceState === 'user-speaking' ? 'bg-emerald-500' :
                    voiceState === 'agent-speaking' ? 'bg-cyan-500' :
                    'bg-transparent'
                }`} />
            )}

            {/* Avatar container */}
            <div className="relative">
                {/* Outer pulse ring */}
                {isActive && (
                    <div className={`absolute -inset-4 rounded-full border-2 ${config.ringColor} animate-pulse-ring`} />
                )}

                {/* Avatar */}
                <div className={`w-48 h-48 rounded-full bg-surface-2 border-2 ${config.ringColor}
                    flex items-center justify-center shadow-xl ${config.glowColor}
                    transition-all duration-500 ${voiceState === 'agent-speaking' ? 'animate-float' : ''}`}
                >
                    <img
                        src={avatarSrc}
                        alt="AI Agent"
                        className="w-36 h-36 object-contain drop-shadow-lg transition-transform duration-300"
                    />
                </div>
            </div>

            {/* Waveform */}
            <Waveform active={isActive} color={config.barColor} />

            {/* State label */}
            <div className="text-center">
                <p className={`text-sm font-mono tracking-widest uppercase transition-colors duration-300 ${config.color}`}>
                    {callStatus === 'idle' ? 'Press Start to begin' : config.label}
                </p>
            </div>

            {/* Mic indicator */}
            <div className={`w-14 h-14 rounded-full border-2 ${config.ringColor}
                flex items-center justify-center transition-all duration-300 ${config.glowColor}
                ${voiceState === 'agent-thinking' ? 'animate-pulse' : ''}`}
            >
                {callStatus === 'idle' ? (
                    <MicOff size={22} className="text-gray-500" />
                ) : (
                    <Mic
                        size={22}
                        className={`transition-colors duration-300 ${config.color}`}
                    />
                )}
            </div>
        </div>
    );
};

export default AgentPresence;
