import React from 'react';

interface HologramBorderProps {
    className?: string;
}

export const HologramBorder: React.FC<HologramBorderProps> = ({
    className,
}) => {
    return (
        <div className={`glow-border ${className || ''}`} />
    );
};
