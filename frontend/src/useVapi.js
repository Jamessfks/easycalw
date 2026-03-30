import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { saveTranscriptBackup, clearTranscriptBackup } from './lib/transcriptBackup';

const IS_LOCALHOST =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const LOCALHOST_VAPI_PUBLIC_KEY =
    import.meta.env.DEV && IS_LOCALHOST ? '5bd9e5c5-dd9e-4021-b13d-9d6fa8395dc0' : '';
const LOCALHOST_VAPI_ASSISTANT_ID =
    import.meta.env.DEV && IS_LOCALHOST ? 'a53bb710-ddba-4c5c-9952-f8442b912d2f' : '';

const ENV_VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || LOCALHOST_VAPI_PUBLIC_KEY;
const ENV_VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || LOCALHOST_VAPI_ASSISTANT_ID;

const API_BASE = import.meta.env.VITE_API_BASE || '';
const BACKUP_INTERVAL = 5; // save backup every N final entries

const CONNECTION_TIMEOUT_MS = 30000;

export default function useVapi() {
    const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active | ended
    const [voiceState, setVoiceState] = useState('idle'); // idle | user-speaking | agent-thinking | agent-speaking
    const [transcript, setTranscript] = useState([]);      // Array of { role, text, timestamp, isFinal }
    const [formattedTranscript, setFormattedTranscript] = useState(null);
    const [error, setError] = useState(null);
    const [configStatus, setConfigStatus] = useState('loading'); // loading | ready | error
    const fullTranscriptRef = useRef([]);
    const vapiRef = useRef(null);
    const vapiConfigRef = useRef({
        publicKey: ENV_VAPI_PUBLIC_KEY,
        assistantId: ENV_VAPI_ASSISTANT_ID,
    });
    const connectTimeoutRef = useRef(null);
    const retryCountRef = useRef(0);

    // Initialize Vapi instance once
    useEffect(() => {
        let cancelled = false;

        async function loadConfig() {
            let publicKey = ENV_VAPI_PUBLIC_KEY;
            let assistantId = ENV_VAPI_ASSISTANT_ID;

            if (publicKey && assistantId) {
                return { publicKey, assistantId };
            }

            try {
                const res = await fetch(`${API_BASE}/client-config`);
                if (!res.ok) {
                    throw new Error(`Config API returned ${res.status}`);
                }
                const data = await res.json();
                publicKey = data?.voice?.public_key || '';
                assistantId = data?.voice?.assistant_id || '';
            } catch (err) {
                throw new Error(
                    'Voice service not configured. Start the backend with backend/.env or set VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in frontend/.env.'
                );
            }

            if (!publicKey || !assistantId) {
                throw new Error(
                    'Voice service not configured. Set VAPI_PUBLIC_KEY and VAPI_ASSISTANT_ID in backend/.env, or set VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in frontend/.env.'
                );
            }

            return { publicKey, assistantId };
        }

        async function initVapi() {
            try {
                const config = await loadConfig();
                if (cancelled) return;

                vapiConfigRef.current = config;
                const vapi = new Vapi(config.publicKey);
                vapiRef.current = vapi;

                // --- Call lifecycle ---
                vapi.on('call-start', () => {
                    if (connectTimeoutRef.current) {
                        clearTimeout(connectTimeoutRef.current);
                        connectTimeoutRef.current = null;
                    }
                    setCallStatus('active');
                    setVoiceState('idle');
                    setError(null);
                });

                vapi.on('call-end', () => {
                    setVoiceState('idle');

                    // Grace period — let any in-flight transcript messages arrive before
                    // we set 'ended' (which triggers the isTooShort check in InterviewView)
                    setTimeout(() => {
                        setCallStatus('ended');
                    }, 800);

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

                // --- Error handling with auto-retry ---
                vapi.on('error', (err) => {
                    console.error('[VAPI] Error:', err);
                    if (connectTimeoutRef.current) {
                        clearTimeout(connectTimeoutRef.current);
                        connectTimeoutRef.current = null;
                    }
                    if (retryCountRef.current < 1) {
                        retryCountRef.current += 1;
                        console.log('[VAPI] Auto-retrying after error...');
                        setTimeout(() => {
                            if (vapiRef.current) {
                                setCallStatus('connecting');
                                vapiRef.current.start(vapiConfigRef.current.assistantId);
                            }
                        }, 2000);
                    } else {
                        setError(err?.message || 'Voice call encountered an error');
                        setCallStatus('ended');
                        setVoiceState('idle');
                    }
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

                setConfigStatus('ready');
            } catch (err) {
                if (cancelled) return;
                console.error('Failed to initialize Vapi:', err);
                setConfigStatus('error');
                setError(err?.message || 'Voice service not configured.');
            }
        }

        initVapi();

        // Cleanup on unmount
        return () => {
            cancelled = true;
            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
            }
            vapiRef.current?.stop();
            vapiRef.current = null;
        };
    }, []);

    const startCall = useCallback(async () => {
        if (configStatus === 'loading') {
            setError('Voice service is still loading. Try again in a moment.');
            return;
        }

        if (!vapiRef.current) {
            setError('Voice service not configured. Check your backend or frontend env vars.');
            return;
        }

        if (callStatus !== 'idle') {
            return;
        }

        // Check mic permission before starting
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            setError('Microphone access denied. Please allow microphone access and try again.');
            return;
        }

        setCallStatus('connecting');
        setTranscript([]);
        setFormattedTranscript(null);
        setError(null);
        fullTranscriptRef.current = [];
        retryCountRef.current = 0;
        clearTranscriptBackup(); // fresh start
        vapiRef.current.start(vapiConfigRef.current.assistantId);

        // Connection timeout — if call-start hasn't fired in 30s, abort
        connectTimeoutRef.current = setTimeout(() => {
            if (vapiRef.current) {
                vapiRef.current.stop();
            }
            setError('Connection timed out. Please check your microphone and try again.');
            setCallStatus('ended');
        }, CONNECTION_TIMEOUT_MS);
    }, [callStatus, configStatus]);

    const endCall = useCallback(() => {
        if (vapiRef.current && (callStatus === 'active' || callStatus === 'connecting')) {
            vapiRef.current.stop();
            // Don't set 'ended' here — the call-end event handler does it
            // after an 800ms grace period for final transcript messages.
            // Show a transitional state so the UI isn't stuck on 'active'.
            setVoiceState('idle');
        }
    }, [callStatus]);

    return {
        callStatus,
        voiceState,
        transcript,
        formattedTranscript,
        error,
        configStatus,
        startCall,
        endCall,
    };
}
