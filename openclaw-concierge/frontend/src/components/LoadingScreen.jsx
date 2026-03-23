import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, BookOpen } from 'lucide-react';

const STAGES = [
    { icon: Sparkles, label: 'Analyzing your interview responses...', progress: 25 },
    { icon: FileText, label: 'Generating your setup guide...', progress: 55 },
    { icon: BookOpen, label: 'Creating reference documents...', progress: 80 },
    { icon: Sparkles, label: 'Finalizing your personalized guide...', progress: 95 },
];

const LoadingScreen = () => {
    const [stageIdx, setStageIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStageIdx(prev => (prev < STAGES.length - 1 ? prev + 1 : prev));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const stage = STAGES[stageIdx];
    const StageIcon = stage.icon;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 text-gray-100 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 grid-bg opacity-20" />
            <div className="ambient-glow bg-cyan-500 top-[30%] left-[40%] opacity-10" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-md px-6 animate-fade-up">
                {/* Spinner */}
                <div className="relative w-28 h-28 mx-auto mb-10">
                    <div className="absolute inset-0 rounded-full border-2 border-white/[0.04]" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin-slow" />
                    <div className="absolute inset-3 rounded-full border-2 border-t-transparent border-r-blue-400 border-b-transparent border-l-transparent animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <StageIcon size={28} className="text-cyan-400" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Stage label */}
                <h2 className="text-xl font-display font-semibold text-white mb-3">
                    {stage.label}
                </h2>

                {/* Progress bar */}
                <div className="w-64 mx-auto h-1 bg-surface-2 rounded-full overflow-hidden mt-6 mb-4">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${stage.progress}%` }}
                    />
                </div>

                {/* Stage indicators */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    {STAGES.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                i === stageIdx ? 'bg-cyan-400 scale-125' :
                                i < stageIdx ? 'bg-cyan-400/40' :
                                'bg-gray-700'
                            }`}
                        />
                    ))}
                </div>

                <p className="text-xs font-mono text-gray-600 mt-8">
                    This may take a minute. Please don't close this page.
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
