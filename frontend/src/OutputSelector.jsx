import React, { useState } from 'react';
import { FileText, MessageSquare, BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const OUTPUT_OPTIONS = [
    { key: 'setup_guide', label: 'Setup Guide', description: 'Step-by-step installation and configuration', icon: FileText, locked: true },
    { key: 'prompts', label: 'System Prompts', description: 'Ready-to-paste prompts to initialize your agent', icon: MessageSquare, locked: false },
    { key: 'reference_docs', label: 'Reference Docs', description: 'Detailed sub-guides for complex setup steps', icon: BookOpen, locked: false },
];

const COST_ESTIMATES = {
    1: { time: '~2 min', cost: '~$0.20' },
    2: { time: '~4 min', cost: '~$0.40' },
    3: { time: '~6 min', cost: '~$0.60' },
};

export default function OutputSelector({ onGenerate, onBack }) {
    const [selected, setSelected] = useState(new Set(['setup_guide', 'prompts', 'reference_docs']));

    const toggleOption = (key) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const estimate = COST_ESTIMATES[selected.size] || COST_ESTIMATES[1];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 text-stone-100 relative overflow-hidden">
            <div className="fixed inset-0 grid-bg opacity-15" />
            <div className="ambient-glow bg-accent-primary top-[30%] left-[40%] opacity-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-lg px-6"
            >
                <h1 className="text-2xl font-display font-bold text-white text-center mb-2">
                    What should we generate?
                </h1>
                <p className="text-sm text-stone-500 font-mono text-center mb-8">
                    Select your output package
                </p>

                <div className="space-y-3 mb-8">
                    {OUTPUT_OPTIONS.map(({ key, label, description, icon: Icon, locked }) => {
                        const isSelected = selected.has(key);
                        return (
                            <button
                                key={key}
                                onClick={() => !locked && toggleOption(key)}
                                disabled={locked}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                                    isSelected
                                        ? 'border-accent-primary/40 bg-accent-primary/[0.08] shadow-lg shadow-orange-500/5'
                                        : 'border-stone-800 bg-surface-1 hover:border-stone-700'
                                } ${locked ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-accent-primary/20' : 'bg-surface-2'
                                }`}>
                                    <Icon size={20} className={isSelected ? 'text-accent-primary' : 'text-stone-500'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-display font-semibold ${isSelected ? 'text-white' : 'text-stone-400'}`}>
                                            {label}
                                        </span>
                                        {locked && (
                                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary uppercase tracking-wider">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-500 font-mono mt-0.5">{description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                    isSelected ? 'border-accent-primary bg-accent-primary' : 'border-stone-600'
                                }`}>
                                    {isSelected && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-xs font-mono text-stone-500">
                        Estimated: <span className="text-accent-primary">{estimate.time}</span>
                    </span>
                    <span className="text-stone-700">·</span>
                    <span className="text-xs font-mono text-stone-500">
                        Cost: <span className="text-accent-primary">{estimate.cost}</span>
                    </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <button onClick={onBack} className="btn-ghost !py-2.5">Back</button>
                    <button
                        onClick={() => onGenerate(Array.from(selected))}
                        className="btn-primary flex items-center gap-2 text-base"
                    >
                        Generate
                        <ChevronRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
