import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, BookOpen, MessageSquare, Download, ArrowLeft, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

const TABS = [
    { id: 'guide', label: 'Setup Guide', icon: FileText },
    { id: 'references', label: 'Reference Docs', icon: BookOpen },
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
];

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                       border border-white/10 text-gray-400 hover:text-white hover:border-white/20
                       transition-all duration-200"
        >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}

function MarkdownRenderer({ content }) {
    if (!content) return null;
    return (
        <div className="prose prose-sm prose-dark max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}

function ReferenceDocCard({ doc, index }) {
    const [expanded, setExpanded] = useState(index === 0);

    return (
        <div className="glass rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <BookOpen size={14} className="text-blue-400" />
                    </div>
                    <span className="font-display font-medium text-sm text-white">
                        {doc.name}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <CopyButton text={doc.content} />
                    {expanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                </div>
            </button>
            {expanded && (
                <div className="px-5 pb-5 border-t border-white/[0.04]">
                    <div className="pt-4">
                        <MarkdownRenderer content={doc.content} />
                    </div>
                </div>
            )}
        </div>
    );
}

const OutputDisplay = ({ guideData, onBack, onRestart }) => {
    const [activeTab, setActiveTab] = useState('guide');

    if (!guideData || guideData.status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 text-gray-100 gap-6 px-6">
                <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <FileText size={32} className="text-rose-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">
                    {guideData?.status === 'error' ? 'Generation Failed' : 'No Guide Available'}
                </h2>
                <p className="text-gray-400 text-sm max-w-md text-center">
                    {guideData?.message || 'Something went wrong. Please try running the interview again.'}
                </p>
                {onRestart && (
                    <button onClick={onRestart} className="btn-primary mt-2">
                        Start New Interview
                    </button>
                )}
            </div>
        );
    }

    const { outputs } = guideData;
    const guide = outputs?.setup_guide || '';
    const refDocs = outputs?.reference_documents || [];
    const prompts = outputs?.prompts_to_send || '';

    const handleDownloadAll = () => {
        const allContent = [
            '# OpenClaw Setup Guide\n\n',
            guide,
            '\n\n---\n\n# Reference Documents\n\n',
            refDocs.map(d => `## ${d.name}\n\n${d.content}`).join('\n\n---\n\n'),
            '\n\n---\n\n# Prompts to Send\n\n',
            prompts,
        ].join('');

        const blob = new Blob([allContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OPENCLAW_SETUP_GUIDE_${guideData.guide_id}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-surface-0 text-gray-100 relative">
            {/* Background */}
            <div className="fixed inset-0 grid-bg opacity-20" />
            <div className="ambient-glow bg-cyan-500 top-[-50px] right-[30%] opacity-8" />
            <div className="ambient-glow bg-blue-600 bottom-[20%] left-[10%] opacity-8" />

            {/* Header */}
            <header className="sticky top-0 z-20 glass border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div>
                            <p className="section-label mb-0.5">Your Setup Guide</p>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-display font-bold text-white">
                                    OpenClaw Configuration
                                </h1>
                                <span className="status-badge border-emerald-500/30 text-emerald-400 bg-emerald-500/10 !text-[10px] !py-0.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                    Complete
                                </span>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleDownloadAll} className="btn-ghost flex items-center gap-2 !py-2 !px-4 !text-xs">
                        <Download size={14} />
                        Download All
                    </button>
                </div>

                {/* Tabs */}
                <div className="max-w-5xl mx-auto px-6 flex gap-1">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        const TabIcon = tab.icon;
                        const hasContent = tab.id === 'guide' ? !!guide :
                                          tab.id === 'references' ? refDocs.length > 0 :
                                          !!prompts;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-display font-medium
                                    rounded-t-lg transition-all duration-200 border-b-2
                                    ${isActive
                                        ? 'border-cyan-400 text-white bg-white/[0.03]'
                                        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                                    }
                                    ${!hasContent ? 'opacity-40 cursor-not-allowed' : ''}`}
                                disabled={!hasContent}
                            >
                                <TabIcon size={14} />
                                {tab.label}
                                {tab.id === 'references' && refDocs.length > 0 && (
                                    <span className="text-[10px] font-mono bg-surface-2 px-1.5 py-0.5 rounded-full">
                                        {refDocs.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                {activeTab === 'guide' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-end mb-4">
                            <CopyButton text={guide} />
                        </div>
                        <div className="glass rounded-2xl p-8">
                            <MarkdownRenderer content={guide} />
                        </div>
                    </div>
                )}

                {activeTab === 'references' && (
                    <div className="space-y-3 animate-fade-in">
                        {refDocs.map((doc, i) => (
                            <ReferenceDocCard key={doc.name} doc={doc} index={i} />
                        ))}
                        {refDocs.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                No reference documents were generated.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'prompts' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-end mb-4">
                            <CopyButton text={prompts} />
                        </div>
                        <div className="glass rounded-2xl p-8">
                            <MarkdownRenderer content={prompts} />
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-10 border-t border-white/[0.04]">
                {onRestart && (
                    <button onClick={onRestart} className="btn-ghost text-xs">
                        Start a new interview →
                    </button>
                )}
                <p className="text-[11px] font-mono text-gray-600 mt-4">
                    Guide ID: {guideData.guide_id} • Generated by EasyClaw AI Concierge
                </p>
            </footer>
        </div>
    );
};

export default OutputDisplay;
