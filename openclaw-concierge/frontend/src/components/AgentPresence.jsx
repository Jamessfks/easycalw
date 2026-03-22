import React from 'react';
import { Mic } from 'lucide-react';

const AVATAR_MAP = {
    'idle': '/agent_listening_avatar.png',
    'user-speaking': '/agent_listening_avatar.png',
    'agent-thinking': '/agent_thinking_avatar.png',
    'agent-speaking': '/agent_talking_avatar.png',
};

const MIC_STYLES = {
    'idle': 'border-gray-500/50',
    'user-speaking': 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)] animate-pulse',
    'agent-thinking': 'border-yellow-400/70 animate-[pulse_1.5s_ease-in-out_infinite]',
    'agent-speaking': 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse',
};

const STATE_LABELS = {
    'idle': 'Ready',
    'user-speaking': 'Listening...',
    'agent-thinking': 'Thinking...',
    'agent-speaking': 'Speaking...',
};

const AgentPresence = ({ voiceState = 'idle' }) => {
    const avatarSrc = AVATAR_MAP[voiceState] || AVATAR_MAP['idle'];
    const micStyle = MIC_STYLES[voiceState] || MIC_STYLES['idle'];
    const stateLabel = STATE_LABELS[voiceState] || '';

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
            {/* Avatar */}
            <div className="relative">
                <img
                    src={avatarSrc}
                    alt="Agent avatar"
                    className="w-64 h-64 object-contain drop-shadow-2xl transition-all duration-300"
                />
            </div>

            {/* Mic circle indicator */}
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${micStyle}`}>
                <Mic
                    size={32}
                    className={
                        voiceState === 'user-speaking' ? 'text-green-400' :
                        voiceState === 'agent-thinking' ? 'text-yellow-400 animate-bounce' :
                        voiceState === 'agent-speaking' ? 'text-cyan-400' :
                        'text-gray-400'
                    }
                />
            </div>

            {/* State label */}
            <p className={`text-sm font-mono tracking-widest uppercase ${
                voiceState === 'user-speaking' ? 'text-green-400' :
                voiceState === 'agent-thinking' ? 'text-yellow-400' :
                voiceState === 'agent-speaking' ? 'text-cyan-400' :
                'text-gray-500'
            }`}>
                {stateLabel}
            </p>
        </div>
    );
};

export default AgentPresence;
