import { useState, useEffect, useMemo } from 'react';
import { FileText, BookOpen, MessageSquare, ArrowLeft, Archive, Link2, Check, RefreshCw, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { addGuideToHistory } from '../lib/guideHistory';
import Scorecard from './Scorecard';
import MarkdownRenderer from './MarkdownRenderer';
import { CopyButton, DownloadButton, CopyAllPromptsButton, BeforeAfterTeaser } from './GuideActions';
import ReferenceDocCard from './ReferenceDocCard';
import StepWizard from './StepWizard';

const TABS = [
    { id: 'guide', label: 'Setup Guide', icon: FileText },
    { id: 'references', label: 'References', icon: BookOpen },
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
];


function categorizeError(message) {
    if (!message) return { type: 'unknown', label: 'Unknown Error', icon: XCircle, color: 'rose' };
    const m = message.toLowerCase();
    if (m.includes('timeout') || m.includes('timed out')) return { type: 'timeout', label: 'Generation Timed Out', icon: Clock, color: 'amber' };
    if (m.includes('format') || m.includes('parse') || m.includes('markdown')) return { type: 'format', label: 'Output Format Error', icon: AlertTriangle, color: 'amber' };
    if (m.includes('500') || m.includes('server') || m.includes('internal')) return { type: 'server', label: 'Server Error', icon: XCircle, color: 'rose' };
    if (m.includes('rate') || m.includes('limit') || m.includes('429')) return { type: 'ratelimit', label: 'Rate Limited', icon: Clock, color: 'amber' };
    return { type: 'generation', label: 'Generation Failed', icon: AlertTriangle, color: 'rose' };
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

const OutputDisplay = ({ guideData, onBack, onRestart }) => {
    const tabFromHash = () => {
        const hash = window.location.hash.replace('#', '');
        return TABS.map(t => t.id).includes(hash) ? hash : 'guide';
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
        if (guideData?.status === 'complete' && guideData?.guide_id) addGuideToHistory(guideData.guide_id);
    }, [guideData]);

    const handleRetry = async () => {
        if (!guideData?.guide_id || retrying) return;
        setRetrying(true);
        try {
            const res = await fetch(`${API_BASE}/retry-guide/${guideData.guide_id}`, { method: 'POST' });
            if (res.ok) window.location.reload();
            else setRetrying(false);
        } catch { setRetrying(false); }
    };

    // ── Error state ──
    if (!guideData || guideData.status === 'error' || guideData.status === 'not_found') {
        const err = categorizeError(guideData?.message);
        const ErrIcon = err.icon;
        const errBg = err.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';
        const errText = err.color === 'amber' ? 'text-amber-400' : 'text-red-400';
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 text-stone-100 gap-6 px-6">
                <div className={`w-20 h-20 rounded-full ${errBg} border flex items-center justify-center`}>
                    <ErrIcon size={32} className={errText} />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">{err.label}</h2>
                <p className="text-stone-400 text-sm max-w-md text-center">{guideData?.message || 'Something went wrong.'}</p>
                <div className="flex items-center gap-3 mt-2">
                    {guideData?.guide_id && (
                        <button onClick={handleRetry} disabled={retrying} className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !text-sm">
                            <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} /> {retrying ? 'Retrying...' : 'Retry'}
                        </button>
                    )}
                    {onRestart && <button onClick={onRestart} className="btn-ghost !py-2.5 !px-5 !text-sm">New Interview</button>}
                </div>
            </div>
        );
    }

    // ── Success ──
    const { outputs } = guideData;
    const guide = outputs?.setup_guide || '';
    const refDocs = outputs?.reference_documents || [];
    const prompts = outputs?.prompts_to_send || '';

    const readingTime = useMemo(() => {
        const words = guide.trim().split(/\s+/).filter(Boolean).length;
        return `~${Math.max(1, Math.round(words / 200))} min read`;
    }, [guide]);

    const heroStats = useMemo(() => {
        const skillInstalls = (guide.match(/(?:clawhub|openclaw)\s+(?:skill\s+)?install\s+\S+/gim) || []).length;
        const sectionHeaders = (guide.match(/^##\s+\d{2}\s*\|/gm) || []).length;
        return {
            skills: skillInstalls > 0 ? `${skillInstalls}` : '6',
            steps: sectionHeaders > 0 ? `${sectionHeaders}` : '8',
            minutes: sectionHeaders > 0 ? `~${sectionHeaders * 5}` : '~45',
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
        <div className="min-h-screen bg-surface-0 text-stone-100 relative">
            <div className="fixed inset-0 grid-bg opacity-15" />
            <div className="ambient-glow bg-accent-primary top-[-50px] right-[30%] opacity-8" />

            {/* Header */}
            <header className="sticky top-0 z-20 glass border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 transition-colors text-stone-400 hover:text-white">
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-base font-display font-bold text-white leading-tight">
                                {guideData.title || 'OpenClaw Setup Guide'}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="status-badge border-emerald-500/30 text-emerald-400 bg-emerald-500/10 !text-[9px] !py-0.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400" /> Complete
                                </span>
                                {guideData.quality_eval && (
                                    <span className={`status-badge !text-[9px] !py-0.5 ${
                                        guideData.quality_eval.passed
                                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                            : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                    }`}>
                                        Quality: {guideData.quality_eval.mean_score}/5
                                    </span>
                                )}
                                {guideData.guide_id?.startsWith('demo-') && (
                                    <span className="status-badge border-accent-secondary/30 text-accent-secondary bg-accent-secondary/10 !text-[9px] !py-0.5">Demo</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {guideData.guide_id && !guideData.guide_id.startsWith('demo-') && (
                            <button
                                onClick={() => {
                                    const url = `${import.meta.env.VITE_PUBLIC_URL || window.location.origin}/view/${guideData.guide_id}`;
                                    navigator.clipboard.writeText(url);
                                    setLinkCopied(true);
                                    setTimeout(() => setLinkCopied(false), 2000);
                                }}
                                className="btn-ghost flex items-center gap-2 !py-1.5 !px-3 !text-xs"
                            >
                                {linkCopied ? <Check size={14} className="text-emerald-400" /> : <Link2 size={14} />}
                                {linkCopied ? 'Copied' : 'Link'}
                            </button>
                        )}
                        <button onClick={handleDownloadAll} className="btn-ghost flex items-center gap-2 !py-1.5 !px-3 !text-xs">
                            <Archive size={14} /> ZIP
                        </button>
                    </div>
                </div>

                <Scorecard scorecard={guideData.scorecard} />

                {/* Tabs — underline style */}
                <div className="max-w-5xl mx-auto px-6 flex gap-1">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        const TabIcon = tab.icon;
                        const hasContent = tab.id === 'guide' ? !!guide : tab.id === 'references' ? refDocs.length > 0 : !!prompts;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                disabled={!hasContent}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-display font-medium border-b-2 transition-all duration-200
                                    ${isActive ? 'border-accent-primary text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}
                                    ${!hasContent ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <TabIcon size={14} />
                                {tab.label}
                                {tab.id === 'references' && refDocs.length > 0 && (
                                    <span className="text-[10px] font-mono bg-surface-2 px-1.5 py-0.5 rounded-full">{refDocs.length}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </header>

            <BeforeAfterTeaser guideData={guideData} />

            {/* Hero Summary */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-5xl mx-auto px-6 pt-6 pb-2"
            >
                <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(139,92,246,0.04))' }}>
                    <div className="flex-1 min-w-0">
                        <p className="section-label mb-1">Personalized for you</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
                                {heroStats.skills} skills
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary">
                                {heroStats.steps} steps
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-stone-500/10 border border-stone-500/20 text-stone-400">
                                <Clock size={12} /> {readingTime}
                            </span>
                        </div>
                    </div>
                    {guideData.quality_eval && (
                        <div className={`shrink-0 flex flex-col items-center px-4 py-2 rounded-xl border ${
                            guideData.quality_eval.passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
                        }`}>
                            <span className={`text-xl font-display font-bold ${guideData.quality_eval.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {guideData.quality_eval.mean_score}/5
                            </span>
                            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider">Quality</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 py-6">
                {onRestart && (
                    <div className="flex justify-end mb-4">
                        <button onClick={onRestart} className="btn-primary flex items-center gap-2 !py-2 !px-5 !text-sm">
                            <RefreshCw size={14} /> New Interview
                        </button>
                    </div>
                )}

                {activeTab === 'guide' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-end gap-2 mb-4">
                            <DownloadButton content={guide} filename="OPENCLAW_ONBOARDING_GUIDE.md" />
                            <CopyButton text={guide} />
                        </div>
                        <StepWizard content={guide} />
                    </motion.div>
                )}

                {activeTab === 'references' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        {refDocs.map((doc, i) => <ReferenceDocCard key={doc.name} doc={doc} index={i} />)}
                        {refDocs.length === 0 && (
                            <div className="glass rounded-2xl text-center py-16 px-6">
                                <BookOpen size={22} className="text-stone-500 mx-auto mb-3" />
                                <p className="text-stone-400 font-display font-medium">No reference documents needed</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'prompts' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-end gap-2 mb-4">
                            <CopyAllPromptsButton prompts={prompts} />
                            <DownloadButton content={prompts} filename="prompts_to_send.md" />
                            <CopyButton text={prompts} />
                        </div>
                        <div className="glass rounded-2xl p-8">
                            <MarkdownRenderer content={prompts} />
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-8 border-t border-white/[0.04]">
                {onRestart && (
                    <button onClick={onRestart} className="btn-ghost text-xs">Start a new interview →</button>
                )}
                <p className="text-[11px] font-mono text-stone-700 mt-3">
                    Guide ID: {guideData.guide_id} · EasyClaw AI Concierge
                </p>
            </footer>
        </div>
    );
};

export default OutputDisplay;
