import { useState } from 'react';
import StartScreen from './StartScreen';
import InterviewView from './InterviewView';
import SetupGuideView from './SetupGuideView';

function App() {
    const [phase, setPhase] = useState('start'); // start | interview | loading | output
    const [guideData, setGuideData] = useState(null);

    const handleInterviewComplete = async (formattedTranscript) => {
        setPhase('loading');

        try {
            // Trigger guide generation via RocketRide pipeline
            const res = await fetch('/generate-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formatted_transcript: formattedTranscript }),
            });
            const result = await res.json();

            if (result.status === 'complete') {
                setGuideData(result.outputs);
                setPhase('output');
            } else {
                console.error('Guide generation failed:', result.message);
                setGuideData(null);
                setPhase('output');
            }
        } catch (err) {
            console.error('Failed to generate guide:', err);
            setGuideData(null);
            setPhase('output');
        }
    };

    if (phase === 'start') {
        return <StartScreen onStart={() => setPhase('interview')} />;
    }

    if (phase === 'interview') {
        return <InterviewView onInterviewComplete={handleInterviewComplete} />;
    }

    return <SetupGuideView guideReady={phase === 'output'} guideData={guideData} />;
}

export default App;
