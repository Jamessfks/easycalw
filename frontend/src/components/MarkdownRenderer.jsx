import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Copy, Check } from 'lucide-react';

export function headingId(children) {
    return String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function classifyCallout(children) {
    const extract = (node) => {
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(extract).join('');
        if (node?.props?.children) return extract(node.props.children);
        return '';
    };
    const text = extract(children);
    if (/\u26a0\ufe0f|WARNING/.test(text)) return 'callout-warning';
    if (/\ud83d\udca1|TIP/.test(text)) return 'callout-tip';
    if (/\u2705|ACTION/.test(text)) return 'callout-action';
    return '';
}

function CodeBlock({ children, className }) {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, '');
    const language = className?.replace('language-', '') || '';

    return (
        <div className="relative group">
            {language && (
                <span className="absolute top-2 left-3 text-[10px] font-mono text-gray-600 uppercase">
                    {language}
                </span>
            )}
            <button
                onClick={() => {
                    navigator.clipboard.writeText(code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                           flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono
                           bg-white/5 border border-white/10 text-gray-400 hover:text-white
                           transition-all duration-200"
            >
                {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
            <code className={className}>{children}</code>
        </div>
    );
}

function GuideImage({ src, alt, ...props }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-2 border border-white/[0.06] my-4">
                <FileText size={18} className="text-gray-500 shrink-0" />
                <span className="text-sm text-gray-400 font-mono">{alt || 'Screenshot'}</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            {...props}
        />
    );
}

function ClickableHeading({ level, id, children, ...props }) {
    const Tag = `h${level}`;
    return (
        <Tag id={id} className="scroll-mt-28 group cursor-pointer" {...props}>
            <a href={`#${id}`} className="no-underline border-none hover:border-none flex items-center gap-2">
                {children}
                <span className="opacity-0 group-hover:opacity-50 transition-opacity text-gray-500 text-sm font-normal">#</span>
            </a>
        </Tag>
    );
}

function stripChecklistMarkers(markdown) {
    return markdown
        .split(/(```[\s\S]*?```)/g)
        .map((block) => {
            if (block.startsWith('```')) return block;
            return block
                .replace(/^(\s*[-*+]\s+)\[\s*\]\s+/gm, '$1')
                .replace(/^(\s*\d+\.\s+)\[\s*\]\s+/gm, '$1')
                .replace(/^(\s*)\[\s*\]\s+/gm, '$1');
        })
        .join('');
}

export default function MarkdownRenderer({ content }) {
    if (!content) return null;
    const normalizedContent = stripChecklistMarkers(content);
    return (
        <div className="prose prose-dark max-w-none text-[18px] leading-[1.7]">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2({ children, ...props }) {
                        const id = headingId(children);
                        return <ClickableHeading level={2} id={id} {...props}>{children}</ClickableHeading>;
                    },
                    h3({ children, ...props }) {
                        const id = headingId(children);
                        return <ClickableHeading level={3} id={id} {...props}>{children}</ClickableHeading>;
                    },
                    blockquote({ children, ...props }) {
                        const cls = classifyCallout(children);
                        return <blockquote className={cls} {...props}>{children}</blockquote>;
                    },
                    pre({ children }) {
                        return <pre>{children}</pre>;
                    },
                    code({ children, className, node, ...rest }) {
                        const isInline = !className;
                        if (isInline) {
                            return <code {...rest}>{children}</code>;
                        }
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                    },
                    img({ src, alt, ...rest }) {
                        return <GuideImage src={src} alt={alt} {...rest} />;
                    },
                }}
            >
                {normalizedContent}
            </ReactMarkdown>
        </div>
    );
}
