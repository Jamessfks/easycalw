import { useState, useCallback } from 'react';
import EasyClawLanding from './EasyClawLanding';
import InterviewView from './InterviewView';
import SetupGuideView from './SetupGuideView';

function App() {
    const [phase, setPhase] = useState('landing');
    const [transcriptData, setTranscriptData] = useState(null);

    const handleStartInterview = useCallback(() => {
        setPhase('interview');
    }, []);

    const handleInterviewComplete = useCallback((transcript) => {
        setTranscriptData(transcript);
        setPhase('processing');
    }, []);

    const handleRestart = useCallback(() => {
        setTranscriptData(null);
        setPhase('landing');
    }, []);

    if (phase === 'landing') {
        return <EasyClawLanding onStart={handleStartInterview} />;
    }

    if (phase === 'interview') {
        return (
            <InterviewView
                onInterviewComplete={handleInterviewComplete}
                onBack={() => setPhase('landing')}
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

export default App;
