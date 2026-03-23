import React, { useState, useEffect, useRef } from 'react';
import LoadingScreen from './components/LoadingScreen';
import OutputDisplay from './components/OutputDisplay';

const POLL_INTERVAL = 3000; // 3 seconds

export default function SetupGuideView({ transcriptData, onBack, onRestart }) {
    const [guideData, setGuideData] = useState(null);
    const [loading, setLoading] = useState(true);
    const pollRef = useRef(null);

    useEffect(() => {
        if (!transcriptData) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function startGeneration() {
            try {
                // Kick off background generation
                const res = await fetch('/generate-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ formatted_transcript: transcriptData }),
                });
                const data = await res.json();

                if (cancelled) return;

                const guideId = data.guide_id;
                if (!guideId) {
                    setGuideData({ status: 'error', message: 'No guide ID returned' });
                    setLoading(false);
                    return;
                }

                // Poll until complete or error
                pollRef.current = setInterval(async () => {
                    try {
                        const pollRes = await fetch(`/guide/${guideId}`);
                        const pollData = await pollRes.json();

                        if (cancelled) return;

                        if (pollData.status === 'complete' || pollData.status === 'error') {
                            clearInterval(pollRef.current);
                            setGuideData(pollData);
                            setLoading(false);
                        }
                    } catch (pollErr) {
                        console.error('Poll failed:', pollErr);
                    }
                }, POLL_INTERVAL);

            } catch (err) {
                console.error('Guide generation failed:', err);
                if (!cancelled) {
                    setGuideData({
                        guide_id: 'error',
                        status: 'error',
                        message: `Failed to start guide generation: ${err.message}`,
                        outputs: { setup_guide: null, reference_documents: [], prompts_to_send: null },
                    });
                    setLoading(false);
                }
            }
        }

        startGeneration();

        return () => {
            cancelled = true;
            if (pollRef.current) clearInterval(pollRef.current);
        };
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
