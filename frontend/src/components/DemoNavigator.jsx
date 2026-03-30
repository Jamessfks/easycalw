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
    amber:   { border: 'border-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'group-hover:shadow-amber-500/10' },
    cyan:    { border: 'border-accent-primary/20', text: 'text-accent-primary', bg: 'bg-accent-primary/10', glow: 'group-hover:shadow-orange-500/10' },
    emerald: { border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'group-hover:shadow-emerald-500/10' },
    violet:  { border: 'border-violet-500/20', text: 'text-violet-400', bg: 'bg-violet-500/10', glow: 'group-hover:shadow-violet-500/10' },
    rose:    { border: 'border-rose-500/20', text: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'group-hover:shadow-rose-500/10' },
};

const FALLBACK_DEMOS = [
    { demo_id: 'demo-restaurant', title: 'Scouts Coffee', subtitle: 'Staff scheduling & supplier automation', category: 'Small Business', icon: 'coffee', color: 'amber' },
    { demo_id: 'demo-devops', title: 'Autonomous Dev Agent', subtitle: 'CI/CD monitoring & deployment', category: 'Developer Tools', icon: 'terminal', color: 'emerald' },
    { demo_id: 'demo-finance', title: 'Expense Tracking', subtitle: 'Categorization & tax prep', category: 'Finance', icon: 'receipt', color: 'amber' },
    { demo_id: 'demo-content', title: 'Content Pipeline', subtitle: 'Repurpose videos into social posts', category: 'Content', icon: 'pen-tool', color: 'violet' },
    { demo_id: 'demo-healthcare', title: 'Dental Reminders', subtitle: 'Patient follow-ups & verification', category: 'Healthcare', icon: 'heart-pulse', color: 'rose' },
];

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function DemoNavigator({ onSelectDemo }) {
    const [demos, setDemos] = useState(FALLBACK_DEMOS);

    useEffect(() => {
        fetch(`${API_BASE}/demos`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setDemos(data); })
            .catch(() => {});
    }, []);

    return (
        <section className="max-w-4xl mx-auto px-6 pb-16">
            <div className="text-center mb-8">
                <p className="section-label mb-2">Demo Outputs</p>
                <h2 className="text-xl font-display font-bold text-white">
                    See what EasyClaw generates
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {demos.map((demo) => {
                    const Icon = ICON_MAP[demo.icon] || Code2;
                    const colors = COLOR_MAP[demo.color] || COLOR_MAP.cyan;

                    return (
                        <button
                            key={demo.demo_id}
                            onClick={() => onSelectDemo(demo.demo_id)}
                            className={`card group text-left relative overflow-hidden
                                       hover:scale-[1.02] active:scale-[0.98]
                                       transition-all duration-200 shadow-lg shadow-transparent
                                       ${colors.glow} !p-5`}
                        >
                            <div className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-3`}>
                                <Icon size={18} className={colors.text} strokeWidth={1.5} />
                            </div>
                            <span className={`inline-block text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} mb-2`}>
                                {demo.category}
                            </span>
                            <h3 className="font-display font-semibold text-white text-sm mb-1">{demo.title}</h3>
                            <p className="text-xs text-stone-500 leading-relaxed">{demo.subtitle}</p>
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <ArrowRight size={14} className={colors.text} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
