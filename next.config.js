/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    domains: ['localhost', 'your-cdn.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for performance
  experimental: {
    // Removed optimizePackageImports as it was causing vendor chunk issues
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Webpack optimizations - Simplified to prevent vendor chunk issues
  webpack: (config, { dev, isServer }) => {
    // Production optimizations - Simplified to avoid conflicts
    if (!dev && !isServer) {
      // Use Next.js default vendor chunk handling
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Let Next.js handle vendor chunks naturally
        },
      }
    }

    // Bundle analyzer (optional)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }

    return config
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' ws://localhost:4001 wss://localhost:4001; img-src 'self' https://images.unsplash.com data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
