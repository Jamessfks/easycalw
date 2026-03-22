import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import OutputDisplay from './components/OutputDisplay';

export default function SetupGuideView({ transcriptData, onBack, onRestart }) {
    const [guideData, setGuideData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!transcriptData) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function generateGuide() {
            try {
                const res = await fetch('/generate-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ formatted_transcript: transcriptData }),
                });
                const data = await res.json();
                if (!cancelled) {
                    setGuideData(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Guide generation failed:', err);
                if (!cancelled) {
                    setGuideData({
                        guide_id: 'error',
                        status: 'error',
                        message: `Failed to generate guide: ${err.message}`,
                        outputs: { setup_guide: null, reference_documents: [], prompts_to_send: null },
                    });
                    setLoading(false);
                }
            }
        }

        generateGuide();
        return () => { cancelled = true; };
    }, [transcriptData]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <OutputDisplay
            guideData={guideData}
            onBack={onBack}
            onRestart={onRestart}
        />
    );
}
