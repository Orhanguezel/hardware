import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from "@/lib/api";


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 }
      )
    }

    

    // Env’den gelen base URL (sonundaki / işaretlerini temizleyelim)
    const djangoApiUrl = DJANGO_API_URL.replace(/\/+$/, "");

    // Get analytics data from Django API
    const [
      articlesResponse,
      productsResponse,
      usersResponse,
      reviewsResponse,
      commentsResponse,
      categoriesResponse,
      affiliateLinksResponse
    ] = await Promise.all([
      fetch(`${djangoApiUrl}/articles/?status=PUBLISHED`, {
        headers: {
          'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/products/`, {
        headers: {
          'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/users/`, {
        headers: {
          'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/reviews/?status=APPROVED`, {
        headers: {
          'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/comments/?status=APPROVED`, {
        headers: {
          'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/categories/`, {
        headers: {
          'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${djangoApiUrl}/affiliate-links/?active=true`, {
        headers: {
          'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
          'Content-Type': 'application/json',
        },
      })
    ])

    // Check if all responses are OK
    if (!articlesResponse.ok || !productsResponse.ok || !usersResponse.ok ||
      !reviewsResponse.ok || !commentsResponse.ok || !categoriesResponse.ok || !affiliateLinksResponse.ok) {
      console.error('Analytics API responses not OK:', {
        articles: articlesResponse.status,
        products: productsResponse.status,
        users: usersResponse.status,
        reviews: reviewsResponse.status,
        comments: commentsResponse.status,
        categories: categoriesResponse.status,
        affiliateLinks: affiliateLinksResponse.status
      })
      throw new Error('One or more analytics API calls failed')
    }

    const [
      articlesData,
      productsData,
      usersData,
      reviewsData,
      commentsData,
      categoriesData,
      affiliateLinksData
    ] = await Promise.all([
      articlesResponse.json(),
      productsResponse.json(),
      usersResponse.json(),
      reviewsResponse.json(),
      commentsResponse.json(),
      categoriesResponse.json(),
      affiliateLinksResponse.json()
    ])

    // Extract counts
    const totalArticles = articlesData.count || 0
    const totalProducts = productsData.count || 0
    const totalUsers = usersData.count || (Array.isArray(usersData) ? usersData.length : 0)
    const totalReviews = reviewsData.count || 0
    const totalComments = commentsData.count || 0
    const totalCategories = categoriesData.count || 0
    const totalAffiliateLinks = affiliateLinksData.count || 0

    // Process affiliate merchants data
    const affiliateMerchants = (affiliateLinksData.results || []).reduce((acc: any[], link: any) => {
      const merchant = link.merchant
      if (merchant && merchant.trim()) {
        const existingMerchant = acc.find(m => m.name === merchant)
        if (existingMerchant) {
          existingMerchant.linksCount++
        } else {
          acc.push({
            name: merchant,
            linksCount: 1
          })
        }
      }
      return acc
    }, []).sort((a: any, b: any) => b.linksCount - a.linksCount)

    // Get recent articles (first 5)
    const recentArticles = (articlesData.results?.slice(0, 5) || []).map((article: any) => ({
      id: article.id,
      title: article.title,
      author: article.author?.name || article.author?.username || 'Anonim',
      createdAt: article.created_at,
      commentsCount: article.comment_count || 0
    }))

    // Get recent products (first 5)
    const recentProducts = (productsData.results?.slice(0, 5) || []).map((product: any) => ({
      id: product.id,
      brand: product.brand,
      model: product.model,
      category: product.category?.name || 'Genel',
      createdAt: product.created_at,
      reviewsCount: product.review_count || 0,
      affiliateLinksCount: product.affiliate_links?.length || 0
    }))

    // Get top categories
    const topCategories = (categoriesData.results || []).map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      articlesCount: category.article_count || 0,
      productsCount: category.product_count || 0,
      totalContent: (category.article_count || 0) + (category.product_count || 0)
    })).sort((a: any, b: any) => b.totalContent - a.totalContent).slice(0, 10)

    // Calculate analytics
    const analyticsData = {
      overview: {
        totalArticles,
        totalProducts,
        totalUsers,
        totalReviews,
        totalComments,
        totalCategories,
        totalAffiliateLinks,
        avgReviewsPerProduct: totalProducts > 0 ? Math.round(totalReviews / totalProducts * 10) / 10 : 0,
        avgCommentsPerArticle: totalArticles > 0 ? Math.round(totalComments / totalArticles * 10) / 10 : 0
      },
      recentContent: {
        articles: recentArticles,
        products: recentProducts
      },
      topCategories: topCategories,
      affiliateMerchants: affiliateMerchants
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
