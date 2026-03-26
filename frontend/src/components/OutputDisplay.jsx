import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, BookOpen, MessageSquare, Download, ArrowLeft, Copy, Check, ChevronDown, ChevronRight, Archive, Link2, Share2, RefreshCw, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { addGuideToHistory } from '../lib/guideHistory';
import Scorecard from './Scorecard';

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

function DownloadButton({ content, filename, label }) {
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                       border border-white/10 text-gray-400 hover:text-white hover:border-white/20
                       transition-all duration-200"
        >
            <Download size={12} />
            {label || 'Download .md'}
        </button>
    );
}

function CodeBlock({ children, className }) {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, '');
    const language = className?.replace('language-', '') || '';

    return (
        <div className="relative group">
            {language && (
                <span className="absolute top-2 left-3 text-[10px] font-mono text-gray-600 uppercase">
                    {language}
                </span>
            )}
            <button
                onClick={() => {
                    navigator.clipboard.writeText(code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                           flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono
                           bg-white/5 border border-white/10 text-gray-400 hover:text-white
                           transition-all duration-200"
            >
                {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
            <code className={className}>{children}</code>
        </div>
    );
}

function GuideImage({ src, alt, ...props }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-2 border border-white/[0.06] my-4">
                <FileText size={18} className="text-gray-500 shrink-0" />
                <span className="text-sm text-gray-400 font-mono">{alt || 'Screenshot'}</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            {...props}
        />
    );
}

function headingId(children) {
    return String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function GuideTableOfContents({ content }) {
    const headings = useMemo(() => {
        if (!content) return [];
        const matches = [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)];
        return matches.map(([, hashes, text]) => ({
            id: headingId(text),
            label: text.replace(/^\d+\s*\|\s*/, ''),
            level: hashes.length,
        }));
    }, [content]);

    if (headings.length < 4) return null;

    return (
        <nav className="hidden xl:block sticky top-28 w-48 shrink-0 pr-4 border-r border-white/[0.04] self-start">
            <p className="section-label mb-3">Contents</p>
            <div className="space-y-0.5">
                {headings.map(h => (
                    <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block text-[11px] font-mono text-gray-500 hover:text-white transition-colors
                                   py-1 truncate ${h.level === 3 ? 'pl-3 text-gray-600' : ''}`}
                    >
                        {h.label}
                    </a>
                ))}
            </div>
        </nav>
    );
}

function MarkdownRenderer({ content }) {
    if (!content) return null;
    return (
        <div className="prose prose-sm prose-dark max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2({ children, ...props }) {
                        const id = headingId(children);
                        return <h2 id={id} className="scroll-mt-28" {...props}>{children}</h2>;
                    },
                    h3({ children, ...props }) {
                        const id = headingId(children);
                        return <h3 id={id} className="scroll-mt-28" {...props}>{children}</h3>;
                    },
                    pre({ children }) {
                        return <pre>{children}</pre>;
                    },
                    code({ children, className, node, ...rest }) {
                        const isInline = !className;
                        if (isInline) {
                            return <code {...rest}>{children}</code>;
                        }
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                    },
                    img({ src, alt, ...rest }) {
                        return <GuideImage src={src} alt={alt} {...rest} />;
                    },
                }}
            >
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
                    <DownloadButton content={doc.content} filename={doc.name} />
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

function categorizeError(message) {
    if (!message) return { type: 'unknown', label: 'Unknown Error', icon: XCircle, color: 'rose' };
    const m = message.toLowerCase();
    if (m.includes('timeout') || m.includes('timed out'))
        return { type: 'timeout', label: 'Generation Timed Out', icon: Clock, color: 'amber' };
    if (m.includes('format') || m.includes('parse') || m.includes('markdown'))
        return { type: 'format', label: 'Output Format Error', icon: AlertTriangle, color: 'amber' };
    if (m.includes('500') || m.includes('server') || m.includes('internal'))
        return { type: 'server', label: 'Server Error', icon: XCircle, color: 'rose' };
    if (m.includes('rate') || m.includes('limit') || m.includes('429'))
        return { type: 'ratelimit', label: 'Rate Limited', icon: Clock, color: 'amber' };
    return { type: 'generation', label: 'Generation Failed', icon: AlertTriangle, color: 'rose' };
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

const OutputDisplay = ({ guideData, onBack, onRestart }) => {
    const tabFromHash = () => {
        const hash = window.location.hash.replace('#', '');
        const valid = TABS.map(t => t.id);
        return valid.includes(hash) ? hash : 'guide';
    };

    const [activeTab, setActiveTab] = useState(tabFromHash);
    const [linkCopied, setLinkCopied] = useState(false);
    const [retrying, setRetrying] = useState(false);

    // Sync tab to URL hash
    useEffect(() => {
        window.location.hash = activeTab;
    }, [activeTab]);

    // Listen for hash changes (browser back/forward)
    useEffect(() => {
        const onHashChange = () => setActiveTab(tabFromHash());
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // Save to history when a completed guide renders
    useEffect(() => {
        if (guideData?.status === 'complete' && guideData?.guide_id) {
            addGuideToHistory(guideData.guide_id);
        }
    }, [guideData]);

    const handleRetry = async () => {
        if (!guideData?.guide_id || retrying) return;
        setRetrying(true);
        try {
            const res = await fetch(`${API_BASE}/retry-guide/${guideData.guide_id}`, { method: 'POST' });
            if (res.ok) {
                // Reload to pick up the new guide generation
                window.location.reload();
            } else {
                setRetrying(false);
            }
        } catch {
            setRetrying(false);
        }
    };

    if (!guideData || guideData.status === 'error') {
        const err = categorizeError(guideData?.message);
        const ErrIcon = err.icon;
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 text-gray-100 gap-6 px-6">
                <div className={`w-20 h-20 rounded-full bg-${err.color}-500/10 border border-${err.color}-500/20 flex items-center justify-center`}>
                    <ErrIcon size={32} className={`text-${err.color}-400`} />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">
                    {err.label}
                </h2>
                <p className="text-gray-400 text-sm max-w-md text-center">
                    {guideData?.message || 'Something went wrong. Please try running the interview again.'}
                </p>
                {err.type === 'timeout' && (
                    <p className="text-gray-500 text-xs max-w-sm text-center">
                        Guide generation took longer than expected. This can happen with complex interview transcripts. Retrying usually works.
                    </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                    {guideData?.guide_id && (
                        <button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !text-sm"
                        >
                            <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
                            {retrying ? 'Retrying...' : 'Retry Guide'}
                        </button>
                    )}
                    {onRestart && (
                        <button onClick={onRestart} className="btn-ghost !py-2.5 !px-5 !text-sm">
                            Start New Interview
                        </button>
                    )}
                </div>
                {guideData?.guide_id && (
                    <p className="text-[10px] font-mono text-gray-600 mt-2">
                        Guide ID: {guideData.guide_id}
                    </p>
                )}
            </div>
        );
    }

    const { outputs } = guideData;
    const guide = outputs?.setup_guide || '';
    const refDocs = outputs?.reference_documents || [];
    const prompts = outputs?.prompts_to_send || '';

    const handleDownloadAll = async () => {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();

        if (guide) {
            zip.file('OPENCLAW_ONBOARDING_GUIDE.md', guide);
        }

        if (refDocs.length > 0) {
            const refFolder = zip.folder('reference_documents');
            refDocs.forEach(doc => {
                refFolder.file(doc.name, doc.content);
            });
        }

        if (prompts) {
            zip.file('prompts_to_send.md', prompts);
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `openclaw_setup_${guideData.guide_id}.zip`;
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
                                    {guideData.title || 'OpenClaw Configuration'}
                                </h1>
                                <span className="status-badge border-emerald-500/30 text-emerald-400 bg-emerald-500/10 !text-[10px] !py-0.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                    Complete
                                </span>
                                {guideData.quality_eval && (
                                    <span className={`status-badge !text-[10px] !py-0.5 ${
                                        guideData.quality_eval.patched
                                            ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                            : guideData.quality_eval.passed
                                                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                                : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                                    }`}>
                                        Quality: {guideData.quality_eval.mean_score}/5
                                        {guideData.quality_eval.patched
                                            ? ' — improved'
                                            : guideData.quality_eval.passed
                                                ? ' \u2713'
                                                : ' \u2717'}
                                    </span>
                                )}
                                {guideData.guide_id?.startsWith('demo-') && (
                                    <span className="status-badge border-violet-500/30 text-violet-400 bg-violet-500/10 !text-[10px] !py-0.5">
                                        Demo
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {guideData.guide_id && !guideData.guide_id.startsWith('demo-') && (
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/view/${guideData.guide_id}`;
                                    navigator.clipboard.writeText(url);
                                    setLinkCopied(true);
                                    setTimeout(() => setLinkCopied(false), 2000);
                                }}
                                className="btn-ghost flex items-center gap-2 !py-2 !px-4 !text-xs"
                            >
                                {linkCopied ? <Check size={14} className="text-emerald-400" /> : <Link2 size={14} />}
                                {linkCopied ? 'Link Copied' : 'Share Link'}
                            </button>
                        )}
                        <button onClick={handleDownloadAll} className="btn-ghost flex items-center gap-2 !py-2 !px-4 !text-xs">
                            <Archive size={14} />
                            Download .zip
                        </button>
                    </div>
                </div>

                {/* Scorecard */}
                <Scorecard scorecard={guideData.scorecard} />

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
                {onRestart && (
                    <div className="flex justify-end mb-4">
                        <button onClick={onRestart} className="btn-primary flex items-center gap-2 !py-2 !px-5 !text-sm">
                            <RefreshCw size={14} />
                            Start New Interview
                        </button>
                    </div>
                )}
                {activeTab === 'guide' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-end gap-2 mb-4">
                            <DownloadButton content={guide} filename="OPENCLAW_ONBOARDING_GUIDE.md" />
                            <CopyButton text={guide} />
                        </div>
                        <div className="flex gap-6">
                            <GuideTableOfContents content={guide} />
                            <div className="flex-1 min-w-0 glass rounded-2xl p-8">
                                <MarkdownRenderer content={guide} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'references' && (
                    <div className="space-y-3 animate-fade-in">
                        {refDocs.map((doc, i) => (
                            <ReferenceDocCard key={doc.name} doc={doc} index={i} />
                        ))}
                        {refDocs.length === 0 && (
                            <div className="glass rounded-xl text-center py-16 px-6">
                                <div className="w-14 h-14 rounded-full bg-surface-2 border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                                    <BookOpen size={22} className="text-gray-500" />
                                </div>
                                <p className="text-gray-400 font-display font-medium mb-1">
                                    No reference documents needed for this setup
                                </p>
                                <p className="text-gray-600 text-sm font-mono">
                                    Everything you need is in the main setup guide above.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'prompts' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-end gap-2 mb-4">
                            <DownloadButton content={prompts} filename="prompts_to_send.md" />
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
