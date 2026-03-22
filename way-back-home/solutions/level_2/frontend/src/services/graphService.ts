import { api } from './api';
import type { GraphData, GraphNode } from '../types/graph';

export const graphService = {
    // Fetch full graph
    async getGraph(): Promise<GraphData> {
        const response = await api.get('/api/graph');
        return response.data;
    },

    // Fetch single node with relationships
    async getNode(nodeId: string): Promise<GraphNode> {
        const response = await api.get(`/api/graph/nodes/${nodeId}`);
        return response.data;
    },

    // Fetch nodes by type
    async getNodesByType(type: string): Promise<GraphNode[]> {
        const response = await api.get(`/api/graph/nodes?type=${type}`);
        return response.data;
    },

    // Execute custom GQL query
    async executeQuery(query: string): Promise<GraphData> {
        const response = await api.post('/api/graph/query', { query });
        return response.data;
    },

    // Find path between nodes
    async findPath(fromId: string, toId: string): Promise<GraphData> {
        const response = await api.get(`/api/graph/path/${fromId}/${toId}`);
        return response.data;
    },

    // Get neighbors of a node
    async getNeighbors(nodeId: string): Promise<GraphData> {
        const response = await api.get(`/api/graph/neighbors/${nodeId}`);
        return response.data;
    },
};
