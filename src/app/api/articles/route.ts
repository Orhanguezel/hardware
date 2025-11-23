import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const url = queryString ? `${DJANGO_API_URL}/articles/?${queryString}` : `${DJANGO_API_URL}/articles/`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data.results || data
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin, Super Admin, or Editor access required' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    console.log('API Route - Received FormData:', Object.fromEntries(formData.entries()))

    // Extract data from FormData
    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as string
    const categoryId = formData.get('categoryId') as string
    const status = formData.get('status') as string
    const metaTitle = formData.get('metaTitle') as string
    const metaDescription = formData.get('metaDescription') as string
    const heroImageFile = formData.get('hero_image_file') as File
    const heroImageUrl = formData.get('heroImage') as string

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()

    // Transform frontend data to Django format
    const djangoData: any = {
      title,
      subtitle,
      excerpt,
      content, // Content is now a string (HTML)
      type,
      category_id: categoryId,
      status,
      meta_title: metaTitle,
      meta_description: metaDescription,
      slug,
      view_count: 0,
    }

    // Add hero image file or URL
    if (heroImageFile && heroImageFile.size > 0) {
      djangoData.hero_image_file = heroImageFile
    } else if (heroImageUrl && heroImageUrl.trim() !== '') {
      djangoData.hero_image = heroImageUrl
    }

    // Add review extra data if it's a review article
    if (type === 'REVIEW') {
      const scores = formData.get('scores') as string
      const totalScore = formData.get('totalScore') as string

      if (scores) {
        const scoresData = JSON.parse(scores)
        djangoData.review_extra_data = {
          criteria: scoresData.criteria || '',
          pros: scoresData.pros || '',
          cons: scoresData.cons || '',
          technical_spec: scoresData.technicalSpec || '',
          performance_score: scoresData.performance || 0,
          stability_score: scoresData.stability || 0,
          coverage_score: scoresData.coverage || 0,
          software_score: scoresData.software || 0,
          value_score: scoresData.value || 0,
          total_score: parseFloat(totalScore) || 0,
          score_numeric: parseFloat(totalScore) || 0
        }
      }
    }

    // Add best list extra data if it's a best list article
    if (type === 'BEST_LIST') {
      const bestListItems = formData.get('bestListItems') as string

      if (bestListItems) {
        const itemsData = JSON.parse(bestListItems)

        // Process best list items to handle image files
        const processedItems = itemsData.map((item: any, index: number) => {
          const processedItem = { ...item }

          // Check if there's a corresponding image file
          const imageFile = formData.get(`best_list_item_${index}_image_file`) as File
          if (imageFile && imageFile.size > 0) {
            // Store the file for later processing
            processedItem._imageFile = imageFile
            // Remove the file reference from the item data
            delete processedItem.imageFile
            delete processedItem.imagePreview
          }

          return processedItem
        })

        djangoData.best_list_extra_data = {
          items: processedItems,
          criteria: {},
          methodology: ''
        }
      }
    }

    console.log('Article data being sent to Django:', JSON.stringify(djangoData, null, 2))

    // Create FormData for Django
    const djangoFormData = new FormData()

    // Add all text fields
    Object.keys(djangoData).forEach(key => {
      if (key !== 'hero_image_file' && djangoData[key] !== null && djangoData[key] !== undefined) {
        if (typeof djangoData[key] === 'object') {
          djangoFormData.append(key, JSON.stringify(djangoData[key]))
        } else {
          djangoFormData.append(key, djangoData[key].toString())
        }
      }
    })

    // Add file if exists
    if (djangoData.hero_image_file) {
      djangoFormData.append('hero_image_file', djangoData.hero_image_file)
    }

    // Add best list item image files if they exist
    if (type === 'BEST_LIST' && djangoData.best_list_extra_data?.items) {
      djangoData.best_list_extra_data.items.forEach((item: any, index: number) => {
        if (item._imageFile) {
          djangoFormData.append(`best_list_item_${index}_image_file`, item._imageFile)
          // Remove the file reference from the item data before sending
          delete item._imageFile
        }
      })
    }

    // Add tags
    const tags = formData.getAll('tags')
    console.log('Tags received in API:', tags)
    // Send tags as a JSON string to Django
    if (tags.length > 0) {
      djangoFormData.append('tags', JSON.stringify(tags))
    }

    const response = await fetch(`${DJANGO_API_URL}/articles/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
      },
      body: djangoFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Django API error response:', response.status, errorData)
      return NextResponse.json(
        { success: false, error: errorData.error || errorData.detail || 'Failed to create article' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    )
  }
}
