import React from 'react';
import { Activity } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[var(--ec-bg)] grid-bg noise-overlay relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-sky-500/[0.04] blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="relative">
                    <div className="absolute -inset-4 rounded-full border border-sky-500/20 animate-pulse-ring" />
                    <div className="w-20 h-20 rounded-full bg-sky-500/[0.08] border border-sky-500/20 flex items-center justify-center">
                        <Activity size={32} className="text-sky-400 animate-spin" />
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        Generating Your Setup Guide
                    </h1>
                    <p className="text-sm text-slate-400 font-mono max-w-md">
                        The output agent is mapping your preferences to the OpenClaw registry. This may take up to a minute.
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
                         style={{ width: '60%', animation: 'gradient-shift 2s ease infinite', backgroundSize: '200% 100%' }} />
                </div>
            </div>
        </div>
    );
}
