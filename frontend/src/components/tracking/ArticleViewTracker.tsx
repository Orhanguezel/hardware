'use client'

import { useEffect, useRef } from 'react'
import { useTracking } from '@/hooks/useTracking'

interface ArticleViewTrackerProps {
  articleId: number
}

export default function ArticleViewTracker({ articleId }: ArticleViewTrackerProps) {
  const { trackArticleView } = useTracking()
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per component instance
    if (!hasTracked.current) {
      hasTracked.current = true
      
      // Add a small delay to ensure component is fully mounted
      const timeoutId = setTimeout(() => {
        trackArticleView(articleId)
      }, 50)

      return () => clearTimeout(timeoutId)
    }
  }, [articleId, trackArticleView])

  // This component doesn't render anything
  return null
}
