const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable optimized images - major performance improvement
    unoptimized: false,
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Optimize production builds
  compress: true,
  poweredByHeader: false,
  
  // Experimental optimizations
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizePackageImports: ['@heroicons/react'],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle in production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Separate vendor chunks for better caching
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Separate chunk for common UI components
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /src\/components\/ui/,
            priority: 10,
          },
          // Separate chunk for TipTap editor
          editor: {
            name: 'editor',
            chunks: 'all',
            test: /@tiptap/,
            priority: 30,
          },
        },
      }
    }
    
    return config
  },
  
  // Add your domain to the allowed list
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' https://images.unsplash.com data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          },
          // Add caching headers for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ]
      }
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
