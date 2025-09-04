/** @type {import('next').NextConfig} */
const nextConfig = {
  // Let Next.js handle CSS processing by default
  // No custom webpack configuration to avoid CSS processing issues

  // Production optimizations
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['localhost']
  },

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  }
}

module.exports = nextConfig