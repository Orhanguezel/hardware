'use client'

import { useEffect, useRef} from 'react'
import { useTracking } from '@/hooks/useTracking'

interface ArticleViewTrackerWrapperProps {
  articleId: number
}

export default function ArticleViewTrackerWrapper({ articleId }: ArticleViewTrackerWrapperProps) {
  const { trackArticleView } = useTracking()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Track view on every component mount/page load
    timeoutRef.current = setTimeout(() => {
      trackArticleView(articleId)
    }, 100)

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [articleId, trackArticleView])

  // This component doesn't render anything
  return null
}
