import React from 'react';
import { User, Zap, AlertCircle, Package, Map } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface GraphLegendProps {
    className?: string;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ className }) => {
    // Matching 3D theme colors
    const legendItems = [
        { icon: User, label: 'Survivor', color: '#a08888' }, // Dusty Rose
        { icon: Zap, label: 'Skill', color: '#ffd700' },     // Gold
        { icon: AlertCircle, label: 'Need', color: '#f87171' }, // Red (kept similar)
        { icon: Package, label: 'Resource', color: '#5a9a8a' }, // Teal
        { icon: Map, label: 'Biome', color: '#806070' },     // Mauve
    ];

    return (
        <div className={twMerge(
            "absolute top-4 right-4 bg-space-800/90 border border-gray-700 rounded-lg p-3 backdrop-blur-sm z-10 pointer-events-none", // pointer-events-none so clicks go through to canvas if needed, but text needs to be selectable? Actually legend usually blocks.
            // But if it's just a visual, maybe? Let's keep it interactive just in case.
            "pointer-events-auto",
            className
        )}>
            <h3 className="text-xs font-semibold text-gray-400 mb-2">Legend</h3>
            <div className="space-y-1.5">
                {legendItems.map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                        <Icon size={14} style={{ color }} />
                        <span className="text-gray-300">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
