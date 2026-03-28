import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
            <div className="bg-amber-900/80 backdrop-blur-sm border-b border-amber-500/30 px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <p className="text-sm text-amber-200 font-display">
                        {hasFullTranscript
                            ? `Previous interview recovered (from ${timeAgo}) — Skip to guide generation?`
                            : `Partial interview saved — ${backup.entries?.length || 0} turns recorded. Resume from beginning?`}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        {hasFullTranscript && (
                            <button
                                onClick={onRecover}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors"
                            >
                                Generate Guide Now
                            </button>
                        )}
                        <button
                            onClick={onDismiss}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-500/40 text-amber-300 hover:bg-amber-800/50 transition-colors"
                        >
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

    // Check for transcript backup on mount
    useEffect(() => {
        const backup = getTranscriptBackup();
        if (backup && (backup.formattedTranscript || backup.entries?.length)) {
            setRecoveryBanner(backup);
        }
    }, []);

    const dismissRecovery = useCallback(() => {
        clearTranscriptBackup();
        setRecoveryBanner(null);
    }, []);

    const handleRecoverTranscript = useCallback(() => {
        if (recoveryBanner?.formattedTranscript) {
            setTranscriptData(recoveryBanner.formattedTranscript);
            setRecoveryBanner(null);
            setPhase('selecting');
        }
    }, [recoveryBanner]);

    const handleStartInterview = useCallback(() => {
        setRecoveryBanner(null);
        setPhase('interview');
    }, []);

    const handleDemoMode = useCallback(() => {
        setRecoveryBanner(null);
        setPhase('demo-interview');
    }, []);

    const handleInterviewComplete = useCallback((transcript) => {
        setTranscriptData(transcript);
        setPhase('selecting');
    }, []);

    const handleOutputSelection = useCallback((outputs) => {
        setSelectedOutputs(outputs);
        setPhase('processing');
    }, []);

    const handleMockDemo = useCallback(async (demoId = 'demo-restaurant') => {
        // Use demo-stream for accelerated SSE playback (~20s instead of 5-10min)
        // Falls back to instant mock-generate if SSE fails
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPhase('mock-loading');
        
        try {
            const evtSource = new EventSource(`${API_BASE}/demo-stream/${encodeURIComponent(demoId)}`);
            
            evtSource.addEventListener('progress', (e) => {
                // Progress events handled by LoadingScreen via phase state
                // We just need to keep the phase as mock-loading during stream
            });
            
            evtSource.addEventListener('complete', (e) => {
                evtSource.close();
                try {
                    const data = JSON.parse(e.data);
                    setMockGuide(data);
                    setPhase('mock-output');
                } catch (err) {
                    console.error('Demo stream parse failed:', err);
                    setPhase('landing');
                }
            });
            
            evtSource.addEventListener('error', async () => {
                evtSource.close();
                // Fallback to instant load
                try {
                    const res = await fetch(`${API_BASE}/mock-generate?demo_id=${encodeURIComponent(demoId)}`);
                    if (!res.ok) throw new Error(`Server returned ${res.status}`);
                    const data = await res.json();
                    setMockGuide(data);
                    setPhase('mock-output');
                } catch (err) {
                    console.error('Mock fallback failed:', err);
                    setPhase('landing');
                }
            });
            
        } catch (err) {
            console.error('Demo stream setup failed:', err);
            setPhase('landing');
        }
    }, []);

    // Demo interview completes → use golden path (fast, reliable)
    const handleDemoInterviewComplete = useCallback(() => {
        handleMockDemo('demo-restaurant'); // closest match to demo-interview persona
    }, [handleMockDemo]);

    const handleResume = useCallback((formattedTranscript) => {
        setTranscriptData(formattedTranscript);
        setPhase('selecting');
    }, []);

    const handleRestart = useCallback(() => {
        setTranscriptData(null);
        setMockGuide(null);
        setPhase('landing');
    }, []);

    // Demo reset toast
    const [showResetToast, setShowResetToast] = useState(false);

    // Ctrl/Cmd+Shift+D → instant demo reset
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setTranscriptData(null);
                setMockGuide(null);
                setPhase('landing');
                setShowResetToast(true);
                setTimeout(() => setShowResetToast(false), 1500);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    if (phase === 'landing') {
        return (
            <>
                {recoveryBanner && (
                    <RecoveryBanner
                        backup={recoveryBanner}
                        onRecover={handleRecoverTranscript}
                        onDismiss={dismissRecovery}
                    />
                )}
                <EasyClawLanding onStart={handleStartInterview} onDemo={handleMockDemo} onResume={handleResume} onDemoMode={handleDemoMode} />
                {showResetToast && <ResetToast />}
            </>
        );
    }

    if (phase === 'interview') {
        return (
            <InterviewView
                onInterviewComplete={handleInterviewComplete}
                onBack={() => setPhase('landing')}
            />
        );
    }

    if (phase === 'demo-interview') {
        return (
            <DemoInterviewView
                onInterviewComplete={handleDemoInterviewComplete}
                onBack={() => setPhase('landing')}
            />
        );
    }

    if (phase === 'selecting') {
        return (
            <OutputSelector
                onGenerate={handleOutputSelection}
                onBack={() => setPhase('landing')}
            />
        );
    }

    if (phase === 'mock-loading') {
        return <LoadingScreen isDemo />;
    }

    if (phase === 'mock-output') {
        return (
            <OutputDisplay
                guideData={mockGuide}
                onBack={handleRestart}
                onRestart={handleRestart}
            />
        );
    }

    return (
        <>
            <SetupGuideView
                transcriptData={transcriptData}
                selectedOutputs={selectedOutputs}
                onBack={handleRestart}
                onRestart={handleRestart}
            />
            {showResetToast && <ResetToast />}
        </>
    );
}

function ResetToast() {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
            <div className="glass rounded-xl px-5 py-3 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <span className="text-sm font-display font-medium text-emerald-400">
                    Demo Reset ✓
                </span>
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
        </ErrorBoundary>
    );
}

export default App;
