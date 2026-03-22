import * as THREE from 'three';
import { SPACE_THEME } from '../../theme/spaceTheme';
import type { GraphNode, NodeType, SurvivorNode } from '../../types/graph';
import { lowPolyPlanetVertex, lowPolyPlanetFragment } from './Shaders';

interface Node3DStyle {
    geometry: string;
    detailLevel: number;
    baseColor: number;
    accentColor: number;
    emissiveIntensity: number;
    hasAvatarFrame: boolean;
    hasCrystalSpikes?: boolean;
    orbitAnimation: string;
}

const NODE_3D_CONFIG: Record<NodeType, Node3DStyle> = {
    'Survivor': {
        geometry: 'icosahedron',
        detailLevel: 1,
        baseColor: 0xa08888, // Dusty rose
        accentColor: 0xc07050,
        emissiveIntensity: 0.1,
        hasAvatarFrame: true,
        orbitAnimation: 'gentle-bob',
    },
    'Skill': {
        geometry: 'octahedron',
        detailLevel: 0,
        baseColor: 0xffd700, // Gold
        accentColor: 0xffaa00,
        emissiveIntensity: 0.4,
        hasAvatarFrame: false,
        orbitAnimation: 'slow-spin',
    },
    'Need': {
        geometry: 'tetrahedron',
        detailLevel: 0,
        baseColor: 0xf87171, // Red
        accentColor: 0xff4444,
        emissiveIntensity: 0.5,
        hasAvatarFrame: false,
        orbitAnimation: 'pulse',
    },
    'Resource': {
        geometry: 'dodecahedron',
        detailLevel: 1,
        baseColor: 0x5a9a8a, // Teal
        accentColor: 0x4a8a7a,
        emissiveIntensity: 0.2,
        hasAvatarFrame: false,
        orbitAnimation: 'float',
    },
    'Biome': {
        geometry: 'icosahedron',
        detailLevel: 2,
        baseColor: 0x806070, // Mauve
        accentColor: 0xa08090,
        emissiveIntensity: 0.05,
        hasAvatarFrame: false,
        hasCrystalSpikes: true,
        orbitAnimation: 'slow-rotate',
    },
};

export class NodeSystem3D {
    private parent: THREE.Object3D;
    private nodeMeshes: Map<string, THREE.Group> = new Map();

    constructor(parent: THREE.Object3D) {
        this.parent = parent;
    }

    public updateNodes(nodes: GraphNode[]) {
        // Simple diffing: remove missing, add new, update existing
        const currentIds = new Set(nodes.map(n => n.id));

        // Remove old
        for (const [id, group] of this.nodeMeshes) {
            if (!currentIds.has(id)) {
                this.parent.remove(group);
                this.nodeMeshes.delete(id);
                // Dispose geometries/materials ideally
            }
        }

        // Add/Update
        nodes.forEach(node => {
            if (this.nodeMeshes.has(node.id)) {
                // Update position if needed (or let layout engine handle it? 
                // For now assuming 2D layout mapped to 3D plane or similar)
                // If the graph store provides position {x,y}, we map to {x, y, 0} or {x, y, z}
                const group = this.nodeMeshes.get(node.id)!;
                if (node.position) {
                    group.position.set(node.position.x, node.position.y, 0); // Start with 2D plane
                }
            } else {
                const group = this.createNode(node);
                if (node.position) {
                    // Scale position for 3D view if needed. 
                    // React Flow coords are usually pixels. 3D coords are arbitrary units.
                    // Let's scale down by 10 or so.
                    group.position.set(node.position.x / 2, -node.position.y / 2, 0);
                }
                this.nodeMeshes.set(node.id, group);
                this.parent.add(group);
            }
        });
    }

    private createNode(node: GraphNode): THREE.Group {
        const config = NODE_3D_CONFIG[node.type];
        const group = new THREE.Group();
        group.userData = { id: node.id, type: node.type };

        // Main Geometry
        let geometry: THREE.BufferGeometry;
        switch (config.geometry) {
            case 'icosahedron': geometry = new THREE.IcosahedronGeometry(10, config.detailLevel); break;
            case 'octahedron': geometry = new THREE.OctahedronGeometry(8, config.detailLevel); break;
            case 'tetrahedron': geometry = new THREE.TetrahedronGeometry(8, config.detailLevel); break;
            case 'dodecahedron': geometry = new THREE.DodecahedronGeometry(9, config.detailLevel); break;
            default: geometry = new THREE.IcosahedronGeometry(10, 1);
        }

        // ✅ Use MeshStandardMaterial for ALL node types (including Biome)
        const material = new THREE.MeshStandardMaterial({
            color: config.baseColor,
            metalness: 0.1,
            roughness: 0.8,
            flatShading: true,
            emissive: config.accentColor,
            emissiveIntensity: config.emissiveIntensity,
        });

        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Add specific features
        if (config.hasAvatarFrame && node.type === 'Survivor') {
            this.addAvatarFrame(group, node as SurvivorNode);
        }

        if (config.hasCrystalSpikes) {
            this.addCrystalSpikes(group);
        }

        return group;
    }

    private addAvatarFrame(group: THREE.Group, _node: SurvivorNode) {
        // frame ring
        const frameGeom = new THREE.TorusGeometry(14, 1.5, 8, 32);
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.2, flatShading: true
        });
        const frame = new THREE.Mesh(frameGeom, frameMat);
        group.add(frame);

        // Placeholder for avatar (circle)
        // If we had texture, we'd use it. For now, a colored disc.
        const disc = new THREE.Mesh(
            new THREE.CircleGeometry(11, 32),
            new THREE.MeshBasicMaterial({ color: 0xcccccc }) // Load texture ideally
        );
        disc.position.z = 0.5;
        group.add(disc);
    }

    private addCrystalSpikes(group: THREE.Group) {
        // Add 5-6 spikes randomly
        for (let i = 0; i < 6; i++) {
            const spike = new THREE.Mesh(
                new THREE.ConeGeometry(2, 8, 4),
                new THREE.MeshStandardMaterial({ color: SPACE_THEME.colors.crystal.teal, flatShading: true })
            );
            // Random position on sphere surface approx
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const x = 10 * Math.sin(phi) * Math.cos(theta);
            const y = 10 * Math.sin(phi) * Math.sin(theta);
            const z = 10 * Math.cos(phi);

            spike.position.set(x, y, z);
            spike.lookAt(0, 0, 0); // Look at center
            spike.rotateX(Math.PI); // Point outward
            group.add(spike);
        }
    }

    public getNodeMesh(id: string): THREE.Group | undefined {
        return this.nodeMeshes.get(id);
    }

    public highlightNodes(_ids: string[]) {
        // Implement highlighting (e.g. scale up, brighten emissive)
    }

    public animate(_time: number) {
        // No shader animations needed with standard materials
    }
}
