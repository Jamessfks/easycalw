/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Output standalone build for Docker deployment
  output: 'standalone',

  // Configure domains for remote images (participant avatars)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        pathname: '/**',
      },
    ],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.waybackhome.dev',
  },

  // Transpile Three.js packages
  transpilePackages: ['three'],
}

module.exports = nextConfig
