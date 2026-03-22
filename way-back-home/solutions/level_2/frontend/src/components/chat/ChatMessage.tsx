import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/chat';
import { Bot, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatTime } from '../../utils/formatters';

interface ChatMessageProps {
    message: ChatMessageType;
    onShowOnGraph?: (nodeIds: string[]) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    onShowOnGraph,
}) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isAssistant = message.role === 'assistant';

    if (isSystem) {
        return (
            <div className="flex justify-center my-2">
                <div className="px-4 py-2 bg-space-700/30 rounded-lg text-sm text-gray-400 italic">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'flex gap-3 mb-4 fade-in',
            isUser ? 'justify-end' : 'justify-start'
        )}>
            {/* Avatar */}
            {isAssistant && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/50 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent-purple" />
                </div>
            )}

            {/* Message Content */}
            <div className={cn(
                'max-w-[70%] rounded-lg p-4 backdrop-blur-sm',
                isUser
                    ? 'bg-accent-cyan/10 border border-accent-cyan/30'
                    : 'bg-accent-purple/10 border border-accent-purple/30'
            )}>
                <div className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                </div>

                {/* Show on Graph button */}
                {message.highlightNodes && message.highlightNodes.length > 0 && (
                    <button
                        onClick={() => onShowOnGraph && onShowOnGraph(message.highlightNodes!)}
                        className={cn(
                            'mt-3 px-3 py-1.5 text-xs rounded border transition-all',
                            'bg-accent-cyan/10 border-accent-cyan/50 text-accent-cyan',
                            'hover:bg-accent-cyan/20 hover:border-accent-cyan'
                        )}
                    >
                        📍 Show on Map
                    </button>
                )}

                {/* Timestamp */}
                {message.timestamp && (
                    <div className="mt-2 text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                    </div>
                )}
            </div>

            {/* User Avatar */}
            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-cyan/20 border border-accent-cyan/50 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent-cyan" />
                </div>
            )}
        </div>
    );
};
