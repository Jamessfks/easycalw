import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Way Back Home color palette - soft pastels with warm accents
        space: {
          // Primary palette
          lavender: '#C4B5E0',
          'lavender-light': '#DED4F0',
          'lavender-dark': '#9B8AC4',
          
          // Mint greens (alien vegetation)
          mint: '#A8E6CF',
          'mint-light': '#C8F4E0',
          'mint-dark': '#7DD3B0',
          
          // Warm terracotta (ground)
          terracotta: '#E8A87C',
          'terracotta-light': '#F4C9A8',
          'terracotta-dark': '#D4855A',
          
          // Peach/coral (sky, accents)
          peach: '#F8B4B4',
          'peach-light': '#FCD5D5',
          'peach-dark': '#E88E8E',
          
          // Cream (astronaut suit, UI)
          cream: '#FFF8F0',
          'cream-dark': '#F5EBE0',
          
          // Orange (warning lights, accents)
          orange: '#FF9F43',
          'orange-light': '#FFB978',
          'orange-dark': '#E8872E',
          
          // Deep space (backgrounds)
          void: '#1A1625',
          'void-light': '#2D2640',
          'void-lighter': '#3F3659',
        },
      },
      fontFamily: {
        // Display font for headings
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        // Body font
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        // Monospace for data/coordinates
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'drift': 'drift 15s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(5px, 5px)' },
          '50%': { transform: 'translate(0, 10px)' },
          '75%': { transform: 'translate(-5px, 5px)' },
        },
      },
      backgroundImage: {
        'gradient-space': 'linear-gradient(180deg, #1A1625 0%, #2D2640 50%, #3F3659 100%)',
        'gradient-sky': 'linear-gradient(180deg, #9B8AC4 0%, #F8B4B4 50%, #FF9F43 100%)',
        'gradient-radial-glow': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(255, 159, 67, 0.4)',
        'glow-mint': '0 0 20px rgba(168, 230, 207, 0.4)',
        'glow-lavender': '0 0 20px rgba(196, 181, 224, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
