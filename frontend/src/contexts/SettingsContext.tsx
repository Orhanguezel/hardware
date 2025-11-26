'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface SettingValue {
  value: string
  is_file: boolean
}

interface PublicSettings {
  site_name: SettingValue
  site_description: SettingValue
  logo: SettingValue
  favicon: SettingValue
  user_registration: SettingValue
  primary_color: SettingValue
  secondary_color: SettingValue
  seo_title: SettingValue
  seo_description: SettingValue
  seo_keywords: SettingValue
  affiliate_tracking: SettingValue
}

interface SettingsContextType {
  settings: PublicSettings | null
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
  isAffiliateTrackingEnabled: () => boolean
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  error: null,
  refreshSettings: async () => {},
  isAffiliateTrackingEnabled: () => false
})

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/settings/public')
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch settings')
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      
      // Set default values on error
      setSettings({
        site_name: { value: 'Hardware Review', is_file: false },
        site_description: { value: 'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.', is_file: false },
        logo: { value: '', is_file: true },
        favicon: { value: '', is_file: true },
        user_registration: { value: 'true', is_file: false },
        primary_color: { value: '#3b82f6', is_file: false },
        secondary_color: { value: '#64748b', is_file: false },
        seo_title: { value: 'Hardware Review - En İyi Donanım Rehberleri', is_file: false },
        seo_description: { value: 'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.', is_file: false },
        seo_keywords: { value: 'donanım, router, modem, wifi, inceleme', is_file: false },
        affiliate_tracking: { value: 'false', is_file: false }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const refreshSettings = async () => {
    await fetchSettings()
  }

  const isAffiliateTrackingEnabled = () => {
    if (!settings) return false
    return settings.affiliate_tracking?.value === 'true'
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings, isAffiliateTrackingEnabled }}>
      {children}
    </SettingsContext.Provider>
  )
}
