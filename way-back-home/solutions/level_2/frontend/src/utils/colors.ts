import type { BiomeType, UrgencyLevel, NodeType, SkillCategory } from '../types/graph';

/**
 * Color mappings for different node types and states
 */

export const biomeColors: Record<BiomeType, string> = {
    CRYO: '#60a5fa',           // Ice blue
    VOLCANIC: '#f87171',       // Lava red
    BIOLUMINESCENT: '#a78bfa', // Glowing purple
    FOSSILIZED: '#fbbf24',     // Amber yellow
};

export const urgencyColors: Record<UrgencyLevel, string> = {
    low: '#00ff9d',    // Green
    medium: '#ff9f43', // Orange
    high: '#ff4757',   // Red
};

export const skillCategoryColors: Record<SkillCategory, string> = {
    medical: '#ef4444',      // Red
    technical: '#3b82f6',    // Blue
    science: '#8b5cf6',      // Purple
    survival: '#10b981',     // Green
    leadership: '#f59e0b',   // Amber
};

export const nodeTypeColors: Record<NodeType, string> = {
    Survivor: '#00f5ff',    // Cyan
    Skill: '#bf5fff',       // Purple
    Need: '#ff4757',        // Red
    Resource: '#00ff9d',    // Green
    Biome: '#ff5fdc',       // Pink
};

/**
 * Get glow shadow string for a color
 */
export function getGlowShadow(color: string, intensity: 'sm' | 'md' | 'lg' = 'md'): string {
    const sizes = {
        sm: '0 0 10px',
        md: '0 0 20px',
        lg: '0 0 30px',
    };

    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${sizes[intensity]} rgba(${r}, ${g}, ${b}, 0.5)`;
}

/**
 * Get biome color by name
 */
export function getBiomeColor(biome: BiomeType): string {
    return biomeColors[biome] || biomeColors.CRYO;
}

/**
 * Get urgency color
 */
export function getUrgencyColor(urgency: UrgencyLevel): string {
    return urgencyColors[urgency] || urgencyColors.low;
}

/**
 * Get skill category color
 */
export function getSkillColor(category: SkillCategory): string {
    return skillCategoryColors[category] || skillCategoryColors.technical;
}

/**
 * Get node type color
 */
export function getNodeColor(type: NodeType): string {
    return nodeTypeColors[type] || nodeTypeColors.Survivor;
}
