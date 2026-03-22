import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../../stores/graphStore';
import { GlowingCard } from '../shared/GlowingCard';
import { CustomNode } from './CustomNode';
import { GraphLegend } from './GraphLegend';

export const GraphCanvas: React.FC = () => {
    const {
        nodes: graphNodes,
        edges: graphEdges,
        selectedNodeId,
        highlightedNodeIds,
        selectNode,
    } = useGraphStore();

    // Define custom node types
    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    // Convert graph nodes to React Flow nodes
    const convertedNodes: Node[] = graphNodes.map((node) => ({
        id: node.id,
        type: 'custom',
        position: node.position || { x: Math.random() * 500, y: Math.random() * 500 },
        data: {
            label: node.label,
            type: node.type,
            isSelected: selectedNodeId === node.id,
            isHighlighted: highlightedNodeIds.includes(node.id),
            ...node.properties,
        },
    }));

    // Convert graph edges to React Flow edges
    const convertedEdges: Edge[] = graphEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'default',
        style: {
            stroke: highlightedNodeIds.includes(edge.source) || highlightedNodeIds.includes(edge.target)
                ? '#00f5ff'
                : '#555',
            strokeWidth: highlightedNodeIds.includes(edge.source) || highlightedNodeIds.includes(edge.target) ? 2 : 1,
        },
        animated: highlightedNodeIds.includes(edge.source) || highlightedNodeIds.includes(edge.target),
    }));

    const [nodes, setNodes, onNodesChange] = useNodesState(convertedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(convertedEdges);

    // Update nodes and edges when graph data changes
    useEffect(() => {
        setNodes(convertedNodes);
        setEdges(convertedEdges);
    }, [graphNodes, graphEdges, selectedNodeId, highlightedNodeIds]);

    const onNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            selectNode(node.id);
        },
        [selectNode]
    );

    return (
        <GlowingCard glowColor="cyan" className="h-full w-full">
            <div style={{ width: '100%', height: '100%', minHeight: '400px' }} className="rounded-lg overflow-hidden relative">
                <GraphLegend />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <Background color="#333" gap={16} />
                    <Controls className="bg-space-700/90 border-gray-700" />
                    <MiniMap
                        className="bg-space-800/90 border border-gray-700"
                        nodeColor={(node) => {
                            if (highlightedNodeIds.includes(node.id)) return '#00f5ff';
                            if (selectedNodeId === node.id) return '#00f5ff';
                            return '#555';
                        }}
                    />
                </ReactFlow>
            </div>
        </GlowingCard>
    );
};
