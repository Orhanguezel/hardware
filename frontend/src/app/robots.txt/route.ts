// src/app/robots.txt/route.ts

import { NextResponse } from 'next/server'

// Public site URL – mümkünse .env’de bunu tanımla:
// NEXT_PUBLIC_SITE_URL=https://hardware-review.com
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'https://hardware-review.com'

// Basit prod kontrolü (isteğe göre genişletebilirsin)
const isProd = process.env.NODE_ENV === 'production'

export async function GET() {
  // Prod dışı ortamlar (local, staging vs.) için tamamen kapatalım:
  // Böylece test ortamların index’lenmez.
  if (!isProd) {
    const robotsTxt = `User-agent: *
Disallow: /`

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }

  // Production için robots
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /private/

# Allow important pages
Allow: /reviews/
Allow: /best/
Allow: /compare/
Allow: /guides/
Allow: /news/
Allow: /category/
Allow: /products/

# Crawl delay for respectful crawling
Crawl-delay: 1
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
