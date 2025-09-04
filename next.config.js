/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplified webpack configuration for better performance
  webpack: (config, { dev, isServer }) => {
    // Only apply minimal fixes in development
    if (dev) {
      // Basic fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false
      }
    }

    return config
  },

  // Basic production optimizations
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