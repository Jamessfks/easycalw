import { useCallback } from 'react';
import type { Node, Edge, Connection } from 'reactflow';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';

// Initial mock data
const initialNodes: Node[] = [
    { id: '1', position: { x: 250, y: 100 }, data: { label: 'Frost' }, type: 'input', style: { background: '#60A5FA', color: '#fff', border: 'none' } },
    { id: '2', position: { x: 100, y: 200 }, data: { label: 'Tanaka' }, style: { background: '#F87171', color: '#fff', border: 'none' } },
    { id: '3', position: { x: 400, y: 200 }, data: { label: 'Medical' }, style: { background: '#EF4444', color: '#fff', border: 'none' } },
];
const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#fff' } },
    { id: 'e1-3', source: '1', target: '3', style: { stroke: '#94A3B8' } },
];

export const useGraph = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges
    };
};
