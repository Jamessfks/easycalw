import React, { useRef, useEffect } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import { LowPolyGraphScene, type HandInputState } from './LowPolyGraphScene';
import { SPACE_THEME } from '../../theme/spaceTheme';
import { HandTrackingControl } from './HandTrackingControl';

export const Graph3DCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<LowPolyGraphScene | null>(null);

    // Callbacks
    const handleHandUpdate = (state: HandInputState) => {
        sceneRef.current?.updateHandInput(state);
    };

    const {
        nodes: graphNodes,
        edges: graphEdges,
        selectedNodeId,
        highlightedNodeIds,
        selectNode,
    } = useGraphStore();

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize 3D scene
        sceneRef.current = new LowPolyGraphScene(containerRef.current, {
            theme: SPACE_THEME,
            onNodeSelect: selectNode,
        });

        return () => sceneRef.current?.dispose();
    }, []); // Run once on mount

    // Update graph data
    useEffect(() => {
        sceneRef.current?.updateGraph(graphNodes, graphEdges);
    }, [graphNodes, graphEdges]);

    // Update selection
    useEffect(() => {
        sceneRef.current?.setSelection(selectedNodeId, highlightedNodeIds);
    }, [selectedNodeId, highlightedNodeIds]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px]"
            style={{
                position: 'relative',
                zIndex: 1,
                isolation: 'isolate'
            }}
        >
            <HandTrackingControl onHandUpdate={handleHandUpdate} />
        </div>
    );
};
