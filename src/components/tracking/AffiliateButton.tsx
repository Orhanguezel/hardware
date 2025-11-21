'use client'

import { Button } from '@/components/ui/button'
import { useTracking } from '@/hooks/useTracking'
import { useSettings } from '@/contexts/SettingsContext'
import Link from 'next/link'

interface AffiliateButtonProps {
  productId: number
  merchant: string
  url: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link'
}

export default function AffiliateButton({ 
  productId, 
  merchant, 
  url, 
  children, 
  className,
  size = 'sm',
  variant = 'outline'
}: AffiliateButtonProps) {
  const { trackAffiliateClick } = useTracking()
  const { isAffiliateTrackingEnabled } = useSettings()

  const handleClick = () => {
    // Track the affiliate click
    trackAffiliateClick(productId, merchant)
  }

  // Don't render if affiliate tracking is disabled
  if (!isAffiliateTrackingEnabled()) {
    return null
  }

  return (
    <Button 
      size={size}
      variant={variant}
      className={className}
      asChild
    >
      <Link href={url} target="_blank" onClick={handleClick}>
        {children}
      </Link>
    </Button>
  )
}
