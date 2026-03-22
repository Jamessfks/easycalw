import { useState } from 'react';
import EasyClawLanding from './EasyClawLanding';
import InterviewView from './InterviewView';
import SetupGuideView from './SetupGuideView';

export default function App() {
    const [phase, setPhase] = useState('landing');

    if (phase === 'landing') {
        return <EasyClawLanding onStart={() => setPhase('interview')} />;
    }

    if (phase === 'interview') {
        return (
            <InterviewView
                onBack={() => setPhase('landing')}
                onInterviewComplete={() => setPhase('guide')}
            />
        );
    }

    return (
        <SetupGuideView
            onBack={() => setPhase('landing')}
        />
    );
}
