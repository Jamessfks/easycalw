import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '../../stores/chatStore';
import { useGraphStore } from '../../stores/graphStore';

export const ChatMessages: React.FC = () => {
    const { messages, isLoading } = useChatStore();
    const { highlightNodes, selectNode } = useGraphStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleShowOnGraph = (nodeIds: string[]) => {
        highlightNodes(nodeIds);
        if (nodeIds.length > 0) {
            selectNode(nodeIds[0]);
        }
    };

    return (
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
            {messages.map((message, index) => (
                <ChatMessage
                    key={index}
                    message={message}
                    onShowOnGraph={handleShowOnGraph}
                />
            ))}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
        </div>
    );
};
