/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
  // Add your domain to the allowed list
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' ws://localhost:4001 wss://localhost:4001; img-src 'self' https://images.unsplash.com data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  },
  // Server configuration for Railway
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

module.exports = nextConfig
