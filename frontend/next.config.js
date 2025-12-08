/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma gibi native modülleri server tarafında external bırak
  serverExternalPackages: ["@prisma/client"],

  images: {
    // Next 13+ için doğru kullanım: remotePatterns
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemaps",
      },
    ];
  },

  // 🔧 Webpack infra log gürültüsünü azalt
  //   (Sadece `--webpack` ile build/development çalıştırdığında devreye girer)
  webpack: (config) => {
    config.infrastructureLogging = {
      ...(config.infrastructureLogging || {}),
      level: "error", // warning'leri gösterme
    };
    return config;
  },
};

module.exports = nextConfig;
