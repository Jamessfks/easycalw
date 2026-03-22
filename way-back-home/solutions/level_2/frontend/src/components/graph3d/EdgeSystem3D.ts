import * as THREE from 'three';
import type { GraphEdge } from '../../types/graph';
import { NodeSystem3D } from './NodeSystem3D';

export class EdgeSystem3D {
    private parent: THREE.Object3D;
    private edgeLines: Map<string, THREE.Line> = new Map();
    private nodeSystem: NodeSystem3D;
    private material: THREE.LineBasicMaterial;

    constructor(parent: THREE.Object3D, nodeSystem: NodeSystem3D) {
        this.parent = parent;
        this.nodeSystem = nodeSystem;

        // Shared material for all edges
        this.material = new THREE.LineBasicMaterial({
            color: 0x4a8a7a,
            transparent: true,
            opacity: 0.6,
        });
    }

    public updateEdges(edges: GraphEdge[]) {
        const currentIds = new Set(edges.map(e => e.id));

        // Remove old edges
        for (const [id, line] of this.edgeLines) {
            if (!currentIds.has(id)) {
                this.parent.remove(line);
                line.geometry.dispose();
                this.edgeLines.delete(id);
            }
        }

        // Add new edges
        edges.forEach(edge => {
            if (!this.edgeLines.has(edge.id)) {
                const line = this.createEdge(edge);
                this.edgeLines.set(edge.id, line);
                this.parent.add(line);
            }
        });
    }

    private createEdge(edge: GraphEdge): THREE.Line {
        // Create with dummy points - will be updated in animate loop
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6); // 2 points × 3 components
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const line = new THREE.Line(geometry, this.material);
        line.userData = { id: edge.id, type: 'edge' };
        line.frustumCulled = false; // Prevent culling issues

        return line;
    }

    public updateEdgeMesh(id: string, start: THREE.Vector3, end: THREE.Vector3) {
        const line = this.edgeLines.get(id);
        if (!line) return;

        // Validate positions
        if (
            !isFinite(start.x) || !isFinite(start.y) || !isFinite(start.z) ||
            !isFinite(end.x) || !isFinite(end.y) || !isFinite(end.z)
        ) {
            line.visible = false;
            return;
        }

        // Check for degenerate edge (same point)
        if (start.distanceToSquared(end) < 0.01) {
            line.visible = false;
            return;
        }

        line.visible = true;

        // Update geometry positions directly
        const positions = line.geometry.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, start.x, start.y, start.z);
        positions.setXYZ(1, end.x, end.y, end.z);
        positions.needsUpdate = true;

        // Update bounding sphere for proper rendering
        line.geometry.computeBoundingSphere();
    }

    public dispose() {
        for (const [, line] of this.edgeLines) {
            line.geometry.dispose();
            this.parent.remove(line);
        }
        this.edgeLines.clear();
        this.material.dispose();
    }
}
