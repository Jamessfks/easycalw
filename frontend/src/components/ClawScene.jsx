import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Interactive 3D CSS Claw — the signature EasyClaw mascot.
 * Pure CSS 3D transforms with mouse tracking. No external 3D library needed.
 * States: idle (gentle float), active (follows mouse), snapping (click animation), building (loading spin).
 */

const CLAW_COLOR = '#F97316';
const CLAW_HIGHLIGHT = '#FB923C';
const CLAW_SHADOW = '#EA580C';

export default function ClawScene({ state = 'idle', size = 'lg' }) {
    const containerRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isSnapping, setIsSnapping] = useState(false);
    const [hovered, setHovered] = useState(false);
    const rafRef = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 });

    const sizeMap = { sm: 'w-32 h-32', md: 'w-48 h-48', lg: 'w-64 h-64', xl: 'w-80 h-80' };
    const sizeClass = sizeMap[size] || sizeMap.lg;

    // Smooth mouse tracking with RAF
    const handleMouseMove = useCallback((e) => {
        if (state === 'building') return;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        targetRef.current = {
            x: ((e.clientY - cy) / (rect.height / 2)) * -15,
            y: ((e.clientX - cx) / (rect.width / 2)) * 15,
        };
    }, [state]);

    useEffect(() => {
        const animate = () => {
            setRotation(prev => ({
                x: prev.x + (targetRef.current.x - prev.x) * 0.08,
                y: prev.y + (targetRef.current.y - prev.y) * 0.08,
            }));
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    useEffect(() => {
        if (state !== 'building') {
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        } else {
            targetRef.current = { x: 0, y: 0 };
        }
    }, [handleMouseMove, state]);

    const handleClick = () => {
        setIsSnapping(true);
        setTimeout(() => setIsSnapping(false), 400);
    };

    const clawAngle = isSnapping ? 25 : hovered ? 30 : 12;
    const buildingRotation = state === 'building' ? 'animate-spin-slow' : '';

    return (
        <div
            ref={containerRef}
            className={`${sizeClass} relative cursor-pointer select-none`}
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); targetRef.current = { x: 0, y: 0 }; }}
            style={{ perspective: '800px' }}
        >
            {/* Ambient glow */}
            <div
                className="absolute inset-0 rounded-full animate-glow-pulse"
                style={{
                    background: `radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                }}
            />

            {/* 3D Claw body */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-transform duration-75 ${buildingRotation}`}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: state === 'building'
                        ? undefined
                        : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                }}
            >
                {/* Main body — circle */}
                <div
                    className="relative"
                    style={{
                        width: '55%',
                        height: '55%',
                        borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 35%, ${CLAW_HIGHLIGHT}, ${CLAW_COLOR} 60%, ${CLAW_SHADOW})`,
                        boxShadow: `
                            0 0 40px rgba(249,115,22,0.3),
                            inset 0 -4px 12px rgba(0,0,0,0.3),
                            inset 0 4px 8px rgba(255,255,255,0.15)
                        `,
                        transform: 'translateZ(20px)',
                    }}
                >
                    {/* Eyes */}
                    <div className="absolute flex gap-2" style={{ top: '30%', left: '50%', transform: 'translateX(-50%) translateZ(10px)' }}>
                        <div
                            className="rounded-full bg-white"
                            style={{
                                width: '14%',
                                paddingBottom: '14%',
                                minWidth: 8,
                                minHeight: 8,
                                boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                            }}
                        />
                        <div
                            className="rounded-full bg-white"
                            style={{
                                width: '14%',
                                paddingBottom: '14%',
                                minWidth: 8,
                                minHeight: 8,
                                boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                            }}
                        />
                    </div>

                    {/* Mouth — happy arc */}
                    <div
                        className="absolute"
                        style={{
                            top: '52%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '28%',
                            height: '10%',
                            borderRadius: '0 0 50% 50%',
                            background: 'rgba(0,0,0,0.3)',
                        }}
                    />
                </div>

                {/* Left pincer */}
                <div
                    className="absolute"
                    style={{
                        left: '5%',
                        top: '22%',
                        width: '30%',
                        height: '22%',
                        transformOrigin: 'right center',
                        transform: `rotate(${clawAngle}deg) translateZ(15px)`,
                        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    {/* Upper jaw */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100%',
                            height: '45%',
                            background: `linear-gradient(135deg, ${CLAW_HIGHLIGHT}, ${CLAW_COLOR})`,
                            borderRadius: '20px 4px 4px 8px',
                            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    />
                    {/* Lower jaw */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '100%',
                            height: '45%',
                            background: `linear-gradient(135deg, ${CLAW_COLOR}, ${CLAW_SHADOW})`,
                            borderRadius: '8px 4px 4px 20px',
                            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    />
                </div>

                {/* Right pincer */}
                <div
                    className="absolute"
                    style={{
                        right: '5%',
                        top: '22%',
                        width: '30%',
                        height: '22%',
                        transformOrigin: 'left center',
                        transform: `rotate(${-clawAngle}deg) translateZ(15px)`,
                        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    {/* Upper jaw */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '45%',
                            background: `linear-gradient(-135deg, ${CLAW_HIGHLIGHT}, ${CLAW_COLOR})`,
                            borderRadius: '4px 20px 8px 4px',
                            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    />
                    {/* Lower jaw */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '45%',
                            background: `linear-gradient(-135deg, ${CLAW_COLOR}, ${CLAW_SHADOW})`,
                            borderRadius: '4px 8px 20px 4px',
                            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    />
                </div>

                {/* Legs (small) */}
                {[{ left: '20%', rot: 25 }, { left: '30%', rot: 10 }, { right: '30%', rot: -10 }, { right: '20%', rot: -25 }].map((leg, i) => (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            ...(leg.left ? { left: leg.left } : { right: leg.right }),
                            bottom: '15%',
                            width: '8%',
                            height: '18%',
                            background: `linear-gradient(180deg, ${CLAW_COLOR}, ${CLAW_SHADOW})`,
                            borderRadius: '4px 4px 8px 8px',
                            transform: `rotate(${leg.rot}deg) translateZ(5px)`,
                            transformOrigin: 'top center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                    />
                ))}
            </div>

            {/* Interactive hint */}
            {state === 'idle' && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-stone-600 opacity-0 hover:opacity-0 transition-opacity whitespace-nowrap"
                     style={{ animation: 'fade-in 1s ease-out 2s forwards' }}>
                    click me!
                </div>
            )}
        </div>
    );
}
