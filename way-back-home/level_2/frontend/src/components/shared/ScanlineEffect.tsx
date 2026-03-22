import React from 'react';

interface ScanlineEffectProps {
    opacity?: number;
    speed?: number;
}

export const ScanlineEffect: React.FC<ScanlineEffectProps> = ({
    opacity = 0.03,
    speed = 8,
}) => {
    return (
        <div
            className="scanline"
            style={{
                animationDuration: `${speed}s`,
                opacity,
            }}
        />
    );
};
