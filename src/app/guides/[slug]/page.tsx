import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CommentSystem from '@/components/comments/comment-system'
import ArticleViewTrackerWrapper from '@/components/tracking/ArticleViewTrackerWrapper'

interface GuidePageProps {
  params: Promise<{ slug: string }>
}

interface Guide {
  id: number
  title: string
  subtitle?: string
  excerpt: string
  content: string | {
    html: string
  }
  slug: string
  type: string
  status: string
  published_at: string
  author: {
    first_name: string
    last_name: string
  }
  category: {
    name: string
  }
  article_tags?: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  hero_image?: string
  comment_count?: number
}

async function getGuide(slug: string): Promise<Guide | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}/`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch guide: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    console.log('Guide data:', data)
    console.log('Content:', data.content)
    return data
  } catch (error) {
    console.error('Error fetching guide:', error)
    return null
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?type=GUIDE&status=PUBLISHED`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    const guides = data.results || []
    
    return guides.map((guide: Guide) => ({
      slug: guide.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = await getGuide(slug)

  if (!guide || guide.type !== 'GUIDE') {
    notFound()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay':
        return 'bg-green-500'
      case 'Orta':
        return 'bg-yellow-500'
      case 'İleri':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={guide.id} />
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/guides" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Tüm Rehberler
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-green-500" />
          <Badge variant="secondary">
            {guide.category.name}
          </Badge>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
        
        {guide.subtitle && (
          <p className="text-xl text-muted-foreground mb-4">
            {guide.subtitle}
          </p>
        )}

        {/* Tags */}
        {guide.article_tags && guide.article_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {guide.article_tags.map((tag: any) => (
              <Badge key={tag.id} variant="outline" className="text-sm">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{guide.author.first_name} {guide.author.last_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(guide.published_at).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-8">
              {guide.hero_image && (
                <div className="mb-8">
                  <img 
                    src={guide.hero_image} 
                    alt={guide.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: typeof guide.content === 'string' 
                    ? guide.content 
                    : guide.content?.html || '' 
                }}
              />
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="mt-8">
            <CommentSystem 
              articleId={guide.id}
              comments={[]}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">Rehber Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Kategori</h4>
                <Badge variant="outline">
                  {guide.category.name}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Yazar</h4>
                <p className="text-sm text-muted-foreground">
                  {guide.author.first_name} {guide.author.last_name}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Yayın Tarihi</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(guide.published_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}