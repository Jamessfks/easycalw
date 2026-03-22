import React from 'react';
import { X } from 'lucide-react';
import { GlowingCard } from '../shared/GlowingCard';
import { useGraphStore } from '../../stores/graphStore';

export const DetailsPanel: React.FC = () => {
    const { selectedNodeId, nodes, selectNode } = useGraphStore();

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    if (!selectedNode) {
        return (
            <GlowingCard glowColor="cyan" className="h-full flex items-center justify-center">
                <div className="text-center px-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
                        <span className="text-2xl">◈</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Select a node to view details
                    </p>
                </div>
            </GlowingCard>
        );
    }

    return (
        <GlowingCard glowColor="cyan" className="h-full overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-4 bg-space-700/90 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-cyan/20 border border-accent-cyan/50 flex items-center justify-center">
                        <span className="text-lg">◈</span>
                    </div>
                    <div>
                        <p className="text-xs text-accent-cyan font-semibold tracking-wide">
                            {selectedNode.type.toUpperCase()} DETECTED
                        </p>
                        <h3 className="font-display text-white font-semibold">
                            {selectedNode.label}
                        </h3>
                    </div>
                </div>
                <button
                    onClick={() => selectNode(null)}
                    className="p-1.5 rounded hover:bg-space-600 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                    <h4 className="text-sm font-semibold text-accent-cyan mb-3">INFORMATION</h4>
                    <div className="space-y-2">
                        {Object.entries(selectedNode.properties || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-400">{key}:</span>
                                <span className="text-white">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ID */}
                <div>
                    <h4 className="text-sm font-semibold text-accent-cyan mb-2">NODE ID</h4>
                    <code className="text-xs text-gray-400 font-mono bg-space-800 px-2 py-1 rounded">
                        {selectedNode.id}
                    </code>
                </div>
            </div>
        </GlowingCard>
    );
};
