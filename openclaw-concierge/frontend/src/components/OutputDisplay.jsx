import React, { useState } from 'react';
import { Copy, Download, ChevronDown, ChevronRight, Check } from 'lucide-react';

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}

function DownloadButton({ filename, content }) {
    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-cyan-700 hover:bg-cyan-600 rounded transition-colors"
        >
            <Download size={12} />
            {filename}
        </button>
    );
}

function MarkdownBlock({ content }) {
    // Simple Markdown rendering — renders code blocks with copy buttons
    // For a hackathon, pre-formatted text is sufficient
    const blocks = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="space-y-3">
            {blocks.map((block, i) => {
                if (block.startsWith('```')) {
                    const code = block.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
                    return (
                        <div key={i} className="relative group">
                            <pre className="bg-gray-950 border border-gray-700 rounded p-4 text-sm font-mono text-green-300 overflow-x-auto whitespace-pre-wrap">
                                {code}
                            </pre>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={code} />
                            </div>
                        </div>
                    );
                }
                return (
                    <div key={i} className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
                        {block}
                    </div>
                );
            })}
        </div>
    );
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-750 text-left font-bold text-sm transition-colors"
            >
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {title}
            </button>
            {open && <div className="p-4 bg-gray-900">{children}</div>}
        </div>
    );
}

const OutputDisplay = ({ guideData }) => {
    if (!guideData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-100 gap-4">
                <h1 className="text-2xl font-bold text-red-400">Generation Failed</h1>
                <p className="text-gray-400 font-mono text-sm">
                    The setup guide could not be generated. Please try again.
                </p>
            </div>
        );
    }

    const { setup_guide, reference_documents, prompts_to_send } = guideData;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <header className="border-b border-gray-700 bg-gray-950/80 px-6 py-4 backdrop-blur sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                            OpenClaw Concierge
                        </p>
                        <h1 className="text-xl font-bold text-cyan-300">
                            Your Setup Guide
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        {setup_guide && (
                            <DownloadButton filename="OPENCLAW_ENGINE_SETUP_GUIDE.md" content={setup_guide} />
                        )}
                        {prompts_to_send && (
                            <DownloadButton filename="prompts_to_send.md" content={prompts_to_send} />
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Main Setup Guide */}
                {setup_guide && (
                    <section>
                        <h2 className="text-lg font-bold text-cyan-400 mb-4">
                            Setup Guide
                        </h2>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                            <MarkdownBlock content={setup_guide} />
                        </div>
                    </section>
                )}

                {/* Reference Documents */}
                {reference_documents && reference_documents.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-cyan-400 mb-4">
                            Reference Documents ({reference_documents.length})
                        </h2>
                        <div className="space-y-2">
                            {reference_documents.map((doc, i) => (
                                <CollapsibleSection key={i} title={doc.name}>
                                    <div className="flex justify-end mb-3">
                                        <DownloadButton filename={doc.name} content={doc.content} />
                                    </div>
                                    <MarkdownBlock content={doc.content} />
                                </CollapsibleSection>
                            ))}
                        </div>
                    </section>
                )}

                {/* Prompts to Send */}
                {prompts_to_send && (
                    <section>
                        <h2 className="text-lg font-bold text-cyan-400 mb-4">
                            Initialization Prompts
                        </h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Copy and send these prompts to your OpenClaw instance after setup is complete.
                        </p>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                            <MarkdownBlock content={prompts_to_send} />
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default OutputDisplay;
