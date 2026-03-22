/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Background layers (deep space)
                space: {
                    900: '#0a0a0f',  // Deep space black
                    800: '#12121a',  // Slightly lighter
                    700: '#1a1a2e',  // Card backgrounds
                    600: '#252538',  // Elevated surfaces
                    500: '#2d2d44',  // Higher elevation
                },
                // Accent colors (holographic/sci-fi)
                accent: {
                    cyan: '#00f5ff',    // Primary accent (hologram blue)
                    purple: '#bf5fff',  // Secondary accent
                    pink: '#ff5fdc',    // Tertiary accent
                    green: '#00ff9d',   // Success/active signals
                    orange: '#ff9f43',  // Warning signals
                    red: '#ff4757',     // Critical/danger
                },
                // Biome colors (for survivor nodes)
                biome: {
                    cryo: '#60a5fa',           // Ice blue
                    volcanic: '#f87171',       // Lava red
                    bioluminescent: '#a78bfa', // Glowing purple
                    fossilized: '#fbbf24',     // Amber yellow
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.5)',
                'glow-purple': '0 0 20px rgba(191, 95, 255, 0.5)',
                'glow-green': '0 0 20px rgba(0, 255, 157, 0.5)',
                'glow-red': '0 0 20px rgba(255, 71, 87, 0.5)',
                'glow-sm-cyan': '0 0 10px rgba(0, 245, 255, 0.3)',
                'glow-sm-purple': '0 0 10px rgba(191, 95, 255, 0.3)',
                'glow-sm-green': '0 0 10px rgba(0, 255, 157, 0.3)',
                'glow-sm-red': '0 0 10px rgba(255, 71, 87, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'scan': 'scan 8s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'twinkle': 'twinkle 4s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%': { opacity: '0.5' },
                    '100%': { opacity: '1' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                twinkle: {
                    '0%, 100%': { opacity: '0.3' },
                    '50%': { opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
