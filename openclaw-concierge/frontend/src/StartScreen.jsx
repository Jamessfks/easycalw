import { Phone, Brain, FileText } from 'lucide-react';

const STEPS = [
    {
        icon: Phone,
        title: 'Call the Agent',
        desc: 'Have a natural conversation about your OpenClaw needs',
    },
    {
        icon: Brain,
        title: 'AI Analyzes',
        desc: 'The agent processes your requirements and builds a plan',
    },
    {
        icon: FileText,
        title: 'Get Your Guide',
        desc: 'Receive a complete OpenClaw configuration guide',
    },
];

export default function StartScreen({ onStart }) {
    return (
        <div className="w-screen h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center gap-12 px-8">
            {/* Title */}
            <div className="text-center">
                <h1 className="text-6xl font-extrabold tracking-tight text-cyan-400 mb-2">
                    EasyClaw
                </h1>
                <p className="text-lg text-gray-400 tracking-wide">
                    OpenClaw Concierge
                </p>
            </div>

            {/* Tagline */}
            <p className="text-xl text-gray-300 font-light">
                Stop reading docs. Just talk.
            </p>

            {/* 3 Steps */}
            <div className="flex gap-10 max-w-3xl">
                {STEPS.map(({ icon: Icon, title, desc }, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center text-center gap-3">
                        <div className="w-14 h-14 rounded-full border border-gray-700 bg-gray-900 flex items-center justify-center">
                            <Icon size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-200">
                            {title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Start Button */}
            <button
                onClick={onStart}
                className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-lg font-bold rounded-lg transition-colors tracking-wide"
            >
                Start
            </button>
        </div>
    );
}
