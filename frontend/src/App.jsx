import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import EasyClawLanding from './EasyClawLanding';
import InterviewView from './InterviewView';
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

    const handleInterviewComplete = useCallback((transcript) => {
        setTranscriptData(transcript);
        setPhase('processing');
    }, []);

    const handleMockDemo = useCallback(async (demoId = 'demo-restaurant') => {
        setPhase('mock-loading');
        try {
            const res = await fetch(`${API_BASE}/mock-generate?demo_id=${encodeURIComponent(demoId)}`);
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            setMockGuide(data);
            setPhase('mock-output');
        } catch (err) {
            console.error('Mock failed:', err);
            setPhase('landing');
        }
    }, []);

    const handleResume = useCallback((formattedTranscript) => {
        setTranscriptData(formattedTranscript);
        setPhase('processing');
    }, []);

    const handleRestart = useCallback(() => {
        setTranscriptData(null);
        setMockGuide(null);
        setPhase('landing');
    }, []);

    if (phase === 'landing') {
        return <EasyClawLanding onStart={handleStartInterview} onDemo={handleMockDemo} onResume={handleResume} />;
    }

    if (phase === 'interview') {
        return (
            <InterviewView
                onInterviewComplete={handleInterviewComplete}
                onBack={() => setPhase('landing')}
            />
        );
    }

    if (phase === 'mock-loading') {
        return <LoadingScreen />;
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
        <SetupGuideView
            transcriptData={transcriptData}
            onBack={handleRestart}
            onRestart={handleRestart}
        />
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
