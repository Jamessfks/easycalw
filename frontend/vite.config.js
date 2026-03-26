import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/format': 'http://localhost:8000',
            '/generate-guide': 'http://localhost:8000',
            '/guide': 'http://localhost:8000',
            '/mock-generate': 'http://localhost:8000',
            '/webhook': 'http://localhost:8000',
            '/health': 'http://localhost:8000',
            '/events': 'http://localhost:8000',
            '/demos': 'http://localhost:8000',
            '/demo-stream': 'http://localhost:8000',
            '/retry-guide': 'http://localhost:8000',
        },
    },
})
