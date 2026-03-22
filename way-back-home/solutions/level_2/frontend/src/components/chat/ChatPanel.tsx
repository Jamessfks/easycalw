import React from 'react';
import { MessageSquare } from 'lucide-react';
import { GlowingCard } from '../shared/GlowingCard';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { SuggestedQueries } from './SuggestedQueries';
import { useChatStore } from '../../stores/chatStore';

export const ChatPanel: React.FC = () => {
    const { sendMessage, isLoading, suggestions } = useChatStore();

    return (
        <GlowingCard glowColor="purple" className="h-full overflow-hidden">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 border-b border-gray-700 flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-accent-purple" />
                    <div>
                        <h2 className="font-display text-lg font-semibold text-white">
                            MISSION CONTROL AI
                        </h2>
                        <p className="text-xs text-gray-400">Natural Language Query Interface</p>
                    </div>
                </div>

                {/* Messages */}
                <ChatMessages />

                {/* Suggested Queries */}
                <div className="flex-shrink-0">
                    <SuggestedQueries
                        suggestions={suggestions}
                        onSelectSuggestion={sendMessage}
                    />
                </div>

                {/* Input */}
                <div className="flex-shrink-0">
                    <ChatInput
                        onSendMessage={sendMessage}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </GlowingCard>
    );
};
