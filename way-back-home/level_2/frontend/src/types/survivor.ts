// Extended survivor-specific types

import type { BiomeType } from './graph';

export interface SurvivorStatus {
    status: 'active' | 'inactive' | 'critical';
    lastSeen?: string;
    health?: number;
}

export interface Connection {
    nodeId: string;
    nodeName: string;
    nodeType: string;
    edgeType: string;
    description?: string;
}

export interface SurvivorConnection extends Connection {
    biome?: BiomeType;
    distance?: number;
}
