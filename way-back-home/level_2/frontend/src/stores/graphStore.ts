import { create } from 'zustand';
import type { GraphNode, GraphEdge } from '../types/graph';
import { graphService } from '../services/graphService';

interface GraphState {
    nodes: GraphNode[];
    edges: GraphEdge[];
    selectedNodeId: string | null;
    highlightedNodeIds: string[];
    highlightedEdgeIds: string[];
    filter: 'all' | 'survivors' | 'skills' | 'needs' | 'biomes';
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchGraph: () => Promise<void>;
    selectNode: (nodeId: string | null) => void;
    highlightNodes: (nodeIds: string[]) => void;
    highlightEdges: (edgeIds: string[]) => void;
    clearHighlights: () => void;
    setFilter: (filter: GraphState['filter']) => void;
    focusOnNode: (nodeId: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    highlightedNodeIds: [],
    highlightedEdgeIds: [],
    filter: 'all',
    isLoading: false,
    error: null,

    fetchGraph: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await graphService.getGraph();
            set({ nodes: data.nodes, edges: data.edges, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to load graph',
                isLoading: false
            });
        }
    },

    selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

    highlightNodes: (nodeIds) => set({ highlightedNodeIds: nodeIds }),

    highlightEdges: (edgeIds) => set({ highlightedEdgeIds: edgeIds }),

    clearHighlights: () => set({ highlightedNodeIds: [], highlightedEdgeIds: [] }),

    setFilter: (filter) => set({ filter }),

    focusOnNode: (nodeId) => {
        // This will be handled by React Flow instance
        set({ selectedNodeId: nodeId, highlightedNodeIds: [nodeId] });
    },
}));
