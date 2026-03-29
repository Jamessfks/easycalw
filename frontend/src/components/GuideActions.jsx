import React, { useState } from 'react';
import { Download, Copy, Check, ArrowRightLeft, ChevronDown } from 'lucide-react';

export function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono
                       border border-stone-700 text-stone-400 hover:text-white hover:border-stone-600
                       transition-all duration-200"
        >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}

export function DownloadButton({ content, filename, label }) {
    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono
                       border border-stone-700 text-stone-400 hover:text-white hover:border-stone-600
                       transition-all duration-200"
        >
            <Download size={12} />
            {label || 'Download .md'}
        </button>
    );
}

export function CopyAllPromptsButton({ prompts }) {
    const [copied, setCopied] = useState(false);

    const extractPrompts = (md) => {
        if (!md) return '';
        const blocks = [];
        const regex = /```[\s\S]*?```/g;
        let match;
        while ((match = regex.exec(md)) !== null) {
            const block = match[0].replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
            if (block.trim()) blocks.push(block.trim());
        }
        return blocks.join('\n\n---\n\n');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(extractPrompts(prompts));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono
                       border border-accent-primary/20 text-accent-primary hover:text-accent-soft hover:border-accent-primary/40
                       bg-accent-primary/5 hover:bg-accent-primary/10 transition-all duration-200"
        >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'All Prompts Copied' : 'Copy All Prompts'}
        </button>
    );
}

export function BeforeAfterTeaser({ guideData }) {
    const [expanded, setExpanded] = useState(false);
    const guide = guideData?.outputs?.setup_guide || '';
    const wordCount = guide.trim().split(/\s+/).filter(Boolean).length;

    const rawExcerpt = guideData?.transcript_excerpt
        || "uh yeah so I run a restaurant... like we have maybe 30 tables?\nand I need help with like scheduling and stuff\num and also the POS system is really old...";

    return (
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-6 pb-0">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full glass rounded-xl px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <ArrowRightLeft size={14} className="text-violet-400" />
                    </div>
                    <span className="text-sm font-display font-medium text-gray-300 group-hover:text-white transition-colors">
                        How it works — See the AI transformation
                    </span>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && (
                <div className="glass rounded-b-xl border-t-0 -mt-1 px-5 pb-5 pt-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl bg-surface-2 border border-white/[0.06] p-4">
                            <p className="section-label mb-2 text-rose-400">Raw Voice Input</p>
                            <pre className="text-xs font-mono text-gray-500 whitespace-pre-wrap leading-relaxed">
                                {rawExcerpt}
                            </pre>
                        </div>
                        <div className="rounded-xl bg-surface-2 border border-emerald-500/10 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-emerald-400 text-lg">→</span>
                                <p className="section-label text-emerald-400 !mb-0">Structured Guide</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                        {wordCount.toLocaleString()} words
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                        {(guideData?.outputs?.reference_documents || []).length} reference docs
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Personalized setup guide with step-by-step instructions, reference documentation, and ready-to-use prompts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
