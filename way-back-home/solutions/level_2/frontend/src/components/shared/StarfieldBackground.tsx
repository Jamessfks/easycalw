import React, { useMemo } from 'react';

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    duration: number;
    delay: number;
}

interface StarfieldBackgroundProps {
    starCount?: number;
    enableNebula?: boolean;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
    starCount = 200,
    enableNebula = true,
}) => {
    const stars = useMemo<Star[]>(() => {
        return Array.from({ length: starCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.3,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 3,
        }));
    }, [starCount]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-space-900 via-space-800 to-space-900" />

            {/* Nebula effect */}
            {enableNebula && (
                <>
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: 'radial-gradient(ellipse at 20% 20%, rgba(191, 95, 255, 0.15) 0%, transparent 50%)',
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: 'radial-gradient(ellipse at 80% 80%, rgba(0, 245, 255, 0.1) 0%, transparent 50%)',
                        }}
                    />
                </>
            )}

            {/* Stars */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full bg-white star"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        '--min-opacity': star.opacity,
                        '--duration': `${star.duration}s`,
                        '--delay': `${star.delay}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};
