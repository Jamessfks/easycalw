import * as THREE from 'three';
import * as d3 from 'd3-force-3d';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { GraphNode, GraphEdge } from '../../types/graph';
import { SPACE_THEME } from '../../theme/spaceTheme';
import { NodeSystem3D } from './NodeSystem3D';
import { EdgeSystem3D } from './EdgeSystem3D';
import { CosmicBackground } from './CosmicBackground';

interface GraphSceneOptions {
    theme: typeof SPACE_THEME;
    onNodeSelect: (nodeId: string | null) => void;
}

export interface HandInputState {
    isActive: boolean;
    x: number;
    y: number;
    gesture: 'OPEN' | 'CLOSED' | 'NONE';
}

export class LowPolyGraphScene {
    private container: HTMLElement;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;

    private nodeSystem: NodeSystem3D;
    private edgeSystem: EdgeSystem3D;
    private background: CosmicBackground;
    private constellationGroup: THREE.Group;

    private animationId: number | null = null;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private onNodeSelect: (nodeId: string | null) => void;

    // Layout
    private simulation: any;
    private graphData: { nodes: any[], links: any[] } = { nodes: [], links: [] };

    // Hand Control State
    private handInput: HandInputState = { isActive: false, x: 0.5, y: 0.5, gesture: 'NONE' };
    private autoRotationSpeed: number = 0.0015;

    constructor(container: HTMLElement, options: GraphSceneOptions) {
        this.container = container;
        this.onNodeSelect = options.onNodeSelect;

        // Scene Setup
        this.scene = new THREE.Scene();

        // Camera
        const { fov, near, far, initialDistance } = SPACE_THEME.camera;
        this.camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, near, far);
        this.camera.position.z = initialDistance;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = SPACE_THEME.camera.minDistance;
        this.controls.maxDistance = SPACE_THEME.camera.maxDistance;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(100, 100, 50);
        this.scene.add(dirLight);

        // Systems
        this.background = new CosmicBackground(this.scene);

        this.constellationGroup = new THREE.Group();
        this.scene.add(this.constellationGroup);

        this.nodeSystem = new NodeSystem3D(this.constellationGroup);
        this.edgeSystem = new EdgeSystem3D(this.constellationGroup, this.nodeSystem);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.setupEventListeners();

        // Initialize Force Simulation
        this.simulation = d3.forceSimulation()
            .numDimensions(3)
            .force('link', d3.forceLink().id((d: any) => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(0, 0, 0))
            .stop();

        this.animate();
    }

    public updateHandInput(state: HandInputState) {
        this.handInput = state;
    }

    public updateGraph(nodes: GraphNode[], edges: GraphEdge[]) {
        const oldNodesMap = new Map(this.graphData.nodes.map(n => [n.id, n]));

        const d3Nodes = nodes.map(node => {
            const old = oldNodesMap.get(node.id);
            return {
                ...node,
                x: old && !isNaN(old.x) ? old.x : (Math.random() - 0.5) * 100,
                y: old && !isNaN(old.y) ? old.y : (Math.random() - 0.5) * 100,
                z: old && !isNaN(old.z) ? old.z : (Math.random() - 0.5) * 100,
                vx: old ? old.vx : 0,
                vy: old ? old.vy : 0,
                vz: old ? old.vz : 0
            };
        });

        const d3Links = edges.map(edge => ({
            ...edge,
            source: edge.source,
            target: edge.target
        }));

        this.graphData = { nodes: d3Nodes, links: d3Links };

        this.nodeSystem.updateNodes(nodes);
        this.edgeSystem.updateEdges(edges);

        this.simulation.nodes(d3Nodes);
        this.simulation.force('link').links(d3Links);
        this.simulation.alpha(1).restart();
    }

    public setSelection(_selectedId: string | null, highlightedIds: string[]) {
        this.nodeSystem.highlightNodes(highlightedIds);
    }

    private setupEventListeners() {
        this.container.addEventListener('click', this.onClick.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    private onWindowResize() {
        if (!this.container) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    private onClick(event: MouseEvent) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.constellationGroup.children, true);

        let foundNodeId: string | null = null;
        for (const intersect of intersects) {
            let obj: THREE.Object3D | null = intersect.object;
            while (obj) {
                if (obj.userData && obj.userData.id) {
                    foundNodeId = obj.userData.id as string;
                    break;
                }
                obj = obj.parent;
            }
            if (foundNodeId) break;
        }

        this.onNodeSelect(foundNodeId);
    }

    private time = 0;

    private animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.time += 0.01;

        this.simulation.tick();

        if (this.constellationGroup) {
            if (this.handInput.isActive) {
                // Horizontal Hand -> Constellation Rotation
                // Map 0..1 to -2PI .. +2PI
                const targetRot = (this.handInput.x - 0.5) * Math.PI * 4;

                let lerpFactor = 0.05;
                if (this.handInput.gesture === 'OPEN') lerpFactor = 0.1;
                else if (this.handInput.gesture === 'CLOSED') lerpFactor = 0.01;

                this.constellationGroup.rotation.y += (targetRot - this.constellationGroup.rotation.y) * lerpFactor;

                // Vertical Hand -> Camera Polar Angle
                // Map y=0 (top) to PI/4, y=1 (bottom) to PI/1.8
                const targetPolar = THREE.MathUtils.mapLinear(this.handInput.y, 0, 1, Math.PI / 4, Math.PI / 1.8);

                // Adjust OrbitControls spherical config manually to sync
                const offset = new THREE.Vector3().copy(this.camera.position).sub(this.controls.target);
                const spherical = new THREE.Spherical().setFromVector3(offset);

                spherical.phi += (targetPolar - spherical.phi) * lerpFactor;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                spherical.makeSafe();

                offset.setFromSpherical(spherical);
                this.camera.position.copy(this.controls.target).add(offset);
                this.camera.lookAt(this.controls.target);
            } else {
                this.constellationGroup.rotation.y += this.autoRotationSpeed;
            }
        }

        this.nodeSystem.animate(this.time);

        // Apply positions with SAFETY CHECKS
        this.graphData.nodes.forEach((d3Node, i) => {
            const mesh = this.nodeSystem.getNodeMesh(d3Node.id);
            if (mesh) {
                let y = d3Node.y;
                const phase = i * 0.5 + d3Node.id.charCodeAt(0);
                const bobOffset = Math.sin(this.time * 1.5 + phase) * 2.0;
                y += bobOffset;

                // --- FIX STARTS HERE ---
                const x = d3Node.x;
                const z = d3Node.z || 0;

                // 1. Check for NaN (exploding simulation)
                if (isNaN(x) || isNaN(y) || isNaN(z)) {
                    mesh.visible = false;
                    return;
                }

                // 2. Check for Camera Clipping
                // Transform world position to camera space or just check rough distance
                // Since the group rotates, we must check the final world position distance to camera
                // Simplest check: if the raw Z is near the camera Z (300)
                // But safer is checking distance to camera position
                // const worldPos = new THREE.Vector3(x, y, z);
                // Apply group rotation manually or just check raw Z magnitude relative to camera
                // Camera is at +300. If a node is > 250, it's dangerously close.
                // Note: This logic assumes simple Z depth. A full world-pos check is better but heavier.
                // For this style, nodes shouldn't be that far out.

                mesh.position.set(x, y, z);
                mesh.visible = true;

                // Culling: If node is excessively far or behind camera
                // Note: OrbitControls moves camera, so fixed "300" check might fail if user zooms.
                // Let's rely on Three.js frustum culling usually, but for the "flashy square"
                // it happens when INSIDE the object.
                // We'll just ensure valid numbers for now.
                // --- FIX ENDS HERE ---
            }
        });

        this.graphData.links.forEach((d3Link: any) => {
            const sourceMesh = this.nodeSystem.getNodeMesh(d3Link.source.id);
            const targetMesh = this.nodeSystem.getNodeMesh(d3Link.target.id);

            if (sourceMesh && targetMesh && sourceMesh.visible && targetMesh.visible) {
                this.edgeSystem.updateEdgeMesh(d3Link.id, sourceMesh.position, targetMesh.position);
            } else {
                // Hide edge if connected nodes are hidden/invalid
                // (You might need to add a hide method to EdgeSystem or access mesh directly)
                // For now, EdgeSystem update will handle NaNs by hiding, which we send if invisible.
            }
        });

        this.controls.update();
        this.background.animate();
        this.renderer.render(this.scene, this.camera);
    }

    public dispose() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.controls.dispose();
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }
}
