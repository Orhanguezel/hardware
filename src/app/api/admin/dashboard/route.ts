import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 }
      )
    }

    const djangoApiUrl = 'http://localhost:8000/api'
    
    // Get dashboard statistics from Django API
    const [
      articlesResponse,
      commentsResponse,
      productsResponse,
      categoriesResponse,
      reviewsResponse,
      usersResponse
    ] = await Promise.all([
      fetch(`${djangoApiUrl}/articles/`, {
        headers: {
          'Authorization': `Token ${(session as any).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/comments/`, {
        headers: {
          'Authorization': `Token ${(session as any).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/products/`, {
        headers: {
          'Authorization': `Token ${(session as any).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/categories/`, {
        headers: {
          'Authorization': `Token ${(session as any).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/reviews/`, {
        headers: {
          'Authorization': `Token ${(session as any).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/users/`, {
        headers: {
          'Authorization': `Token ${(session as any).accessToken}`,
          'Content-Type': 'application/json',
        },
      })
    ])

    // Check if all responses are OK
    if (!articlesResponse.ok || !commentsResponse.ok || !productsResponse.ok || !categoriesResponse.ok || !reviewsResponse.ok || !usersResponse.ok) {
      console.error('API responses not OK:', {
        articles: articlesResponse.status,
        comments: commentsResponse.status,
        products: productsResponse.status,
        categories: categoriesResponse.status,
        reviews: reviewsResponse.status,
        users: usersResponse.status
      })
      throw new Error('One or more API calls failed')
    }

    const [
      articlesData,
      commentsData,
      productsData,
      categoriesData,
      reviewsData,
      usersData
    ] = await Promise.all([
      articlesResponse.json(),
      commentsResponse.json(),
      productsResponse.json(),
      categoriesResponse.json(),
      reviewsResponse.json(),
      usersResponse.json()
    ])

    console.log('Dashboard API Data:', {
      articles: articlesData,
      comments: commentsData,
      products: productsData,
      categories: categoriesData,
      reviews: reviewsData,
      users: usersData
    })

    // Calculate statistics
    const totalArticles = articlesData.count || 0
    const publishedArticles = articlesData.results?.filter((article: any) => article.status === 'PUBLISHED').length || 0
    const draftArticles = articlesData.results?.filter((article: any) => article.status === 'DRAFT').length || 0
    const totalUsers = usersData.count || (Array.isArray(usersData) ? usersData.length : 0)
    const totalComments = commentsData.count || 0
    const pendingComments = commentsData.results?.filter((comment: any) => comment.status === 'PENDING').length || 0
    const totalProducts = productsData.count || 0
    const totalCategories = categoriesData.count || 0
    const totalReviews = reviewsData.count || 0
    const approvedReviews = reviewsData.results?.filter((review: any) => review.status === 'APPROVED').length || 0
    const pendingReviews = reviewsData.results?.filter((review: any) => review.status === 'PENDING').length || 0
    const totalAffiliateLinks = 0 // Placeholder - affiliate-links endpoint not available
    const activeAffiliateLinks = 0 // Placeholder - affiliate-links endpoint not available

    // Get recent articles (first 5) with proper author mapping
    const recentArticles = (articlesData.results?.slice(0, 5) || []).map((article: any) => ({
      id: article.id,
      title: article.title,
      status: article.status,
      author: {
        name: article.author?.first_name && article.author?.last_name 
          ? `${article.author.first_name} ${article.author.last_name}`
          : article.author?.first_name || article.author?.last_name
          ? `${article.author.first_name || ''} ${article.author.last_name || ''}`.trim()
          : article.author?.username || 'Anonim'
      },
      created_at: article.created_at,
      comment_count: article.comment_count || 0
    }))

    // Get recent comments (first 5) with proper author mapping
    const recentComments = (commentsData.results?.slice(0, 5) || []).map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      status: comment.status,
      author: {
        name: comment.author_name || 'Anonim'
      },
      article: {
        title: comment.article_title || comment.article?.title || 'Bilinmeyen Makale'
      },
      created_at: comment.created_at
    }))

    // Get recent users (first 5) - handle both paginated and array responses
    const usersArray = usersData.results || (Array.isArray(usersData) ? usersData : [])
    const recentUsers = usersArray.slice(0, 5).map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      status: user.status,
      email_verified: user.email_verified,
      authored_articles_count: user.authored_articles_count,
      comments_count: user.comments_count,
      created_at: user.created_at,
      updated_at: user.updated_at,
      date_joined: user.date_joined
    }))

    // Calculate monthly analytics
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    // Get monthly views and affiliate clicks from Django API
    const monthlyAnalyticsResponse = await fetch(`${djangoApiUrl}/analytics/monthly/?year=${currentYear}&month=${currentMonth}`, {
      headers: {
        'Authorization': `Token ${(session as any).accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    let monthlyViews = 0
    let monthlyAffiliateClicks = 0

    if (monthlyAnalyticsResponse.ok) {
      const monthlyData = await monthlyAnalyticsResponse.json()
      monthlyViews = monthlyData.total_views || 0
      monthlyAffiliateClicks = monthlyData.total_affiliate_clicks || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalArticles,
          publishedArticles,
          draftArticles,
          totalUsers,
          totalComments,
          pendingComments,
          totalProducts,
          totalCategories,
          totalReviews,
          approvedReviews,
          pendingReviews,
          totalAffiliateLinks,
          activeAffiliateLinks,
          views: monthlyViews,
          affiliateClicks: monthlyAffiliateClicks,
          newUsers: 0, // Placeholder - can be implemented later
          newComments: 0 // Placeholder - can be implemented later
        },
        recentArticles,
        recentComments,
        users: recentUsers
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
