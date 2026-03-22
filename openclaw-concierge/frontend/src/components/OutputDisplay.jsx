import React from 'react';
import { FileText, Download, ArrowLeft, Sparkles } from 'lucide-react';

export default function OutputDisplay({ guideMd = '', onBack }) {
    const downloadGuide = () => {
        const blob = new Blob([guideMd], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'OPENCLAW_ENGINE_SETUP_GUIDE.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!guideMd) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[var(--ec-bg)] grid-bg noise-overlay relative">
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-500/[0.08] border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
                        <Sparkles size={24} className="text-violet-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Guide Generation</h1>
                    <p className="text-sm text-slate-400 max-w-sm">
                        Complete a voice interview first. Your personalized setup guide will appear here.
                    </p>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm text-slate-300 border border-white/[0.08] rounded-lg hover:border-white/[0.15] hover:bg-white/[0.03] transition-all"
                        >
                            <ArrowLeft size={14} />
                            Back to home
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[var(--ec-bg)] grid-bg noise-overlay">
            <header className="h-14 border-b border-white/[0.06] bg-[var(--ec-surface)]/80 flex items-center justify-between px-5 backdrop-blur-md shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors">
                            <ArrowLeft size={14} />
                        </button>
                    )}
                    <span className="text-lg">🐾</span>
                    <h1 className="text-sm font-semibold text-white flex items-center gap-2">
                        <FileText size={14} className="text-sky-400" />
                        OPENCLAW_ENGINE_SETUP_GUIDE.md
                    </h1>
                </div>
                <button
                    onClick={downloadGuide}
                    className="inline-flex items-center gap-1.5 text-xs px-4 py-2 bg-sky-500/15 border border-sky-500/25 rounded-lg text-sky-300 hover:bg-sky-500/25 transition-colors font-medium"
                >
                    <Download size={12} /> Download
                </button>
            </header>

            <div className="flex-1 overflow-auto p-6 md:p-10 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {guideMd}
                    </pre>
                </div>
            </div>
        </div>
    );
}
