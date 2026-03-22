import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

const VAPI_PUBLIC_KEY = '5bd9e5c5-dd9e-4021-b13d-9d6fa8395dc0';
const VAPI_ASSISTANT_ID = '6aff492d-aa3b-4aaa-a9f3-8d51440dd825';

export default function useVapi() {
    const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active | ended
    const [voiceState, setVoiceState] = useState('idle'); // idle | user-speaking | agent-thinking | agent-speaking
    const [transcript, setTranscript] = useState([]);      // Array of { role, text, timestamp, isFinal }
    const fullTranscriptRef = useRef([]);                   // Accumulated for POST on call-end
    const vapiRef = useRef(null);

    // Initialize Vapi instance once
    useEffect(() => {
        const vapi = new Vapi(VAPI_PUBLIC_KEY);
        vapiRef.current = vapi;

        // --- Call lifecycle ---
        vapi.on('call-start', () => {
            setCallStatus('active');
            setVoiceState('idle');
        });

        vapi.on('call-end', () => {
            setCallStatus('ended');
            setVoiceState('idle');

            // POST accumulated transcript to backend as fallback
            const accumulated = fullTranscriptRef.current;
            if (accumulated.length > 0) {
                const transcriptText = accumulated
                    .filter(e => e.isFinal)
                    .map(e => `${e.role === 'user' ? 'User' : 'Agent'}: ${e.text}`)
                    .join('\n');

                fetch('/format', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transcript: transcriptText }),
                }).catch(err => console.error('Failed to POST transcript:', err));
            }
        });

        // --- Speech events (agent-side) ---
        // speech-start fires when the agent starts speaking
        vapi.on('speech-start', () => {
            setVoiceState('agent-speaking');
        });

        // speech-end fires when the agent stops speaking
        vapi.on('speech-end', () => {
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
                    // Append final entry to display transcript and accumulator
                    setTranscript(prev => [...prev, entry]);
                    fullTranscriptRef.current = [...fullTranscriptRef.current, entry];

                    // Update voice state based on who just finished speaking
                    if (role === 'user') {
                        setVoiceState('agent-thinking');
                    }
                } else {
                    // Update the last partial entry for this role
                    setTranscript(prev => {
                        const lastIdx = prev.length - 1;
                        if (lastIdx >= 0 && !prev[lastIdx].isFinal && prev[lastIdx].role === role) {
                            const updated = [...prev];
                            updated[lastIdx] = entry;
                            return updated;
                        }
                        return [...prev, entry];
                    });

                    // User is speaking if we're getting user partials
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
            fullTranscriptRef.current = [];
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
        startCall,
        endCall,
    };
}
