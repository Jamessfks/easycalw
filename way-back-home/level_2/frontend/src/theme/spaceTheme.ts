export const SPACE_THEME = {
    // Colors from reference image
    colors: {
        background: {
            top: 0x1a1a2e,
            bottom: 0x0f0f1a,
        },
        nebula: 0x4a3a5a,
        planet: {
            light: 0xa08090,
            mid: 0x806070,
            dark: 0x504050,
            shadow: 0x302030,
        },
        crystal: {
            teal: 0x5a9a8a,
            tealDark: 0x4a8a7a,
        },
        copper: 0xc07050,
        purple: 0x7a6a8a,
        star: 0xffffff,
    },

    // Node type mappings (preserve original type colors conceptually)
    nodeTypes: {
        'Survivor': { color: 0xa08888, geometry: 'icosahedron', hasAvatar: true },
        'Skill': { color: 0xffd700, geometry: 'octahedron', glow: 0.4 },
        'Need': { color: 0xf87171, geometry: 'tetrahedron', pulse: true },
        'Resource': { color: 0x5a9a8a, geometry: 'dodecahedron' },  // Teal!
        'Biome': { color: 0x806070, geometry: 'icosahedron', hasSpikes: true },
    },

    // Hand tracking
    smoothing: {
        position: 0.05,
        rotation: 0.08,
        gestureHoldFrames: 9,
    },

    // Camera
    camera: {
        fov: 60,
        near: 0.1,
        far: 2000,
        initialDistance: 300,
        minDistance: 50,
        maxDistance: 800,
    },
};
