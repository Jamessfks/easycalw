import React from 'react';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center space-x-2 px-4 py-3 bg-space-700/30 rounded-lg w-fit">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-accent-cyan rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-accent-cyan rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-accent-cyan rounded-full typing-dot"></div>
            </div>
            <span className="text-sm text-gray-400">Mission Control AI is thinking...</span>
        </div>
    );
};
