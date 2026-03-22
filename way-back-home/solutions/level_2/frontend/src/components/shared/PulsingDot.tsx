import React from 'react';
import { cn } from '../../utils/cn';

interface PulsingDotProps {
    color: 'green' | 'yellow' | 'red';
    className?: string;
}

const colorClasses = {
    green: 'bg-accent-green',
    yellow: 'bg-accent-orange',
    red: 'bg-accent-red',
};

export const PulsingDot: React.FC<PulsingDotProps> = ({
    color,
    className,
}) => {
    return (
        <div className={cn('relative inline-flex', className)}>
            <div className={cn(
                'w-2 h-2 rounded-full animate-pulse-slow',
                colorClasses[color]
            )} />
            <div className={cn(
                'absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75',
                colorClasses[color]
            )} />
        </div>
    );
};
