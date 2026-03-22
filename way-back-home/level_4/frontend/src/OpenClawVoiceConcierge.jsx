import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Activity, FileText, Download, Sparkles } from 'lucide-react';

/** Pull base64 PCM chunks from ADK Event JSON (content.parts) or raw Live serverContent. */
function extractInlineAudioBase64(data) {
    const out = [];
    const scanParts = (parts) => {
        if (!Array.isArray(parts)) return;
        for (const p of parts) {
            const id = p?.inlineData || p?.inline_data;
            if (id?.data) out.push(id.data);
        }
    };
    scanParts(data?.content?.parts);
    const mt =
        data?.serverContent?.modelTurn?.parts ||
        data?.server_content?.model_turn?.parts;
    scanParts(mt);
    return out;
}

/** Model text (e.g. NATIVE_AUDIO=false) from Event content.parts */
function extractModelText(data) {
    const parts = data?.content?.parts;
    if (!Array.isArray(parts)) return '';
    return parts
        .map((p) => p?.text || '')
        .join('')
        .trim();
}

/**
 * Way Back Home Level 4 shell + OpenClaw two-agent flow:
 * — WebSocket + mic → ADK live interview agent (tools: setup MD + domain KB)
 * — POST /api/v1/generate-guide → ADK output agent → Markdown guide
 */
export default function OpenClawVoiceConcierge({ onBack }) {
    const [socketStatus, setSocketStatus] = useState('DISCONNECTED');
    const [sessionPhase, setSessionPhase] = useState('IDLE'); // IDLE | LIVE
    const [chatLogs, setChatLogs] = useState([]);
    const [isAgentThinking, setIsAgentThinking] = useState(false);
    const [guideMd, setGuideMd] = useState('');
    const [guideOpen, setGuideOpen] = useState(false);
    const [generatingGuide, setGeneratingGuide] = useState(false);
    const [guideError, setGuideError] = useState('');

    const socketRef = useRef(null);
    const micStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const sourceRef = useRef(null);
    const gainNodeRef = useRef(null);
    const renderIntervalRef = useRef(null);
    const nextAudioTime = useRef(0);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLogs, isAgentThinking]);

    const buildTranscript = useCallback(() => {
        return chatLogs
            .map((log) => `${log.sender === 'USR' ? 'User' : 'Assistant'}: ${log.text}`)
            .join('\n\n');
    }, [chatLogs]);

    const stopSession = useCallback(() => {
        if (renderIntervalRef.current) {
            clearInterval(renderIntervalRef.current);
            renderIntervalRef.current = null;
        }
        try {
            processorRef.current?.disconnect();
        } catch {
            /* ignore */
        }
        try {
            sourceRef.current?.disconnect();
        } catch {
            /* ignore */
        }
        try {
            gainNodeRef.current?.disconnect();
        } catch {
            /* ignore */
        }
        processorRef.current = null;
        sourceRef.current = null;
        gainNodeRef.current = null;

        try {
            audioContextRef.current?.close();
        } catch {
            /* ignore */
        }
        audioContextRef.current = null;
        nextAudioTime.current = 0;

        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        setSocketStatus('DISCONNECTED');
        setSessionPhase('IDLE');
    }, []);

    const floatTo16BitPCM = (input) => {
        const output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        return output;
    };

    const playAudio = (base64String) => {
        try {
            const sanitized = base64String.replace(/-/g, '+').replace(/_/g, '/');
            const binaryString = atob(sanitized);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
            const int16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

            const ctx = audioContextRef.current;
            if (!ctx) return;
            if (ctx.state === 'suspended') {
                void ctx.resume();
            }

            const buffer = ctx.createBuffer(1, float32.length, 24000);
            buffer.copyToChannel(float32, 0);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            const now = ctx.currentTime;
            const start = Math.max(now, nextAudioTime.current);
            source.start(start);
            nextAudioTime.current = start + buffer.duration;
        } catch (e) {
            console.error('Audio playback error:', e);
        }
    };

    const startMicStreaming = (ws, micStream) => {
        let ctx = audioContextRef.current;
        if (!ctx || ctx.state === 'closed') {
            ctx = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000,
            });
            audioContextRef.current = ctx;
        }
        void ctx.resume();

        const source = ctx.createMediaStreamSource(micStream);
        sourceRef.current = source;
        const gainNode = ctx.createGain();
        gainNode.gain.value = 5.0;
        gainNodeRef.current = gainNode;
        const processor = ctx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = floatTo16BitPCM(inputData);
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
            ws.send(JSON.stringify({ type: 'audio', data: base64Audio }));
        };

        source.connect(gainNode);
        gainNode.connect(processor);
        processor.connect(ctx.destination);
        processorRef.current = processor;
    };

    /**
     * Must call getUserMedia synchronously from the click handler (no await before it).
     * Otherwise browsers drop "user activation" and the permission prompt never appears.
     */
    const startVoiceSession = () => {
        if (!window.isSecureContext) {
            const host = window.location.host || 'this host';
            setGuideError(
                `Microphone needs a secure context. Use https://localhost:5173, or https://${host} with dev HTTPS (npm run dev — accept the browser’s self-signed cert warning). Plain http:// on a LAN IP is blocked by the browser.`
            );
            return;
        }

        let md = navigator.mediaDevices;
        if (!md || typeof md.getUserMedia !== 'function') {
            const legacy =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;
            if (legacy) {
                md = {
                    getUserMedia(constraints) {
                        return new Promise((resolve, reject) => {
                            legacy.call(navigator, constraints, resolve, reject);
                        });
                    },
                };
            }
        }

        if (!md || typeof md.getUserMedia !== 'function') {
            setGuideError(
                'This browser does not expose the microphone API (mediaDevices.getUserMedia). Try Chrome, Edge, or Safari current version.'
            );
            return;
        }

        const audioConstraints = {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        };

        md.getUserMedia({ audio: audioConstraints })
            .then((micStream) => {
                setGuideError('');
                micStreamRef.current = micStream;

                // Create + resume AudioContext here (still part of the click gesture).
                // If we only create it in ws.onopen, Chrome keeps it suspended and playback is silent.
                const ctx = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: 16000,
                });
                audioContextRef.current = ctx;
                void ctx.resume();

                const sessionId = `session-${Math.random().toString(36).slice(2, 10)}`;
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.host;
                const wsUrl = `${protocol}//${host}/ws/user1/${sessionId}`;
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    setSocketStatus('CONNECTED');
                    setSessionPhase('LIVE');
                    startMicStreaming(ws, micStream);
                };

                ws.onclose = () => {
                    setSocketStatus('DISCONNECTED');
                    setSessionPhase('IDLE');
                    setIsAgentThinking(false);
                };

                ws.onerror = (err) => console.error('WebSocket error:', err);

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        /** True when the model is doing anything visible (stops "thinking" spinner). */
                        let sawAgentActivity = false;

                        const audioChunks = extractInlineAudioBase64(data);
                        if (audioChunks.length) {
                            sawAgentActivity = true;
                            for (const b64 of audioChunks) {
                                playAudio(b64);
                            }
                        }

                        const modelText = extractModelText(data);
                        if (modelText) {
                            sawAgentActivity = true;
                            if (data?.partial !== true) {
                                setChatLogs((prev) => [
                                    ...prev,
                                    { sender: 'AI', text: modelText, timestamp: Date.now() },
                                ]);
                            }
                        }

                        const agentTx =
                            data.outputTranscription ||
                            data.outputAudioTranscription ||
                            data.output_audio_transcription;
                        if (agentTx?.text?.trim()) {
                            sawAgentActivity = true;
                        }
                        if (
                            agentTx &&
                            (agentTx.finished === true ||
                                agentTx.finalTranscript ||
                                agentTx.final_transcript)
                        ) {
                            const text =
                                agentTx.text ||
                                agentTx.finalTranscript ||
                                agentTx.final_transcript;
                            if (text && text.trim() && text !== 'undefined') {
                                setChatLogs((prev) => [
                                    ...prev,
                                    { sender: 'AI', text, timestamp: Date.now() },
                                ]);
                            }
                        }

                        const toolCall = data.toolCall || data.tool_call;
                        if (toolCall?.functionCalls?.length) {
                            sawAgentActivity = true;
                            toolCall.functionCalls.forEach((fc) => {
                                setChatLogs((prev) => [
                                    ...prev,
                                    {
                                        sender: 'AI',
                                        text: `Tool: ${fc.name}(…)`,
                                        timestamp: Date.now(),
                                    },
                                ]);
                            });
                        }

                        for (const p of data?.content?.parts || []) {
                            if (p?.functionCall || p?.function_call) {
                                sawAgentActivity = true;
                                break;
                            }
                        }

                        if (data?.turnComplete === true || data?.turn_complete === true) {
                            sawAgentActivity = true;
                        }
                        if (data?.interrupted === true) {
                            sawAgentActivity = true;
                        }

                        if (sawAgentActivity) {
                            setIsAgentThinking(false);
                        }

                        const userTx =
                            data.inputTranscription ||
                            data.inputAudioTranscription ||
                            data.input_audio_transcription;
                        let userFinished = false;
                        if (
                            userTx &&
                            (userTx.finished === true ||
                                userTx.finalTranscript ||
                                userTx.final_transcript)
                        ) {
                            const text =
                                userTx.text || userTx.finalTranscript || userTx.final_transcript;
                            if (text) {
                                setChatLogs((prev) => [
                                    ...prev,
                                    { sender: 'USR', text, timestamp: Date.now() },
                                ]);
                                userFinished = true;
                            }
                        }

                        if (userFinished && !sawAgentActivity) {
                            setIsAgentThinking(true);
                        }
                    } catch (e) {
                        console.warn('WS parse:', e);
                    }
                };

                socketRef.current = ws;
            })
            .catch((err) => {
                console.error('getUserMedia:', err);
                const name = err?.name || '';
                let msg = 'Could not access the microphone.';
                if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
                    msg =
                        'Microphone permission was denied. Click the lock icon in the address bar and allow the microphone for this site.';
                } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
                    msg = 'No microphone was found. Connect a mic and try again.';
                } else if (name === 'NotReadableError' || name === 'TrackStartError') {
                    msg =
                        'The microphone is busy or unavailable. Close other apps using the mic and try again.';
                } else if (name === 'OverconstrainedError') {
                    msg =
                        'Your device rejected the requested audio settings. Try again or use another browser.';
                } else if (name === 'SecurityError') {
                    msg =
                        'Microphone blocked for security reasons. Use HTTPS or localhost.';
                } else if (err?.message) {
                    msg = `${msg} (${err.message})`;
                }
                setGuideError(msg);
            });
    };

    const sendText = (text) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'text', text }));
            setIsAgentThinking(true);
        }
    };

    const generateGuide = async () => {
        const transcript = buildTranscript();
        if (!transcript.trim()) {
            setGuideError('No conversation captured yet — speak with the agent first.');
            return;
        }
        setGeneratingGuide(true);
        setGuideError('');
        try {
            const res = await fetch('/api/v1/generate-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript, user_id: 'ui-user' }),
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            setGuideMd(data.guide_markdown || '');
            setGuideOpen(true);
        } catch (e) {
            console.error(e);
            setGuideError(String(e.message || e));
        } finally {
            setGeneratingGuide(false);
        }
    };

    const downloadGuide = () => {
        const blob = new Blob([guideMd], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'OPENCLAW_ENGINE_SETUP_GUIDE.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => () => stopSession(), [stopSession]);

    return (
        <div className="w-screen min-h-screen bg-[#060a14] text-slate-200 flex flex-col font-sans grid-bg noise-overlay">
            <header className="h-14 border-b border-white/[0.06] bg-[#0c1220]/90 flex items-center justify-between px-5 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-sm mr-1">&larr;</button>
                    )}
                    <span className="text-lg">🐾</span>
                    <div>
                        <h1 className="text-sm font-semibold text-white tracking-tight">
                            Easy<span className="text-sky-400">Claw</span>
                            <span className="text-slate-500 font-normal ml-2 text-xs">Voice Concierge</span>
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide ${
                            socketStatus === 'CONNECTED'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : 'bg-white/[0.03] border border-white/[0.08] text-slate-500'
                        }`}
                    >
                        {socketStatus}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* Sidebar */}
                <aside className="md:w-64 border-b md:border-b-0 md:border-r border-white/[0.06] bg-[#0c1220]/60 p-5 shrink-0 flex flex-col gap-5">
                    <div>
                        <h2 className="text-[10px] font-semibold text-sky-400/70 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                            <FileText size={12} /> Interview brief
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Speak naturally with the concierge. It will ask about your use-cases, preferred channels, and setup preferences.
                        </p>
                    </div>
                    <div className="space-y-2">
                        {['Start voice session', 'Answer setup questions', 'Generate your guide'].map((s, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-sky-500/[0.1] border border-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                <span className="text-xs text-slate-300">{s}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto pt-4 border-t border-white/[0.06]">
                        <img src="/listen.png" alt="" className="w-16 h-16 rounded-full object-cover border border-sky-500/20 mx-auto opacity-70" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                </aside>

                {/* Center panel */}
                <main className="flex-1 flex flex-col min-w-0 p-5 gap-4">
                    <div className="flex flex-wrap gap-2.5 items-center">
                        {sessionPhase === 'IDLE' ? (
                            <button
                                type="button"
                                onClick={startVoiceSession}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] text-slate-950 font-semibold rounded-lg transition-all duration-200"
                            >
                                <Mic size={16} />
                                Start voice interview
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={stopSession}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 font-semibold rounded-lg transition-all"
                            >
                                End session
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={generateGuide}
                            disabled={generatingGuide}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500/15 border border-violet-500/25 hover:bg-violet-500/25 disabled:opacity-40 text-violet-300 font-semibold rounded-lg transition-all"
                        >
                            <Activity size={16} className={generatingGuide ? 'animate-spin' : ''} />
                            {generatingGuide ? 'Generating...' : 'Generate guide'}
                        </button>
                        {guideMd && (
                            <button
                                type="button"
                                onClick={() => setGuideOpen(true)}
                                className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                            >
                                Preview guide
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    sendText(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>

                    {guideError && (
                        <p className="text-red-400 text-sm bg-red-500/[0.06] border border-red-500/20 rounded-lg px-3 py-2">{guideError}</p>
                    )}
                </main>

                {/* Transcript panel */}
                <section className="md:w-[380px] border-t md:border-t-0 md:border-l border-white/[0.06] bg-[#0c1220]/40 flex flex-col min-h-[240px] md:min-h-0">
                    <h2 className="text-[10px] font-semibold text-sky-400/70 uppercase tracking-[0.15em] px-5 pt-4 pb-2 flex items-center gap-2">
                        <Activity size={12} /> Live transcript
                    </h2>
                    <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3 font-mono text-xs">
                        {chatLogs.length === 0 && !isAgentThinking && (
                            <p className="text-slate-600 italic text-center mt-12 text-[11px]">
                                Start a voice session to begin.
                            </p>
                        )}
                        {chatLogs.map((log, i) => (
                            <div
                                key={i}
                                className={`flex flex-col ${log.sender === 'USR' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[92%] px-3 py-2 rounded-lg ${
                                        log.sender === 'USR'
                                            ? 'bg-sky-500/[0.08] border border-sky-500/20 text-sky-200 rounded-tr-sm'
                                            : 'bg-white/[0.03] border border-white/[0.06] text-slate-300 rounded-tl-sm'
                                    }`}
                                >
                                    <span className="text-[9px] uppercase tracking-wider opacity-40 block mb-1 font-semibold">
                                        {log.sender === 'USR' ? 'You' : 'Concierge'}
                                    </span>
                                    {log.text}
                                </div>
                            </div>
                        ))}
                        {isAgentThinking && (
                            <div className="flex items-center gap-2 text-sky-400/60 text-[11px]">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                Thinking...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </section>
            </div>

            {guideOpen && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0c1220] border border-white/[0.08] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl box-glow">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                                <FileText size={14} className="text-sky-400" />
                                OPENCLAW_ENGINE_SETUP_GUIDE.md
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={downloadGuide}
                                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-sky-500/15 border border-sky-500/25 rounded-md text-sky-300 hover:bg-sky-500/25 transition-colors"
                                >
                                    <Download size={12} /> Download
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGuideOpen(false)}
                                    className="text-xs px-3 py-1.5 text-slate-500 hover:text-white rounded-md hover:bg-white/[0.05] transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <pre className="flex-1 overflow-auto p-5 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {guideMd}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
