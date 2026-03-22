import * as THREE from 'three';
import { SPACE_THEME } from '../../theme/spaceTheme';

export class CosmicBackground {
    private scene: THREE.Scene;
    private stars: THREE.Points | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.init();
    }

    private init() {
        this.scene.background = new THREE.Color(0x0a0a15); // Solid dark background
        this.createStars();
    }

    private createStars() {
        const count = 800;
        const positions: number[] = [];
        const colors: number[] = [];
        const sizes: number[] = [];

        for (let i = 0; i < count; i++) {
            // Spread stars in a large sphere around the scene
            const radius = 400 + Math.random() * 600; // Between 400 and 1000 units away
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions.push(x, y, z);

            // White/slightly blue stars
            colors.push(1, 1, 1);

            // Small consistent sizes
            sizes.push(1 + Math.random() * 2);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        // Simple point material - no custom shaders!
        const material = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    public animate() {
        if (this.stars) {
            // Very slow rotation
            this.stars.rotation.y += 0.0001;
            this.stars.rotation.x += 0.00005;
        }
    }

    public dispose() {
        if (this.stars) {
            this.stars.geometry.dispose();
            (this.stars.material as THREE.Material).dispose();
            this.scene.remove(this.stars);
        }
    }
}
