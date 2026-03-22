// Type definitions for graph nodes and edges

export type NodeType = 'Survivor' | 'Skill' | 'Need' | 'Resource' | 'Biome';

export type EdgeType =
    | 'HAS_SKILL'
    | 'CAN_HELP'
    | 'HAS_NEED'
    | 'IN_BIOME'
    | 'FOUND_RESOURCE'
    | 'TREATS';

export type BiomeType = 'CRYO' | 'VOLCANIC' | 'BIOLUMINESCENT' | 'FOSSILIZED';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type SkillCategory = 'medical' | 'technical' | 'science' | 'survival' | 'leadership';

export interface GraphNode {
    id: string;
    type: NodeType;
    label: string;
    properties: Record<string, any>;
    position?: { x: number; y: number };
}

export interface SurvivorNode extends GraphNode {
    type: 'Survivor';
    properties: {
        name: string;
        callsign: string;
        role: string;
        biome: BiomeType;
        quadrant: string;
        status: 'active' | 'inactive' | 'critical';
        color: string;
        avatarUrl?: string;
        description?: string;
    };
}

export interface SkillNode extends GraphNode {
    type: 'Skill';
    properties: {
        name: string;
        category: SkillCategory;
        icon: string;
        color: string;
    };
}

export interface NeedNode extends GraphNode {
    type: 'Need';
    properties: {
        description: string;
        category: string;
        urgency: UrgencyLevel;
        icon: string;
    };
}

export interface BiomeNode extends GraphNode {
    type: 'Biome';
    properties: {
        name: BiomeType;
        color: string;
        description?: string;
    };
}

export interface ResourceNode extends GraphNode {
    type: 'Resource';
    properties: {
        name: string;
        description?: string;
        quantity?: number;
    };
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type: EdgeType;
    label?: string;
    properties?: Record<string, any>;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}
