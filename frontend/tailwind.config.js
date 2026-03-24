/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            colors: {
                surface: {
                    0: '#0a0e17',
                    1: '#0f1420',
                    2: '#151b2b',
                    3: '#1c2438',
                },
                accent: {
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
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
