import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import OutputDisplay from './components/OutputDisplay';

const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 200; // 10 min max

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function GuidePageView() {
    const { guideId } = useParams();
    const navigate = useNavigate();
    const [guideData, setGuideData] = useState(null);
    const [loading, setLoading] = useState(true);
    const pollCountRef = useRef(0);

    useEffect(() => {
        let cancelled = false;
        let interval = null;

        async function fetchGuide() {
            pollCountRef.current += 1;

            if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
                if (interval) clearInterval(interval);
                setGuideData({
                    guide_id: guideId,
                    status: 'error',
                    message: 'Timed out waiting for guide. It may still be generating — try refreshing.',
                    outputs: {},
                });
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/guide/${guideId}`);
                if (!res.ok) return; // transient, keep polling

                const data = await res.json();
                if (cancelled) return;

                if (data.status === 'complete' || data.status === 'error' || data.status === 'not_found') {
                    setGuideData(data);
                    setLoading(false);
                    if (interval) clearInterval(interval);
                } else if (data.status === 'generating' && !interval) {
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
