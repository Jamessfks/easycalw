import React, { useState, useEffect, useMemo } from 'react';
import { FileText, BookOpen, MessageSquare, ArrowLeft, Archive, Link2, Check, RefreshCw, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { addGuideToHistory } from '../lib/guideHistory';
import Scorecard from './Scorecard';
import MarkdownRenderer from './MarkdownRenderer';
import { CopyButton, DownloadButton, CopyAllPromptsButton, BeforeAfterTeaser } from './GuideActions';
import ReferenceDocCard from './ReferenceDocCard';
import StepWizard from './StepWizard';

const TABS = [
    { id: 'guide', label: 'Setup Guide', icon: FileText },
    { id: 'references', label: 'Reference Docs', icon: BookOpen },
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
];


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

    useEffect(() => { window.location.hash = activeTab; }, [activeTab]);

    useEffect(() => {
        const onHashChange = () => setActiveTab(tabFromHash());
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

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
                window.location.reload();
            } else {
                setRetrying(false);
            }
        } catch {
            setRetrying(false);
        }
    };

    // ── Error state ────────────────────────────────────────────────────────

    if (!guideData || guideData.status === 'error' || guideData.status === 'not_found') {
        const err = categorizeError(guideData?.message);
        const ErrIcon = err.icon;
        const errColorClasses = {
            rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
            amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        };
        const errColors = errColorClasses[err.color] || errColorClasses.rose;
        const [bgCls, borderCls, textCls] = errColors.split(' ');
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 text-gray-100 gap-6 px-6">
                <div className={`w-20 h-20 rounded-full ${bgCls} border ${borderCls} flex items-center justify-center`}>
                    <ErrIcon size={32} className={textCls} />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">{err.label}</h2>
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
                        <button onClick={handleRetry} disabled={retrying} className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !text-sm">
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
                    <p className="text-[10px] font-mono text-gray-600 mt-2">Guide ID: {guideData.guide_id}</p>
                )}
            </div>
        );
    }

    // ── Success state ──────────────────────────────────────────────────────

    const { outputs } = guideData;
    const guide = outputs?.setup_guide || '';
    const refDocs = outputs?.reference_documents || [];
    const prompts = outputs?.prompts_to_send || '';

    const readingTime = useMemo(() => {
        const words = guide.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.round(words / 200));
        return `~${minutes} min read`;
    }, [guide]);

    const heroStats = useMemo(() => {
        const skillInstalls = (guide.match(/(?:clawhub|openclaw)\s+(?:skill\s+)?install\s+\S+/gim) || []).length;
        const sectionHeaders = (guide.match(/^##\s+\d{2}\s*\|/gm) || []).length;
        const estMinutes = sectionHeaders * 5;
        return {
            skills: skillInstalls > 0 ? `${skillInstalls}` : '6',
            steps: sectionHeaders > 0 ? `${sectionHeaders}` : '8',
            minutes: estMinutes > 0 ? `~${estMinutes}` : '~45',
        };
    }, [guide]);

    const handleDownloadAll = async () => {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        if (guide) zip.file('OPENCLAW_ONBOARDING_GUIDE.md', guide);
        if (refDocs.length > 0) {
            const refFolder = zip.folder('reference_documents');
            refDocs.forEach(doc => refFolder.file(doc.name, doc.content));
        }
        if (prompts) zip.file('prompts_to_send.md', prompts);
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
                <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
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
                                        {guideData.quality_eval.patched ? ' — improved' : guideData.quality_eval.passed ? ' \u2713' : ' \u2717'}
                                    </span>
                                )}
                                {guideData.guide_id?.startsWith('demo-') && (
                                    <span className="status-badge border-violet-500/30 text-violet-400 bg-violet-500/10 !text-[10px] !py-0.5">
                                        Demo
                                    </span>
                                )}
                            </div>
                            {(guideData.agent_turns || guideData.agent_cost_usd) && (
                                <p className="text-xs text-gray-400 font-mono mt-1">
                                    {guideData.agent_turns && `Generated in ${guideData.agent_turns} turns`}
                                    {guideData.agent_turns && guideData.agent_cost_usd && ' · '}
                                    {guideData.agent_cost_usd && `$${Number(guideData.agent_cost_usd).toFixed(2)}`}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {guideData.guide_id && !guideData.guide_id.startsWith('demo-') && (
                            <button
                                onClick={() => {
                                    const publicBase = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
                                    const url = `${publicBase}/view/${guideData.guide_id}`;
                                    navigator.clipboard.writeText(url);
                                    setLinkCopied(true);
                                    setTimeout(() => setLinkCopied(false), 2000);
                                }}
                                className="btn-ghost flex items-center gap-2 !py-2 !px-4 !text-xs"
                            >
                                {linkCopied ? <Check size={14} className="text-emerald-400" /> : <Link2 size={14} />}
                                {linkCopied ? 'Link Copied' : 'Copy Link'}
                            </button>
                        )}
                        <button onClick={handleDownloadAll} className="btn-ghost flex items-center gap-2 !py-2 !px-4 !text-xs">
                            <Archive size={14} />
                            Download .zip
                        </button>
                    </div>
                </div>

                <Scorecard scorecard={guideData.scorecard} />

                {/* Tabs */}
                <div className="max-w-5xl mx-auto px-6 flex gap-1 overflow-x-auto">
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

            <BeforeAfterTeaser guideData={guideData} />

            {/* Hero Summary Card */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-8 pb-2">
                <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="flex-1 min-w-0">
                        <p className="section-label mb-1">Personalized for you</p>
                        <h2 className="text-xl font-display font-bold text-white mb-3">
                            {guideData.title || 'Your Personalized OpenClaw Setup'}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                {heroStats.skills} skills recommended
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                {heroStats.steps} setup steps
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-violet-500/10 border border-violet-500/20 text-violet-400">
                                {heroStats.minutes} min setup time
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-gray-500/10 border border-gray-500/20 text-gray-400">
                                <Clock size={12} />
                                {readingTime}
                            </span>
                        </div>
                    </div>
                    {guideData.quality_eval && (
                        <div className={`shrink-0 flex flex-col items-center px-5 py-3 rounded-xl border ${
                            guideData.quality_eval.patched
                                ? 'bg-amber-500/10 border-amber-500/20'
                                : guideData.quality_eval.passed
                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                    : 'bg-rose-500/10 border-rose-500/20'
                        }`}>
                            <span className={`text-2xl font-display font-bold ${
                                guideData.quality_eval.patched ? 'text-amber-400'
                                    : guideData.quality_eval.passed ? 'text-emerald-400'
                                    : 'text-rose-400'
                            }`}>
                                {guideData.quality_eval.mean_score}/5
                            </span>
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">
                                Quality{guideData.quality_eval.patched ? ' (improved)' : ''}
                            </span>
                        </div>
                    )}
                </div>
            </div>

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
                        <StepWizard content={guide} />
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
                            <CopyAllPromptsButton prompts={prompts} />
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
