import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import EasyClawLanding from './EasyClawLanding';
import InterviewView from './InterviewView';
import DemoInterviewView from './DemoInterviewView';
import SetupGuideView from './SetupGuideView';
import OutputDisplay from './components/OutputDisplay';
import LoadingScreen from './components/LoadingScreen';
import GuidePageView from './GuidePageView';
import OutputSelector from './OutputSelector';
import { getTranscriptBackup, clearTranscriptBackup } from './lib/transcriptBackup';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function formatTimeAgo(isoString) {
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function RecoveryBanner({ backup, onRecover, onDismiss }) {
    const hasFullTranscript = !!backup.formattedTranscript;
    const timeAgo = formatTimeAgo(backup.savedAt);

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <div className="bg-accent-primary/90 backdrop-blur-sm border-b border-accent-hover/30 px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <p className="text-sm text-white font-display">
                        {hasFullTranscript
                            ? `Interview recovered (${timeAgo}) — skip to guide generation?`
                            : `Partial interview — ${backup.entries?.length || 0} turns recorded.`}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        {hasFullTranscript && (
                            <button onClick={onRecover}
                                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white text-accent-hover hover:bg-stone-100 transition-colors">
                                Generate Guide
                            </button>
                        )}
                        <button onClick={onDismiss}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-white/40 text-white hover:bg-white/10 transition-colors">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MainFlow() {
    const [phase, setPhase] = useState('landing');
    const [transcriptData, setTranscriptData] = useState(null);
    const [selectedOutputs, setSelectedOutputs] = useState(null);
    const [mockGuide, setMockGuide] = useState(null);
    const [recoveryBanner, setRecoveryBanner] = useState(null);

    useEffect(() => {
        const backup = getTranscriptBackup();
        if (backup && (backup.formattedTranscript || backup.entries?.length)) {
            setRecoveryBanner(backup);
        }
    }, []);

    const dismissRecovery = useCallback(() => { clearTranscriptBackup(); setRecoveryBanner(null); }, []);
    const handleRecoverTranscript = useCallback(() => {
        if (recoveryBanner?.formattedTranscript) {
            setTranscriptData(recoveryBanner.formattedTranscript);
            setRecoveryBanner(null);
            setPhase('selecting');
        }
    }, [recoveryBanner]);

    const handleStartInterview = useCallback(() => { setRecoveryBanner(null); setPhase('interview'); }, []);
    const handleDemoMode = useCallback(() => { setRecoveryBanner(null); setPhase('demo-interview'); }, []);
    const handleInterviewComplete = useCallback((transcript) => { setTranscriptData(transcript); setPhase('selecting'); }, []);
    const handleOutputSelection = useCallback((outputs) => { setSelectedOutputs(outputs); setPhase('processing'); }, []);

    const handleMockDemo = useCallback(async (demoId = 'demo-restaurant') => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPhase('mock-loading');
        try {
            const evtSource = new EventSource(`${API_BASE}/demo-stream/${encodeURIComponent(demoId)}`);
            evtSource.addEventListener('complete', (e) => {
                evtSource.close();
                try { setMockGuide(JSON.parse(e.data)); setPhase('mock-output'); }
                catch { setPhase('landing'); }
            });
            evtSource.addEventListener('error', async () => {
                evtSource.close();
                try {
                    const res = await fetch(`${API_BASE}/mock-generate?demo_id=${encodeURIComponent(demoId)}`);
                    if (!res.ok) throw new Error();
                    setMockGuide(await res.json()); setPhase('mock-output');
                } catch { setPhase('landing'); }
            });
        } catch { setPhase('landing'); }
    }, []);

    const handleDemoInterviewComplete = useCallback(() => handleMockDemo('demo-restaurant'), [handleMockDemo]);
    const handleResume = useCallback((ft) => { setTranscriptData(ft); setPhase('selecting'); }, []);
    const handleRestart = useCallback(() => { setTranscriptData(null); setMockGuide(null); setPhase('landing'); }, []);

    const [showResetToast, setShowResetToast] = useState(false);
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setTranscriptData(null); setMockGuide(null); setPhase('landing');
                setShowResetToast(true);
                setTimeout(() => setShowResetToast(false), 1500);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const renderPhase = () => {
        switch (phase) {
            case 'landing':
                return (
                    <>
                        {recoveryBanner && <RecoveryBanner backup={recoveryBanner} onRecover={handleRecoverTranscript} onDismiss={dismissRecovery} />}
                        <EasyClawLanding onStart={handleStartInterview} onDemo={handleMockDemo} onResume={handleResume} onDemoMode={handleDemoMode} />
                    </>
                );
            case 'interview':
                return <InterviewView onInterviewComplete={handleInterviewComplete} onBack={() => setPhase('landing')} />;
            case 'demo-interview':
                return <DemoInterviewView onInterviewComplete={handleDemoInterviewComplete} onBack={() => setPhase('landing')} />;
            case 'selecting':
                return <OutputSelector onGenerate={handleOutputSelection} onBack={() => setPhase('landing')} />;
            case 'mock-loading':
                return <LoadingScreen isDemo />;
            case 'mock-output':
                return <OutputDisplay guideData={mockGuide} onBack={handleRestart} onRestart={handleRestart} />;
            default:
                return <SetupGuideView transcriptData={transcriptData} selectedOutputs={selectedOutputs} onBack={handleRestart} onRestart={handleRestart} />;
        }
    };

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div key={phase} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    {renderPhase()}
                </motion.div>
            </AnimatePresence>
            {showResetToast && <ResetToast />}
        </>
    );
}

function ResetToast() {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
            <div className="glass rounded-full px-5 py-2.5 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <span className="text-sm font-display font-medium text-emerald-400">Reset ✓</span>
            </div>
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/view/:guideId" element={<GuidePageView />} />
                    <Route path="*" element={<MainFlow />} />
                </Routes>
            </BrowserRouter>
            <Analytics />
        </ErrorBoundary>
    );
}

export default App;
