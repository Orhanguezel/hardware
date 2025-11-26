// src/app/users/[id]/page.tsx

'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  User as UserIcon,
  Mail,
  MessageCircle,
  Heart,
  Star,
  FileText,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  useGetUserProfileQuery,
  useGetUserPublicStatsQuery,
} from '@/integrations/hardware/rtk/endpoints/users.endpoints'
import type {
  UserPublicProfile,
  UserStats,
  UserRecentArticle,
  UserRecentComment,
} from '@/integrations/hardware/rtk/types/user.types'

type ArticleLinkTarget =
  | Pick<UserRecentArticle, 'type' | 'slug'>
  | UserRecentComment['article']

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getArticleUrl(article: ArticleLinkTarget): string {
  const type = (article.type || '').toUpperCase()
  const slug = article.slug

  switch (type) {
    case 'REVIEW':
      return `/reviews/${slug}`
    case 'BEST_LIST':
    case 'BEST':
      return `/best/${slug}`
    case 'COMPARE':
      return `/compare-articles/${slug}`
    case 'GUIDE':
      return `/guides/${slug}`
    case 'NEWS':
      return `/news/${slug}`
    default:
      // Şimdilik review fallback – ileride genel /articles/[slug] route'u açarsan güncelleyebilirsin
      return `/reviews/${slug}`
  }
}

export default function UserProfilePage() {
  const params = useParams<{ id: string }>()

  // URL'deki id string'ini sayıya çeviriyoruz (backend User.id: number)
  const userId = Number(params.id)
  const isUserIdValid = Number.isFinite(userId) && userId > 0

  // Public profil datası
  const {
    data: user,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetUserProfileQuery(userId, {
    skip: !isUserIdValid,
  })

  // Public istatistikler
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useGetUserPublicStatsQuery(userId, {
    skip: !isUserIdValid,
  })

  const isLoading = !isUserIdValid ? false : isProfileLoading || isStatsLoading
  const hasError = !isUserIdValid || isProfileError

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">
            Kullanıcı bilgileri yükleniyor...
          </p>
        </div>
      </div>
    )
  }

  if (hasError || !user) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <UserIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Kullanıcı Bulunamadı</h1>
          <p className="text-muted-foreground mb-4">
            {!isUserIdValid
              ? 'Geçersiz kullanıcı adresi.'
              : 'Aradığınız kullanıcı bulunamadı.'}
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const typedUser: UserPublicProfile = user
  const typedStats: UserStats | undefined = stats

  const profileVisible =
    typedUser.privacy_settings?.profile_visible ?? false
  const emailVisible =
    typedUser.privacy_settings?.email_visible ?? false

  const articlesCount = typedStats?.authoredArticles ?? 0
  const commentsCount = typedStats?.comments_count ?? 0
  const reviewsCount = typedStats?.reviews_count ?? 0
  const favoritesCount = typedStats?.favorites_count ?? 0

  const displayName = typedUser.name || typedUser.username
  const joinedAtLabel = formatDate(typedUser.created_at)

  // 🔥 Artık domain/port hardcode YOK; backend ne veriyorsa onu kullan
  const avatarSrc = typedUser.avatar || null

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {displayName}
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {typedUser.role === 'ADMIN' ||
                      typedUser.role === 'SUPER_ADMIN'
                        ? 'Admin'
                        : typedUser.role === 'EDITOR'
                        ? 'Editör'
                        : 'Kullanıcı'}
                    </Badge>
                    {joinedAtLabel && (
                      <span className="text-sm text-muted-foreground">
                        {joinedAtLabel} tarihinde katıldı
                      </span>
                    )}
                  </div>
                  {typedUser.bio && (
                    <p className="text-muted-foreground mb-4">
                      {typedUser.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{articlesCount}</div>
              <div className="text-sm text-muted-foreground">Makale</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{commentsCount}</div>
              <div className="text-sm text-muted-foreground">Yorum</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{reviewsCount}</div>
              <div className="text-sm text-muted-foreground">İnceleme</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">
                {favoritesCount}
              </div>
              <div className="text-sm text-muted-foreground">Favori</div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info - privacy'ye göre e-posta göster */}
        {emailVisible && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                İletişim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{typedUser.email}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Articles */}
        {typedUser.recent_articles &&
          typedUser.recent_articles.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Son Makaleler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typedUser.recent_articles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">
                            {article.category.name}
                          </Badge>
                          <span>
                            {formatDate(article.published_at)}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={getArticleUrl(article)}>
                          Oku
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Recent Comments */}
        {typedUser.recent_comments &&
          typedUser.recent_comments.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Son Yorumlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typedUser.recent_comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <p className="text-sm mb-2 line-clamp-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{comment.article.title}</span>
                        <span>
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="mt-2"
                      >
                        <Link href={getArticleUrl(comment.article)}>
                          Makaleye Git
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Privacy Notice */}
        {!profileVisible && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <UserIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Bu kullanıcı profilini gizli olarak ayarlamış
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
