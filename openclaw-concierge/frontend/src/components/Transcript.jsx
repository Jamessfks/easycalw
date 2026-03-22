import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

export default function Transcript({ entries = [] }) {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries]);

    return (
        <div className="flex flex-col h-full">
            <div className="px-5 pt-4 pb-2 border-b border-white/[0.04]">
                <h2 className="text-[10px] font-semibold text-sky-400/70 uppercase tracking-[0.15em] flex items-center gap-2">
                    <Activity size={11} />
                    Live Transcript
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {entries.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-600 text-sm italic">
                            Transcript appears here when the interview starts...
                        </p>
                    </div>
                )}

                {entries.map((entry, i) => (
                    <div
                        key={i}
                        className={`flex flex-col gap-1 ${!entry.isFinal ? 'opacity-40' : ''} transition-opacity duration-300`}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-semibold tracking-[0.15em] uppercase ${
                                entry.role === 'user' ? 'text-emerald-400/80' : 'text-sky-400/80'
                            }`}>
                                {entry.role === 'user' ? 'You' : 'Concierge'}
                            </span>
                            <span className="text-[9px] text-slate-600 font-mono">
                                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${
                            entry.role === 'user' ? 'text-emerald-100/90' : 'text-slate-300'
                        } ${!entry.isFinal ? 'italic' : ''}`}>
                            {entry.text}
                        </p>
                    </div>
                ))}

                <div ref={endRef} />
            </div>
        </div>
    );
}
