'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { useEffect } from 'react'

export function DynamicSEO() {
  const { settings } = useSettings()

  useEffect(() => {
    if (settings) {
      // Update document title
      const seoTitle = settings.seo_title?.value || settings.site_name?.value || 'Hardware Review'
      if (seoTitle && typeof seoTitle === 'string') {
        document.title = seoTitle
      }

      // Update meta description
      const seoDescription = settings.seo_description?.value || settings.site_description?.value || 'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.'
      if (seoDescription && typeof seoDescription === 'string') {
        let metaDescription = document.querySelector('meta[name="description"]')
        if (!metaDescription) {
          metaDescription = document.createElement('meta')
          metaDescription.setAttribute('name', 'description')
          document.head.appendChild(metaDescription)
        }
        metaDescription.setAttribute('content', seoDescription)
      }

      // Update meta keywords
      const seoKeywords = settings.seo_keywords?.value || 'donanım, router, modem, wifi, inceleme'
      if (seoKeywords && typeof seoKeywords === 'string') {
        let metaKeywords = document.querySelector('meta[name="keywords"]')
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta')
          metaKeywords.setAttribute('name', 'keywords')
          document.head.appendChild(metaKeywords)
        }
        metaKeywords.setAttribute('content', seoKeywords)
      }

      // Update Open Graph title
      const siteName = settings.site_name?.value || 'Hardware Review'
      if (siteName && typeof siteName === 'string') {
        let ogTitle = document.querySelector('meta[property="og:title"]')
        if (!ogTitle) {
          ogTitle = document.createElement('meta')
          ogTitle.setAttribute('property', 'og:title')
          document.head.appendChild(ogTitle)
        }
        ogTitle.setAttribute('content', seoTitle && typeof seoTitle === 'string' ? seoTitle : siteName)

        // Update Open Graph site name
        let ogSiteName = document.querySelector('meta[property="og:site_name"]')
        if (!ogSiteName) {
          ogSiteName = document.createElement('meta')
          ogSiteName.setAttribute('property', 'og:site_name')
          document.head.appendChild(ogSiteName)
        }
        ogSiteName.setAttribute('content', siteName)
      }

      // Update Open Graph description
      if (seoDescription && typeof seoDescription === 'string') {
        let ogDescription = document.querySelector('meta[property="og:description"]')
        if (!ogDescription) {
          ogDescription = document.createElement('meta')
          ogDescription.setAttribute('property', 'og:description')
          document.head.appendChild(ogDescription)
        }
        ogDescription.setAttribute('content', seoDescription)
      }

      // Update Twitter Card title and description
      if (seoTitle && typeof seoTitle === 'string') {
        let twitterTitle = document.querySelector('meta[name="twitter:title"]')
        if (!twitterTitle) {
          twitterTitle = document.createElement('meta')
          twitterTitle.setAttribute('name', 'twitter:title')
          document.head.appendChild(twitterTitle)
        }
        twitterTitle.setAttribute('content', seoTitle)
      }

      if (seoDescription && typeof seoDescription === 'string') {
        let twitterDescription = document.querySelector('meta[name="twitter:description"]')
        if (!twitterDescription) {
          twitterDescription = document.createElement('meta')
          twitterDescription.setAttribute('name', 'twitter:description')
          document.head.appendChild(twitterDescription)
        }
        twitterDescription.setAttribute('content', seoDescription)
      }
    }
  }, [settings])

  return null // This component doesn't render anything
}
