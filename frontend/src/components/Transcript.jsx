import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Copy, Check } from 'lucide-react';

const Transcript = ({ entries = [] }) => {
    const endRef = useRef(null);
    const [copied, setCopied] = useState(false);

    const handleCopyTranscript = () => {
        const text = entries
            .filter(e => e.isFinal)
            .map(e => `${e.role === 'user' ? 'User' : 'Agent'}: ${e.text}`)
            .join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries]);

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
                <div className="w-12 h-12 rounded-full bg-surface-2 border border-white/[0.06] flex items-center justify-center">
                    <MessageSquare size={20} className="text-stone-500" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-stone-500 font-display text-center max-w-xs">
                    Your conversation will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-2.5 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                <p className="section-label">Transcript</p>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-stone-600">
                        {entries.filter(e => e.isFinal).length} messages
                    </span>
                    {entries.some(e => e.isFinal) && (
                        <button
                            onClick={handleCopyTranscript}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono
                                       border border-stone-800 text-stone-500 hover:text-white hover:border-stone-600
                                       transition-all duration-200"
                        >
                            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {entries.map((entry, i) => {
                    const isUser = entry.role === 'user';
                    const isPartial = !entry.isFinal;

                    return (
                        <div key={i} className={`flex gap-3 animate-fade-in ${isPartial ? 'opacity-40' : ''}`}>
                            <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold font-mono mt-0.5 ${
                                isUser
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20'
                            }`}>
                                {isUser ? 'U' : 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className={`text-xs font-display font-semibold ${isUser ? 'text-emerald-400' : 'text-accent-primary'}`}>
                                        {isUser ? 'You' : 'Agent'}
                                    </span>
                                    <span className="text-[10px] font-mono text-stone-600">
                                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    {isPartial && <span className="text-[10px] font-mono text-stone-600 italic">typing...</span>}
                                </div>
                                <p className={`text-sm leading-relaxed ${isUser ? 'text-stone-200' : 'text-stone-300'} ${isPartial ? 'italic' : ''}`}>
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
