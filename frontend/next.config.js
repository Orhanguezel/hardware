/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],

  images: {
    // domains yerine remotePatterns kullan
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemaps',
      },
    ];
  },

  // 🔧 ESLint hataları build’i kırmasın
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack infra log gürültüsünü azalt
  webpack: (config) => {
    config.infrastructureLogging = {
      ...(config.infrastructureLogging || {}),
      level: 'error', // warning'leri gösterme
    };
    return config;
  },
};

module.exports = nextConfig;
