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

const API_BASE = import.meta.env.VITE_API_BASE || '';

function MainFlow() {
    const [phase, setPhase] = useState('landing');
    const [transcriptData, setTranscriptData] = useState(null);
    const [mockGuide, setMockGuide] = useState(null);

    const handleStartInterview = useCallback(() => {
        setPhase('interview');
    }, []);

    const handleDemoMode = useCallback(() => {
        setPhase('demo-interview');
    }, []);

    const handleInterviewComplete = useCallback((transcript) => {
        setTranscriptData(transcript);
        setPhase('processing');
    }, []);

    const handleMockDemo = useCallback(async (demoId = 'demo-restaurant') => {
        // Use demo-stream for accelerated SSE playback (~20s instead of 5-10min)
        // Falls back to instant mock-generate if SSE fails
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
        setPhase('processing');
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
