import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 200;

/**
 * Hook that manages guide generation with SSE streaming + polling fallback.
 *
 * 1. POSTs to /generate-guide to get a guide_id
 * 2. Opens EventSource to /events/{guide_id} for real-time progress
 * 3. Falls back to polling /guide/{guide_id} if SSE fails
 *
 * Returns { guideData, loading, progress }
 */
export default function useGuideStream(formattedTranscript, selectedOutputs) {
    const [guideData, setGuideData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState({
        stage: 'Initializing...',
        turn: 0,
        maxTurns: 40,
        cost: 0,
        tokens: 0,
        docStatuses: {},
    });

    const eventSourceRef = useRef(null);
    const pollRef = useRef(null);
    const pollCountRef = useRef(0);
    const receivedEventsRef = useRef(false);

    useEffect(() => {
        if (!formattedTranscript) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function start() {
            try {
                // Step 1: Kick off generation
                const res = await fetch(`${API_BASE}/generate-guide`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        formatted_transcript: formattedTranscript,
                        ...(selectedOutputs ? { selected_outputs: selectedOutputs } : {}),
                    }),
                });

                if (!res.ok) {
                    throw new Error(`Server returned ${res.status}: ${res.statusText}`);
                }

                const data = await res.json();
                if (cancelled) return;

                const guideId = data.guide_id;
                if (!guideId) {
                    setGuideData({ status: 'error', message: 'No guide ID returned' });
                    setLoading(false);
                    return;
                }

                // Step 2: Try SSE
                try {
                    const es = new EventSource(`${API_BASE}/events/${guideId}`);
                    eventSourceRef.current = es;

                    es.addEventListener('progress', (e) => {
                        if (cancelled) return;
                        receivedEventsRef.current = true;
                        const payload = JSON.parse(e.data);
                        setProgress(prev => ({
                            ...prev,
                            stage: payload.stage || prev.stage,
                            turn: payload.turn ?? prev.turn,
                            maxTurns: payload.max_turns ?? prev.maxTurns,
                            cost: payload.cost ?? prev.cost,
                            tokens: payload.tokens ?? prev.tokens,
                        }));
                    });

                    es.addEventListener('doc_status', (e) => {
                        if (cancelled) return;
                        receivedEventsRef.current = true;
                        const payload = JSON.parse(e.data);
                        setProgress(prev => ({
                            ...prev,
                            docStatuses: {
                                ...prev.docStatuses,
                                [payload.doc]: { status: payload.status, chars: payload.chars, count: payload.count },
                            },
                        }));
                    });

                    es.addEventListener('complete', (e) => {
                        if (cancelled) return;
                        receivedEventsRef.current = true;
                        const payload = JSON.parse(e.data);
                        // The agent sends a lightweight "complete" event (no outputs),
                        // then guide_store sends the full one. Only accept if it has outputs.
                        if (payload.outputs?.setup_guide || payload.status === 'error') {
                            setGuideData(payload);
                            setLoading(false);
                            es.close();
                        }
                        // Otherwise wait for the next complete event with full data
                    });

                    es.addEventListener('error', (e) => {
                        // Named 'error' event from our backend (not the EventSource onerror)
                        if (e.data) {
                            const payload = JSON.parse(e.data);
                            setGuideData({ status: 'error', message: payload.message });
                            setLoading(false);
                            es.close();
                        }
                    });

                    es.onerror = () => {
                        // If we never received any events, SSE isn't working — fall back
                        if (!receivedEventsRef.current) {
                            es.close();
                            eventSourceRef.current = null;
                            startPolling(guideId);
                        } else {
                            // SSE closed after receiving events but before full data —
                            // do a final poll to get the complete guide
                            es.close();
                            eventSourceRef.current = null;
                            startPolling(guideId);
                        }
                    };
                } catch {
                    // EventSource constructor failed — fall back to polling
                    startPolling(guideId);
                }

            } catch (err) {
                if (!cancelled) {
                    setGuideData({
                        status: 'error',
                        message: `Failed to start guide generation: ${err.message}`,
                        outputs: {},
                    });
                    setLoading(false);
                }
            }
        }

        function startPolling(guideId) {
            pollCountRef.current = 0;
            pollRef.current = setInterval(async () => {
                pollCountRef.current += 1;

                if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
                    clearInterval(pollRef.current);
                    setGuideData({
                        guide_id: guideId,
                        status: 'error',
                        message: 'Guide generation timed out. Try refreshing or check /guide/' + guideId,
                        outputs: {},
                    });
                    setLoading(false);
                    return;
                }

                try {
                    const pollRes = await fetch(`${API_BASE}/guide/${guideId}`);
                    if (!pollRes.ok) return;

                    const pollData = await pollRes.json();
                    if (cancelled) return;

                    if (pollData.status === 'complete' || pollData.status === 'error') {
                        clearInterval(pollRef.current);
                        setGuideData(pollData);
                        setLoading(false);
                    }
                } catch {
                    // transient error, keep polling
                }
            }, POLL_INTERVAL);
        }

        start();

        return () => {
            cancelled = true;
            if (eventSourceRef.current) eventSourceRef.current.close();
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [formattedTranscript]);

    return { guideData, loading, progress };
}
