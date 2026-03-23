import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EasyClawLanding from './EasyClawLanding';
import InterviewView from './InterviewView';
import SetupGuideView from './SetupGuideView';
import OutputDisplay from './components/OutputDisplay';
import LoadingScreen from './components/LoadingScreen';
import GuidePageView from './GuidePageView';

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

    const handleMockDemo = useCallback(async () => {
        setPhase('mock-loading');
        try {
            const res = await fetch('/mock-generate');
            const data = await res.json();
            setMockGuide(data);
            setPhase('mock-output');
        } catch (err) {
            console.error('Mock failed:', err);
            setPhase('landing');
        }
    }, []);

    const handleRestart = useCallback(() => {
        setTranscriptData(null);
        setMockGuide(null);
        setPhase('landing');
    }, []);

    if (phase === 'landing') {
        return <EasyClawLanding onStart={handleStartInterview} onDemo={handleMockDemo} />;
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
        <BrowserRouter>
            <Routes>
                <Route path="/view/:guideId" element={<GuidePageView />} />
                <Route path="*" element={<MainFlow />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
