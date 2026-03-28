import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Code2, DollarSign, PenTool, HeartPulse, ArrowRight } from 'lucide-react';

const ICON_MAP = {
    utensils: UtensilsCrossed,
    code: Code2,
    dollar: DollarSign,
    pen: PenTool,
    heart: HeartPulse,
};

const COLOR_MAP = {
    amber: { border: 'border-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'group-hover:shadow-amber-500/10' },
    cyan: { border: 'border-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500/10', glow: 'group-hover:shadow-cyan-500/10' },
    emerald: { border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'group-hover:shadow-emerald-500/10' },
    violet: { border: 'border-violet-500/20', text: 'text-violet-400', bg: 'bg-violet-500/10', glow: 'group-hover:shadow-violet-500/10' },
    rose: { border: 'border-rose-500/20', text: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'group-hover:shadow-rose-500/10' },
};

// Static fallback in case /demos endpoint is slow
const FALLBACK_DEMOS = [
    { demo_id: 'demo-restaurant', title: 'Scouts Coffee', subtitle: 'Staff scheduling & supplier automation for a growing SF café', category: 'Small Business', icon: 'coffee', color: 'amber' },
    { demo_id: 'demo-devops', title: 'Autonomous Dev Agent', subtitle: 'CI/CD monitoring, PR reviews & deployment automation', category: 'Developer Tools', icon: 'terminal', color: 'emerald' },
    { demo_id: 'demo-finance', title: 'Expense Tracking', subtitle: 'Expense categorization, invoice reminders & tax prep', category: 'Finance', icon: 'receipt', color: 'blue' },
    { demo_id: 'demo-content', title: 'Content Repurposing Pipeline', subtitle: 'Auto-repurpose videos into social posts, newsletters & threads', category: 'Content Creation', icon: 'pen-tool', color: 'purple' },
    { demo_id: 'demo-healthcare', title: 'Dental Appointment Reminders', subtitle: 'Patient reminders, follow-ups & insurance verification', category: 'Healthcare', icon: 'heart-pulse', color: 'rose' },
];

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function DemoNavigator({ onSelectDemo }) {
    const [demos, setDemos] = useState(FALLBACK_DEMOS);

    useEffect(() => {
        fetch(`${API_BASE}/demos`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setDemos(data); })
            .catch(() => {}); // keep fallback
    }, []);

    return (
        <section className="max-w-5xl mx-auto px-6 pb-20">
            <div className="text-center mb-10">
                <p className="section-label mb-3">Demo Outputs</p>
                <h2 className="text-2xl font-display font-bold text-white">
                    See what EasyClaw generates
                </h2>
                <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
                    Explore real output examples across different use cases
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {demos.map((demo) => {
                    const Icon = ICON_MAP[demo.icon] || Code2;
                    const colors = COLOR_MAP[demo.color] || COLOR_MAP.cyan;

                    return (
                        <button
                            key={demo.demo_id}
                            onClick={() => onSelectDemo(demo.demo_id)}
                            className={`card group text-left relative overflow-hidden
                                       hover:scale-[1.02] active:scale-[0.98]
                                       transition-all duration-300 shadow-lg shadow-transparent
                                       ${colors.glow}`}
                        >
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border
                                           flex items-center justify-center mb-4`}>
                                <Icon size={20} className={colors.text} strokeWidth={1.5} />
                            </div>

                            {/* Category badge */}
                            <span className={`inline-block text-[10px] font-mono tracking-wider uppercase
                                            px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} mb-3`}>
                                {demo.category}
                            </span>

                            {/* Title + subtitle */}
                            <h3 className="font-display font-semibold text-white text-base mb-1.5 group-hover:text-white/90">
                                {demo.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                {demo.subtitle}
                            </p>

                            {/* Arrow */}
                            <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowRight size={16} className={colors.text} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
