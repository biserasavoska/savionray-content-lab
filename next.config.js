/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-grade webpack configuration based on research
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in development to prevent corruption
    if (dev) {
      // Fix webpack module resolution issues
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
        path: false,
        // Add missing fallbacks that cause issues
        gl: false,
        canvas: false,
        'canvas-prebuilt': false,
        'gl-constants': false,
        'gl-matrix': false
      }

      // Fix webpack optimization issues in development
      config.optimization = {
        ...config.optimization,
        // Disable problematic optimizations in dev
        splitChunks: false,
        runtimeChunk: false,
        minimize: false,
        concatenateModules: false,
        // Use named module IDs for better debugging
        moduleIds: 'named',
        chunkIds: 'named'
      }

      // Remove problematic plugins in development
      config.plugins = config.plugins.filter(plugin => {
        const pluginName = plugin.constructor.name
        return ![
          'SplitChunksPlugin',
          'RuntimeChunkPlugin',
          'ModuleConcatenationPlugin',
          'OptimizeCssAssetsWebpackPlugin'
        ].includes(pluginName)
      })

      // Fix webpack loader issues
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        use: ['raw-loader', 'glslify-loader']
      })
    }

    // Production optimizations (only when not in dev)
    if (!dev && !isServer) {
      // Apply production-grade optimizations from research
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: (module) => {
              return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
            },
            name: (module) => {
              const crypto = require('crypto')
              const hash = crypto.createHash('sha1')
              hash.update(module.identifier())
              return hash.digest('hex').slice(0, 8)
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: (module, chunks) => {
              const crypto = require('crypto')
              const hash = crypto.createHash('sha1')
              hash.update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
              return hash.digest('hex')
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          }
        }
      }
    }

    return config
  },

  // Enable experimental features that help with stability
  experimental: {
    // Enable optimizePackageImports for better performance
    optimizePackageImports: [
      '@prisma/client',
      'lucide-react',
      'next-auth'
    ]
  },

  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    unoptimized: false,
    domains: ['localhost']
  },

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },

  // Disable static optimization that can cause issues
  trailingSlash: false,
  generateEtags: true
}

module.exports = nextConfig