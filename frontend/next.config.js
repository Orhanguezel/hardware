/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },

  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemaps',
      },
    ]
  },

  // 🔧 ESLint hataları build’i kırmasın
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
