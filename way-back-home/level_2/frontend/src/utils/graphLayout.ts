import type { GraphNode, GraphEdge } from '../types/graph';

/**
 * Auto-layout utilities for graph nodes
 */

/**
 * Simple force-directed layout algorithm
 * This is a basic implementation - for production, consider using d3-force or similar
 */
export function calculateNodePositions(
    nodes: GraphNode[],
    _edges: GraphEdge[],
    width: number = 1000,
    height: number = 800
): GraphNode[] {
    // If nodes already have positions, return them
    if (nodes.every(n => n.position)) {
        return nodes;
    }

    // Group nodes by type for better organization
    const nodesByType = nodes.reduce((acc, node) => {
        if (!acc[node.type]) acc[node.type] = [];
        acc[node.type].push(node);
        return acc;
    }, {} as Record<string, GraphNode[]>);

    const types = Object.keys(nodesByType);
    const angleStep = (2 * Math.PI) / types.length;
    const radius = Math.min(width, height) * 0.35;

    // Position nodes in concentric circles by type
    types.forEach((type, typeIndex) => {
        const nodesOfType = nodesByType[type];
        const typeAngle = angleStep * typeIndex;
        const typeRadius = radius;

        nodesOfType.forEach((node, nodeIndex) => {
            const nodeAngle = typeAngle + (nodeIndex / nodesOfType.length) * angleStep * 0.8;

            node.position = {
                x: width / 2 + typeRadius * Math.cos(nodeAngle),
                y: height / 2 + typeRadius * Math.sin(nodeAngle),
            };
        });
    });

    return nodes;
}

/**
 * Get bounding box of selected nodes
 */
export function getNodesBoundingBox(nodes: GraphNode[]): {
    x: number;
    y: number;
    width: number;
    height: number;
} {
    if (nodes.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    const positions = nodes
        .filter(n => n.position)
        .map(n => n.position!);

    if (positions.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = positions.map(p => p.x);
    const ys = positions.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
