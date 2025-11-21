import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get all published articles
    const articles = await db.article.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        slug: true,
        type: true,
        updatedAt: true,
        publishedAt: true
      }
    })

    // Get all categories
    const categories = await db.category.findMany({
      select: {
        slug: true
      }
    })

    // Get all products
    const products = await db.product.findMany({
      select: {
        slug: true
      }
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'https://hardware-review.com'
    const currentDate = new Date().toISOString()

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/reviews</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/best</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/guides</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/news</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Article pages -->
  ${articles.map(article => {
    const lastmod = article.updatedAt || article.publishedAt || currentDate
    const priority = article.type === 'REVIEW' ? '0.9' : '0.8'
    const changefreq = article.type === 'NEWS' ? 'monthly' : 'weekly'
    
    let url = ''
    switch (article.type) {
      case 'REVIEW':
        url = `${baseUrl}/reviews/${article.slug}`
        break
      case 'BEST_LIST':
        url = `${baseUrl}/best/${article.slug}`
        break
      case 'COMPARE':
        url = `${baseUrl}/compare-articles/${article.slug}`
        break
      case 'GUIDE':
        url = `${baseUrl}/guides/${article.slug}`
        break
      case 'NEWS':
        url = `${baseUrl}/news/${article.slug}`
        break
      default:
        url = `${baseUrl}/articles/${article.slug}`
    }

    return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n')}

  <!-- Category pages -->
  ${categories.map(category => `  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}

  <!-- Product pages -->
  ${products.map(product => `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
}
