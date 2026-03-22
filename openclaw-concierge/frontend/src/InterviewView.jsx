import React from 'react';
import { Phone, PhoneOff, Activity } from 'lucide-react';
import useVapi from './useVapi';
import AgentPresence from './components/AgentPresence';
import Transcript from './components/Transcript';

export default function InterviewView({ onInterviewComplete }) {
    const { callStatus, voiceState, transcript, formattedTranscript, startCall, endCall } = useVapi();

    // Notify parent when interview ends and transcript is formatted
    React.useEffect(() => {
        if (callStatus === 'ended' && formattedTranscript && onInterviewComplete) {
            // Small delay to let the user see the "complete" state
            const timer = setTimeout(() => onInterviewComplete(formattedTranscript), 3000);
            return () => clearTimeout(timer);
        }
    }, [callStatus, formattedTranscript, onInterviewComplete]);

    return (
        <div className="w-screen h-screen bg-gray-900 text-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-gray-700 bg-gray-950/80 flex items-center justify-between px-6 backdrop-blur shrink-0">
                <div className="flex items-center gap-4">
                    <Activity className="text-cyan-400 animate-pulse" />
                    <div className="flex flex-col">
                        <h1 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                            OpenClaw Concierge
                        </h1>
                        <p className="text-lg font-bold text-cyan-300 leading-none">
                            Interview Phase
                        </p>
                    </div>
                </div>

                {/* Call controls */}
                <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded text-xs font-mono tracking-wider border ${
                        callStatus === 'active' ? 'border-green-500 text-green-400' :
                        callStatus === 'connecting' ? 'border-yellow-500 text-yellow-400' :
                        callStatus === 'ended' ? 'border-gray-500 text-gray-400' :
                        'border-gray-600 text-gray-500'
                    }`}>
                        {callStatus.toUpperCase()}
                    </div>

                    {callStatus === 'idle' && (
                        <button
                            onClick={startCall}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors"
                        >
                            <Phone size={16} />
                            Start Interview
                        </button>
                    )}

                    {callStatus === 'connecting' && (
                        <button disabled className="flex items-center gap-2 px-6 py-2 bg-yellow-600/50 text-yellow-200 font-bold rounded cursor-wait">
                            <Activity size={16} className="animate-spin" />
                            Connecting...
                        </button>
                    )}

                    {callStatus === 'active' && (
                        <button
                            onClick={endCall}
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors"
                        >
                            <PhoneOff size={16} />
                            End Interview
                        </button>
                    )}
                </div>
            </header>

            {/* Interview complete overlay */}
            {callStatus === 'ended' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-cyan-400 mb-4">
                            Interview Complete
                        </h2>
                        <p className="text-gray-400 font-mono">
                            Processing your responses...
                        </p>
                    </div>
                </div>
            )}

            {/* Two-panel layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left panel — Agent Presence (~40%) */}
                <div className="w-2/5 border-r border-gray-700 bg-gray-950/50">
                    <AgentPresence voiceState={voiceState} />
                </div>

                {/* Right panel — Transcript (~60%) */}
                <div className="w-3/5 bg-gray-900">
                    <Transcript entries={transcript} />
                </div>
            </div>
        </div>
    );
}
