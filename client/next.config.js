/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['via.placeholder.com', 'localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Output configuration for Vercel
  output: 'standalone',
  // Disable font optimization during build if network issues occur
  optimizeFonts: true,
}

module.exports = nextConfig
