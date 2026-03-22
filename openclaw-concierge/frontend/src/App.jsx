import { useState } from 'react';
import InterviewView from './InterviewView';
import SetupGuideView from './SetupGuideView';

function App() {
    const [phase, setPhase] = useState('interview'); // interview | loading | output

    if (phase === 'interview') {
        return <InterviewView onInterviewComplete={() => setPhase('loading')} />;
    }

    return <SetupGuideView guideReady={phase === 'output'} />;
}

export default App;
