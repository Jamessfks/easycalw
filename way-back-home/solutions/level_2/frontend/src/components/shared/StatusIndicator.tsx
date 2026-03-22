import React from 'react';
import { cn } from '../../utils/cn';

interface StatusIndicatorProps {
    strength: number; // 0-5
    className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    strength,
    className,
}) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="text-xs text-gray-400 mr-1">SIGNAL</span>
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'w-2 h-2 rounded-full transition-all duration-300',
                        i < strength
                            ? 'bg-accent-green animate-pulse-slow'
                            : 'bg-gray-600'
                    )}
                />
            ))}
        </div>
    );
};
