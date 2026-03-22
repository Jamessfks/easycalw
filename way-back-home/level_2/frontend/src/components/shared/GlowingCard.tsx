import React from 'react';
import { cn } from '../../utils/cn';

interface GlowingCardProps {
    children: React.ReactNode;
    glowColor?: 'cyan' | 'purple' | 'green' | 'red';
    className?: string;
    isActive?: boolean;
    onClick?: () => void;
}

const glowColors = {
    cyan: 'border-accent-cyan/30 hover:border-accent-cyan/60 shadow-glow-sm-cyan',
    purple: 'border-accent-purple/30 hover:border-accent-purple/60 shadow-glow-sm-purple',
    green: 'border-accent-green/30 hover:border-accent-green/60 shadow-glow-sm-green',
    red: 'border-accent-red/30 hover:border-accent-red/60 shadow-glow-sm-red',
};

const activeGlowColors = {
    cyan: 'border-accent-cyan shadow-glow-cyan',
    purple: 'border-accent-purple shadow-glow-purple',
    green: 'border-accent-green shadow-glow-green',
    red: 'border-accent-red shadow-glow-red',
};

export const GlowingCard: React.FC<GlowingCardProps> = ({
    children,
    glowColor = 'cyan',
    className,
    isActive = false,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'relative rounded-lg border backdrop-blur-sm transition-all duration-300',
                'bg-space-700/50',
                isActive ? activeGlowColors[glowColor] : glowColors[glowColor],
                onClick && 'cursor-pointer',
                className
            )}
        >
            {/* Scanline overlay */}
            <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                <div className="scanline opacity-50" />
            </div>

            {/* Content - propagate height to children */}
            <div className="relative z-10 h-full">{children}</div>
        </div>
    );
};
