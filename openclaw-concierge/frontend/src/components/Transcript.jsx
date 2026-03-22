import React, { useEffect, useRef } from 'react';

const Transcript = ({ entries = [] }) => {
    const endRef = useRef(null);

    // Auto-scroll to bottom on new entries
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries]);

    if (entries.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm">
                Transcript will appear here when the interview starts...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 overflow-y-auto h-full p-6 scrollbar-thin">
            {entries.map((entry, i) => (
                <div
                    key={i}
                    className={`flex flex-col gap-1 ${!entry.isFinal ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold tracking-wider uppercase ${
                            entry.role === 'user' ? 'text-green-400' : 'text-cyan-400'
                        }`}>
                            {entry.role === 'user' ? 'You' : 'Agent'}
                        </span>
                        <span className="text-xs text-gray-600">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                        entry.role === 'user' ? 'text-green-100' : 'text-cyan-100'
                    } ${!entry.isFinal ? 'italic' : ''}`}>
                        {entry.text}
                    </p>
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};

export default Transcript;
