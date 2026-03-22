import React from 'react';
import { cn } from '../../utils/cn';

interface SuggestedQueriesProps {
    suggestions: string[];
    onSelectSuggestion: (suggestion: string) => void;
}

export const SuggestedQueries: React.FC<SuggestedQueriesProps> = ({
    suggestions,
    onSelectSuggestion,
}) => {
    if (suggestions.length === 0) return null;

    return (
        <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectSuggestion(suggestion)}
                        className={cn(
                            'px-3 py-1.5 text-xs rounded-lg border transition-all',
                            'bg-space-700/50 border-gray-700 text-gray-300',
                            'hover:bg-space-600 hover:border-accent-cyan/50 hover:text-accent-cyan'
                        )}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
};
