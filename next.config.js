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
  },

  // Development optimizations to prevent crashes
  experimental: {
    // Optimize memory usage
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },

  // Webpack optimizations for development stability
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Reduce memory pressure in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }
    
    // Increase memory limit for webpack
    config.performance = {
      ...config.performance,
      maxAssetSize: 5000000,
      maxEntrypointSize: 5000000,
    }

    return config
  },

  // Optimize for large projects
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig