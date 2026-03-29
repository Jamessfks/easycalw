import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { CopyButton, DownloadButton } from './GuideActions';

export default function ReferenceDocCard({ doc, index }) {
    const [expanded, setExpanded] = useState(index === 0);

    return (
        <div className="glass rounded-2xl overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                        <BookOpen size={14} className="text-accent-primary" />
                    </div>
                    <span className="font-display font-medium text-sm text-white">
                        {doc.name}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <DownloadButton content={doc.content} filename={doc.name} />
                    <CopyButton text={doc.content} />
                    {expanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                </div>
            </button>
            {expanded && (
                <div className="px-5 pb-5 border-t border-white/[0.04]">
                    <div className="pt-4">
                        <MarkdownRenderer content={doc.content} />
                    </div>
                </div>
            )}
        </div>
    );
}
