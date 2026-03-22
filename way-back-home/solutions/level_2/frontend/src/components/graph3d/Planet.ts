import * as THREE from 'three';
import { lowPolyPlanetVertex, lowPolyPlanetFragment } from './Shaders';

export class Planet {
    private scene: THREE.Scene;
    private mesh: THREE.Mesh | null = null;
    private uniforms: any;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.init();
    }

    private init() {
        // Detailed Icosahedron for the planet
        const geometry = new THREE.IcosahedronGeometry(20, 4); // Radius 20, detail 4

        this.uniforms = {
            uTime: { value: 0 },
            uTopColor: { value: new THREE.Color(0x6a0dad) }, // Deep Purple
            uBottomColor: { value: new THREE.Color(0x1a0b2e) }, // Darker Purple
            // uAtmosphereColor: { value: new THREE.Color(0x00ffff) }, // Teal (cyan)
            uAtmosphereColor: { value: new THREE.Color(0x40e0d0) }, // Turquoise
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: lowPolyPlanetVertex,
            fragmentShader: lowPolyPlanetFragment,
            uniforms: this.uniforms,
            transparent: true,
            side: THREE.FrontSide,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    public animate(time: number) {
        if (this.mesh) {
            // Slow rotation
            this.mesh.rotation.y += 0.001;
            this.mesh.rotation.z += 0.0005;

            // Pulse via time
            this.uniforms.uTime.value = time * 0.001;
        }
    }
}
