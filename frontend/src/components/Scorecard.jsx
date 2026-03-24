import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

function MetricBadge({ label, value, color }) {
    const colorMap = {
        emerald: 'text-emerald-400/80',
        amber: 'text-amber-400/80',
        rose: 'text-rose-400/80',
        gray: 'text-gray-400/60',
    };

    return (
        <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-gray-500">
            {label}
            <span className={`font-medium ${colorMap[color] || colorMap.gray}`}>
                {value}
            </span>
        </span>
    );
}

export default function Scorecard({ scorecard }) {
    const [showFollowUps, setShowFollowUps] = useState(false);

    if (!scorecard) return null;

    const depthPct = Math.round(scorecard.context_depth * 100);
    const depthColor = depthPct >= 80 ? 'emerald' : depthPct >= 50 ? 'amber' : 'rose';

    const sectionsColor = scorecard.sections_covered >= scorecard.sections_total ? 'emerald' : 'amber';

    const followUps = scorecard.follow_ups || [];
    const followUpColor = followUps.length === 0 ? 'emerald' : followUps.length <= 1 ? 'amber' : 'rose';

    return (
        <div className="border-b border-white/[0.04]">
            <div className="max-w-5xl mx-auto px-6 py-2 flex items-center gap-6 flex-wrap">
                <span className="text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded border border-violet-500/20 text-violet-400/60 bg-violet-500/5">
                    Beta
                </span>
                <MetricBadge
                    label="Context"
                    value={`${depthPct}%`}
                    color={depthColor}
                />
                <span className="w-px h-3 bg-white/[0.08]" />
                <MetricBadge
                    label="Sections"
                    value={`${scorecard.sections_covered}/${scorecard.sections_total}`}
                    color={sectionsColor}
                />
                <span className="w-px h-3 bg-white/[0.08]" />
                {followUps.length > 0 ? (
                    <button
                        onClick={() => setShowFollowUps(!showFollowUps)}
                        className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-gray-500 hover:text-white transition-colors"
                    >
                        Follow-ups
                        <span className={`font-medium ${followUpColor === 'amber' ? 'text-amber-400/80' : 'text-rose-400/80'}`}>
                            {followUps.length}
                        </span>
                        {showFollowUps ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </button>
                ) : (
                    <MetricBadge label="Follow-ups" value="None" color="emerald" />
                )}
            </div>

            {/* Expandable follow-ups */}
            {showFollowUps && followUps.length > 0 && (
                <div className="max-w-5xl mx-auto px-6 pb-3">
                    <div className="flex flex-wrap gap-2">
                        {followUps.map((item, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1.5 text-[10px] font-mono
                                           px-2.5 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-400/70"
                            >
                                <AlertCircle size={10} />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
