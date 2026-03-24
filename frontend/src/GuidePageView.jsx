import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import OutputDisplay from './components/OutputDisplay';

const POLL_INTERVAL = 3000;

export default function GuidePageView() {
    const { guideId } = useParams();
    const navigate = useNavigate();
    const [guideData, setGuideData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        let interval = null;

        async function fetchGuide() {
            try {
                const res = await fetch(`/guide/${guideId}`);
                const data = await res.json();
                if (cancelled) return;

                if (data.status === 'complete' || data.status === 'error' || data.status === 'not_found') {
                    setGuideData(data);
                    setLoading(false);
                    if (interval) clearInterval(interval);
                } else if (data.status === 'generating' && !interval) {
                    // Still generating — start polling
                    interval = setInterval(fetchGuide, POLL_INTERVAL);
                }
            } catch (err) {
                console.error('Failed to fetch guide:', err);
                if (!cancelled) {
                    setGuideData({ status: 'error', message: `Failed to load guide: ${err.message}` });
                    setLoading(false);
                }
            }
        }

        fetchGuide();

        return () => {
            cancelled = true;
            if (interval) clearInterval(interval);
        };
    }, [guideId]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <OutputDisplay
            guideData={guideData}
            onBack={() => navigate('/')}
            onRestart={() => navigate('/')}
        />
    );
}
