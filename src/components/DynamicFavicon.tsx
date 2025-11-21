'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { useEffect } from 'react'

export function DynamicFavicon() {
  const { settings } = useSettings()

  useEffect(() => {
    if (settings?.favicon?.value && typeof settings.favicon.value === 'string') {
      // Update favicon
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      
      const faviconUrl = settings.favicon.value.startsWith('/media/') 
        ? `http://localhost:8000${settings.favicon.value}` 
        : settings.favicon.value
      
      link.href = faviconUrl
    }
  }, [settings?.favicon?.value])

  return null // This component doesn't render anything
}
