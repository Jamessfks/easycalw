import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';

const Transcript = ({ entries = [] }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries]);

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
                <div className="w-16 h-16 rounded-full bg-surface-2 border border-white/[0.06] flex items-center justify-center">
                    <MessageSquare size={24} className="text-gray-500" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-gray-500 font-display text-center max-w-xs">
                    Start the interview and your conversation will appear here in real time.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-3 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                <p className="section-label">Live Transcript</p>
                <span className="text-[11px] font-mono text-gray-600">
                    {entries.filter(e => e.isFinal).length} messages
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {entries.map((entry, i) => {
                    const isUser = entry.role === 'user';
                    const isPartial = !entry.isFinal;

                    return (
                        <div
                            key={i}
                            className={`flex gap-3 animate-fade-in ${isPartial ? 'opacity-40' : ''}`}
                        >
                            {/* Role indicator */}
                            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold font-mono mt-0.5 ${
                                isUser
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                            }`}>
                                {isUser ? 'U' : 'A'}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className={`text-xs font-display font-semibold ${
                                        isUser ? 'text-emerald-400' : 'text-cyan-400'
                                    }`}>
                                        {isUser ? 'You' : 'Agent'}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-600">
                                        {new Date(entry.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </span>
                                    {isPartial && (
                                        <span className="text-[10px] font-mono text-gray-600 italic">
                                            typing...
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm leading-relaxed ${
                                    isUser ? 'text-gray-200' : 'text-gray-300'
                                } ${isPartial ? 'italic' : ''}`}>
                                    {entry.text}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>
        </div>
    );
};

export default Transcript;
