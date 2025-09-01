/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable webpack optimizations in development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable ALL webpack optimizations that cause corruption
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        runtimeChunk: false,
        minimize: false,
        concatenateModules: false,
        moduleIds: 'named',
        chunkIds: 'named'
      }
      
      // Disable problematic plugins
      config.plugins = config.plugins.filter(plugin => {
        const pluginName = plugin.constructor.name
        return ![
          'SplitChunksPlugin',
          'RuntimeChunkPlugin',
          'ModuleConcatenationPlugin'
        ].includes(pluginName)
      })
      
      // Force simple module resolution
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
    }
    
    return config
  },
  
  // Disable all experimental features
  experimental: {
    turbo: false,
    esmExternals: false,
    serverMinification: false,
    serverMinification: false
  },
  
  // Disable all optimizations
  swcMinify: false,
  compress: false,
  poweredByHeader: false,
  
  // Force simple mode
  reactStrictMode: false,
  
  // Disable source maps
  productionBrowserSourceMaps: false,
  
  // Disable image optimization
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
