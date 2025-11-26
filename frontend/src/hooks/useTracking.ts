import { useCallback, useRef } from 'react'

// Global tracking state to prevent duplicates across components
const trackingState = new Map<number, boolean>()

export const useTracking = () => {
  const trackArticleView = useCallback(async (articleId: number) => {
    try {
      // Always track every view - no session restrictions
      await fetch('/api/track/article-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article_id: articleId })
      })
    } catch (error) {
      console.error('Failed to track article view:', error)
    }
  }, [])

  const trackAffiliateClick = useCallback(async (productId: number, merchant: string) => {
    try {
      await fetch('/api/track/affiliate-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          product_id: productId, 
          merchant: merchant 
        })
      })
    } catch (error) {
      console.error('Failed to track affiliate click:', error)
    }
  }, [])

  return {
    trackArticleView,
    trackAffiliateClick
  }
}
