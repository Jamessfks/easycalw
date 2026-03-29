/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            colors: {
                surface: {
                    0: '#0C0A09',
                    1: '#1C1917',
                    2: '#292524',
                    3: '#44403C',
                },
                accent: {
                    primary: '#F97316',
                    hover: '#EA580C',
                    soft: '#FFEDD5',
                    glow: '#FB923C',
                    secondary: '#8B5CF6',
                    cyan: '#22d3ee',
                    blue: '#3b82f6',
                    green: '#34d399',
                    amber: '#fbbf24',
                    rose: '#fb7185',
                },
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-ring': 'pulse-ring 2s ease-out infinite',
                'gradient-x': 'gradient-x 8s ease infinite',
                'fade-up': 'fade-up 0.6s ease-out forwards',
                'fade-in': 'fade-in 0.4s ease-out forwards',
                'spin-slow': 'spin 3s linear infinite',
                'progress': 'progress 4s ease-in-out infinite',
                'orbit': 'orbit 12s linear infinite',
                'waveform': 'waveform 1.2s ease-in-out infinite',
                'claw-idle': 'claw-idle 4s ease-in-out infinite',
                'claw-snap': 'claw-snap 0.3s ease-in-out',
                'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'pulse-ring': {
                    '0%': { transform: 'scale(1)', opacity: '0.6' },
                    '100%': { transform: 'scale(1.8)', opacity: '0' },
                },
                'gradient-x': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                progress: {
                    '0%': { width: '0%' },
                    '50%': { width: '70%' },
                    '100%': { width: '100%' },
                },
                orbit: {
                    '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
                },
                waveform: {
                    '0%, 100%': { transform: 'scaleY(0.3)' },
                    '50%': { transform: 'scaleY(1)' },
                },
                'claw-idle': {
                    '0%, 100%': { transform: 'rotateY(0deg) rotateX(5deg)' },
                    '25%': { transform: 'rotateY(15deg) rotateX(0deg)' },
                    '50%': { transform: 'rotateY(0deg) rotateX(-5deg)' },
                    '75%': { transform: 'rotateY(-15deg) rotateX(0deg)' },
                },
                'claw-snap': {
                    '0%': { transform: 'rotate(0deg)' },
                    '40%': { transform: 'rotate(-15deg)' },
                    '100%': { transform: 'rotate(0deg)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
                    '50%': { opacity: '0.7', transform: 'scale(1.1)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
