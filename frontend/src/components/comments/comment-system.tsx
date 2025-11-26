// hardware/src/components/comments/comment-system.tsx

'use client'

import { useState, useEffect, MouseEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  User,
  Calendar,
  Send,
} from 'lucide-react'

import {
  useListCommentsQuery,
  useCreateCommentMutation,
  useMarkCommentHelpfulMutation,
} from '@/integrations/hardware/rtk/endpoints/comments_reviews.endpoints'

import type {
  CommentDto,
  CommentListQueryParams,
  CommentCreatePayload,
} from '@/integrations/hardware/rtk/types/comment_review.types'

// CommentDto üzerine replies ekliyoruz; Omit ile çakışmayı çözüyoruz
type CommentNode = Omit<CommentDto, 'replies'> & {
  replies?: CommentNode[]
}

interface CommentSystemProps {
  articleId: number | string
  articleTitle?: string
  comments?: CommentNode[]
  onCommentSubmit?: (content: string, parentId?: string) => void
  onHelpfulVote?: (commentId: number) => void
}

// Login sonrası localStorage'a yazdığımız user için basit tip
interface AuthUser {
  id?: number | string
  email?: string
  username?: string
  first_name?: string
  last_name?: string
  name?: string
  role?: string
}

// Flat CommentDto[] -> ağaçlı CommentNode[]
function buildCommentTree(items: CommentDto[] | undefined): CommentNode[] {
  if (!items || items.length === 0) return []

  const map = new Map<number, CommentNode>()
  const roots: CommentNode[] = []

  // Önce tüm yorumları map'e koy
  for (const item of items) {
    map.set(item.id, { ...item, replies: [] })
  }

  // Sonra parent ilişkilerine göre dağıt
  for (const node of map.values()) {
    if (node.parent) {
      const parent = map.get(node.parent)
      if (parent) {
        parent.replies!.push(node)
      } else {
        // parent bulunamazsa root'a at (eksik data fallback)
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  return roots
}

export default function CommentSystem({
  articleId,
  articleTitle,
  onHelpfulVote,
}: CommentSystemProps) {
  // 🔹 Yeni auth sistemi: localStorage'dan user okuyoruz
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful'>(
    'newest',
  )

  const isAuthenticated = !!authUser

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const rawUser = window.localStorage.getItem('user')
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as AuthUser
        setAuthUser(parsed)
      } else {
        setAuthUser(null)
      }
    } catch {
      setAuthUser(null)
    } finally {
      setIsAuthReady(true)
    }
  }, [])

  // Kullanıcı adını hesaplayan küçük helper
  const getAuthorDisplayName = () => {
    if (!authUser) return 'Kullanıcı'
    return (
      authUser.name ||
      [authUser.first_name, authUser.last_name].filter(Boolean).join(' ') ||
      authUser.username ||
      authUser.email ||
      'Kullanıcı'
    )
  }

  const listParams = {
    article: Number(articleId),
  } as CommentListQueryParams

  const {
    data: commentsResult,
    isLoading,
    isError,
    refetch,
  } = useListCommentsQuery(listParams)

  const [createComment, { isLoading: isSubmittingComment }] =
    useCreateCommentMutation()
  const [markCommentHelpful, { isLoading: isVotingHelpful }] =
    useMarkCommentHelpfulMutation()

  const flatComments: CommentDto[] = commentsResult?.results ?? []
  const comments: CommentNode[] = buildCommentTree(flatComments)

  // ---- Yardımcılar ----

  const getSortedComments = (items: CommentNode[]) => {
    // Root + APPROVED yorumlar
    const parentComments = items.filter(
      (c) => c.status === 'APPROVED' && !c.parent,
    )

    switch (sortBy) {
      case 'oldest':
        return [...parentComments].sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        )
      case 'helpful':
        return [...parentComments].sort(
          (a, b) => (b.helpful_count ?? 0) - (a.helpful_count ?? 0),
        )
      case 'newest':
      default:
        return [...parentComments].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  // ---- RTK: Faydalı oyu ----

  const handleHelpfulVote = async (commentId: number) => {
    if (!isAuthenticated) {
      alert('Yorum oylamak için giriş yapmalısınız')
      return
    }

    try {
      await markCommentHelpful(commentId).unwrap()
      onHelpfulVote?.(commentId)
      await refetch()
    } catch (error) {
      console.error('Error voting for comment:', error)
      alert('Oylama sırasında bir hata oluştu')
    }
  }

  // ---- RTK: Yorum ekleme ----

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated || isSubmittingComment) return

    try {
      const payload: CommentCreatePayload = {
        article: Number(articleId),
        content: newComment.trim(),
        author_name: getAuthorDisplayName(),
        author_email: authUser?.email,
      }

      await createComment(payload).unwrap()
      setNewComment('')
      await refetch()
      alert(
        'Yorumunuz başarıyla gönderildi ve moderasyon için bekliyor.',
      )
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Yorum gönderilirken bir hata oluştu')
    }
  }

  // ---- RTK: Yanıt ekleme ----

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !replyingTo) return

    if (!isAuthenticated) {
      alert('Yanıt yazmak için giriş yapmalısınız')
      return
    }

    try {
      const payload: CommentCreatePayload = {
        article: Number(articleId),
        content: replyContent.trim(),
        parent: replyingTo,
        author_name: getAuthorDisplayName(),
        author_email: authUser?.email,
      }

      await createComment(payload).unwrap()
      setReplyContent('')
      setReplyingTo(null)
      await refetch()
      alert('Yanıtınız gönderildi ve moderasyon için bekliyor.')
    } catch (error) {
      console.error('Error submitting reply:', error)
      alert('Yanıt gönderilirken bir hata oluştu')
    }
  }

  // ---- Tek bir yorumu render eden alt bileşen ----

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: CommentNode
    isReply?: boolean
  }) => {
    const [showReplies, setShowReplies] = useState(false)

    const handleToggleReplies = (e: MouseEvent) => {
      e.stopPropagation()
      setShowReplies((prev) => !prev)
    }

    // Flat list’te de kullanılabilir ama biz artık tree kullanıyoruz;
    // yine de guard kalsın
    if (comment.parent && !isReply) {
      return null
    }

    return (
      <div
        className={isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}
      >
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {comment.author_name || 'Anonim'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                </div>

                {comment.status === 'PENDING' && (
                  <Badge variant="secondary">Bekliyor</Badge>
                )}
              </div>

              {/* İçerik */}
              <div className="pl-13">
                <p className="text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>

              {/* Aksiyonlar */}
              <div className="flex items-center gap-4 pl-13">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isVotingHelpful) {
                      handleHelpfulVote(comment.id)
                    }
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Faydalı ({comment.helpful_count ?? 0})
                </Button>

                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setReplyingTo(comment.id)
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Yanıtla
                  </Button>
                )}
              </div>

              {/* Yanıt formu */}
              {!isReply && replyingTo === comment.id && (
                <div className="pl-13 pt-4 border-t">
                  <div className="space-y-3">
                    <Textarea
                      placeholder={`${comment.author_name || 'Kullanıcı'} kullanıcısına yanıt verin...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSubmitReply()
                        }}
                        disabled={!replyContent.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Yanıtla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setReplyingTo(null)
                          setReplyContent('')
                        }}
                      >
                        İptal
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Yanıtlar */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-13">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleReplies}
                    className="text-muted-foreground"
                  >
                    {showReplies
                      ? 'Yanıtları Gizle'
                      : `${comment.replies.length} Yanıtı Görüntüle`}
                  </Button>

                  {showReplies && (
                    <div className="mt-4 space-y-4">
                      {comment.replies.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          isReply
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const approvedTopLevelCount = comments.filter(
    (c) => c.status === 'APPROVED' && !c.parent,
  ).length

  // ---- Render ----

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-2">Yorumlar yükleniyor...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Yorumlar yüklenirken bir hata oluştu.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedComments = getSortedComments(comments)

  return (
    <div className="space-y-6">
      {/* Yorum Formu */}
      {!isAuthReady ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Yorum alanı hazırlanıyor...
              </span>
            </div>
          </CardContent>
        </Card>
      ) : isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Yorum Yap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Düşüncelerinizi paylaşın..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Yorumunuz moderasyon için gönderilecektir.
                </p>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmittingComment ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Yorum yapmak için giriş yapın
              </h3>
              <p className="text-muted-foreground mb-4">
                Düşüncelerinizi paylaşmak ve diğer kullanıcılarla
                etkileşim kurmak için hesabınıza giriş yapın.
              </p>
              <Button asChild>
                <a href="/auth/signin">Giriş Yap</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yorum Listesi */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {articleTitle
              ? `${articleTitle} için Yorumlar`
              : 'Yorumlar'}{' '}
            ({approvedTopLevelCount})
          </h3>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'newest' | 'oldest' | 'helpful',
                )
              }
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="helpful">En Faydalı</option>
            </select>
          </div>
        </div>

        {sortedComments.length > 0 ? (
          <div className="space-y-4">
            {sortedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Henüz yorum yok
                </h3>
                <p className="text-muted-foreground">
                  İlk yorumu siz yapın ve tartışmayı başlatın!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
