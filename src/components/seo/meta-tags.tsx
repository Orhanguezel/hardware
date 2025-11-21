import Head from 'next/head'

interface MetaTagsProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  price?: number
  currency?: string
  brand?: string
  model?: string
  rating?: number
  reviewCount?: number
}

export default function MetaTags({
  title = 'Hardware Review - Donanım İnceleme ve Karşılaştırma Sitesi',
  description = 'En güncel donanım incelemeleri, ürün karşılaştırmaları ve rehberler. Router, modem, mesh sistemler hakkında detaylı analizler.',
  keywords = 'donanım, inceleme, router, modem, wifi, mesh, karşılaştırma, teknoloji',
  image = '/images/og-default.jpg',
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  price,
  currency = 'TRY',
  brand,
  model,
  rating,
  reviewCount
}: MetaTagsProps) {
  const fullTitle = title.includes('Hardware Review') ? title : `${title} - Hardware Review`
  const fullUrl = url ? `https://hardware-review.com${url}` : 'https://hardware-review.com'
  const fullImage = image.startsWith('http') ? image : `https://hardware-review.com${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author || 'Hardware Review'} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Turkish" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Hardware Review" />
      <meta property="og:locale" content="tr_TR" />

      {/* Article specific OG tags */}
      {type === 'article' && author && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@hardware_review" />
      <meta name="twitter:creator" content="@hardware_review" />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="msapplication-TileColor" content="#1a1a1a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Hardware Review" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data */}
      {type === 'product' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": `${brand} ${model}`,
              "description": description,
              "image": fullImage,
              "brand": {
                "@type": "Brand",
                "name": brand
              },
              "model": model,
              "offers": price ? {
                "@type": "Offer",
                "price": price,
                "priceCurrency": currency,
                "availability": "https://schema.org/InStock"
              } : undefined,
              "aggregateRating": rating && reviewCount ? {
                "@type": "AggregateRating",
                "ratingValue": rating,
                "reviewCount": reviewCount,
                "bestRating": 10,
                "worstRating": 1
              } : undefined
            })
          }}
        />
      )}

      {type === 'article' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": title,
              "description": description,
              "image": fullImage,
              "author": {
                "@type": "Person",
                "name": author
              },
              "publisher": {
                "@type": "Organization",
                "name": "Hardware Review",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://hardware-review.com/logo.png"
                }
              },
              "datePublished": publishedTime,
              "dateModified": modifiedTime,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": fullUrl
              }
            })
          }}
        />
      )}

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Hardware Review",
            "url": "https://hardware-review.com",
            "logo": "https://hardware-review.com/logo.png",
            "description": "Donanım incelemeleri, ürün karşılaştırmaları ve teknoloji rehberleri",
            "sameAs": [
              "https://twitter.com/hardware_review",
              "https://facebook.com/hardware.review",
              "https://instagram.com/hardware.review"
            ]
          })
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Sayfa",
                "item": "https://hardware-review.com"
              },
              ...(section ? [{
                "@type": "ListItem",
                "position": 2,
                "name": section,
                "item": `https://hardware-review.com/${section.toLowerCase()}`
              }] : []),
              {
                "@type": "ListItem",
                "position": section ? 3 : 2,
                "name": title,
                "item": fullUrl
              }
            ]
          })
        }}
      />
    </Head>
  )
}
