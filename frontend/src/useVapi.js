import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { saveTranscriptBackup, clearTranscriptBackup } from './lib/transcriptBackup';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

const API_BASE = import.meta.env.VITE_API_BASE || '';
const BACKUP_INTERVAL = 5; // save backup every N final entries

export default function useVapi() {
    const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active | ended
    const [voiceState, setVoiceState] = useState('idle'); // idle | user-speaking | agent-thinking | agent-speaking
    const [transcript, setTranscript] = useState([]);      // Array of { role, text, timestamp, isFinal }
    const [formattedTranscript, setFormattedTranscript] = useState(null);
    const [error, setError] = useState(null);
    const fullTranscriptRef = useRef([]);
    const vapiRef = useRef(null);

    // Initialize Vapi instance once
    useEffect(() => {
        if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
            console.error(
                'Missing VAPI config. Set VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in your .env file.'
            );
            setError('Voice service not configured. Check environment variables.');
            return;
        }

        const vapi = new Vapi(VAPI_PUBLIC_KEY);
        vapiRef.current = vapi;

        // --- Call lifecycle ---
        vapi.on('call-start', () => {
            setCallStatus('active');
            setVoiceState('idle');
            setError(null);
        });

        vapi.on('call-end', () => {
            setCallStatus('ended');
            setVoiceState('idle');

            // POST accumulated transcript to formatter
            const accumulated = fullTranscriptRef.current;
            if (accumulated.length > 0) {
                const transcriptText = accumulated
                    .filter(e => e.isFinal)
                    .map(e => `${e.role === 'user' ? 'User' : 'Agent'}: ${e.text}`)
                    .join('\n');

                fetch(`${API_BASE}/format`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transcript: transcriptText }),
                })
                    .then(res => {
                        if (!res.ok) throw new Error(`Format API returned ${res.status}`);
                        return res.json();
                    })
                    .then(data => {
                        setFormattedTranscript(data.formatted);
                        // Save formatted transcript to backup for crash recovery
                        saveTranscriptBackup(fullTranscriptRef.current, data.formatted);
                    })
                    .catch(err => {
                        console.error('Failed to POST transcript:', err);
                        setFormattedTranscript(transcriptText);
                        saveTranscriptBackup(fullTranscriptRef.current, transcriptText);
                    });
            }
        });

        // --- Speech events (agent-side) ---
        vapi.on('speech-start', () => {
            setVoiceState('agent-speaking');
        });

        vapi.on('speech-end', () => {
            setVoiceState('idle');
        });

        // --- Error handling ---
        vapi.on('error', (err) => {
            console.error('[VAPI] Error:', err);
            setError(err?.message || 'Voice call encountered an error');
            setCallStatus('ended');
            setVoiceState('idle');
        });

        // --- Transcript messages ---
        vapi.on('message', (msg) => {
            if (msg.type === 'transcript') {
                const role = msg.role === 'assistant' ? 'agent' : 'user';
                const entry = {
                    role,
                    text: msg.transcript,
                    timestamp: Date.now(),
                    isFinal: msg.transcriptType === 'final',
                };

                if (entry.isFinal) {
                    setTranscript(prev => {
                        const lastIdx = prev.length - 1;
                        if (lastIdx >= 0 && !prev[lastIdx].isFinal && prev[lastIdx].role === role) {
                            const updated = [...prev];
                            updated[lastIdx] = entry;
                            return updated;
                        }
                        return [...prev, entry];
                    });
                    fullTranscriptRef.current = [...fullTranscriptRef.current, entry];

                    // Periodically save transcript backup for crash recovery
                    if (fullTranscriptRef.current.length % BACKUP_INTERVAL === 0) {
                        saveTranscriptBackup(fullTranscriptRef.current, null);
                    }

                    if (role === 'user') {
                        setVoiceState('agent-thinking');
                    }
                } else {
                    setTranscript(prev => {
                        const lastIdx = prev.length - 1;
                        if (lastIdx >= 0 && !prev[lastIdx].isFinal && prev[lastIdx].role === role) {
                            const updated = [...prev];
                            updated[lastIdx] = entry;
                            return updated;
                        }
                        return [...prev, entry];
                    });

                    if (role === 'user') {
                        setVoiceState('user-speaking');
                    }
                }
            }
        });

        // Cleanup on unmount
        return () => {
            vapi.stop();
        };
    }, []);

    const startCall = useCallback(() => {
        if (vapiRef.current && callStatus === 'idle') {
            setCallStatus('connecting');
            setTranscript([]);
            setFormattedTranscript(null);
            setError(null);
            fullTranscriptRef.current = [];
            clearTranscriptBackup(); // fresh start
            vapiRef.current.start(VAPI_ASSISTANT_ID);
        }
    }, [callStatus]);

    const endCall = useCallback(() => {
        if (vapiRef.current && callStatus === 'active') {
            vapiRef.current.stop();
        }
    }, [callStatus]);

    return {
        callStatus,
        voiceState,
        transcript,
        formattedTranscript,
        error,
        startCall,
        endCall,
    };
}
