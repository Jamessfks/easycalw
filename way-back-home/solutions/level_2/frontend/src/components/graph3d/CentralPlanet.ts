import * as THREE from 'three';
import { SPACE_THEME } from '../../theme/spaceTheme';
import { lowPolyPlanetVertex, lowPolyPlanetFragment } from './Shaders';

export class CentralPlanet {
    private scene: THREE.Scene;
    private mesh: THREE.Mesh;
    private atmosphere: THREE.Mesh;
    private radius: number = 40;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.init();
    }

    private init() {
        // Core Planet
        const geometry = new THREE.IcosahedronGeometry(this.radius, 4); // High detail for displacement

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uTopColor: { value: new THREE.Color(0x2a5a8a) }, // Earth Blue
                uBottomColor: { value: new THREE.Color(0x1a3a4a) }, // Deep Ocean
                uAtmosphereColor: { value: new THREE.Color(0x4a9afa) }, // Light Blue Atmosphere
            },
            vertexShader: lowPolyPlanetVertex,
            fragmentShader: lowPolyPlanetFragment,
            flatShading: true,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Atmosphere Halo (slightly larger shell)
        const atmGeometry = new THREE.IcosahedronGeometry(this.radius * 1.2, 2);
        const atmMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a9afa,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide, // Inverted for glow effect from behind
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.atmosphere = new THREE.Mesh(atmGeometry, atmMaterial);
        this.scene.add(this.atmosphere);
    }

    public getPosition(): THREE.Vector3 {
        return this.mesh.position;
    }

    public getRadius(): number {
        return this.radius;
    }

    public animate(time: number) {
        // Rotate planet
        this.mesh.rotation.y = time * 0.05;
        this.atmosphere.rotation.y = time * 0.03;

        // Update uniforms
        if (this.mesh.material instanceof THREE.ShaderMaterial) {
            this.mesh.material.uniforms.uTime.value = time;
        }
    }

    public dispose() {
        this.scene.remove(this.mesh);
        this.scene.remove(this.atmosphere);
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
        this.atmosphere.geometry.dispose();
        (this.atmosphere.material as THREE.Material).dispose();
    }
}
