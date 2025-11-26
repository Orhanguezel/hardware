// src/components/comments/comment-list.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MessageCircle,
  Reply,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { CommentForm } from './comment-form'

import {
  useListArticleCommentsQuery,
  type ArticleCommentDto,
} from '@/integrations/hardware/rtk/endpoints/articles.endpoints'

interface CommentView {
  id: string
  content: string
  authorName: string
  authorEmail?: string
  createdAt: string
  user?: {
    id: string
    name: string
    avatar?: string | null
  }
  replyCount: number
  replies: CommentView[]
}

interface CommentListProps {
  articleId: number | string
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((n) => n)
    .map((n) => n[0]!)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** API comment -> UI comment mapping (recursive) */
function mapComment(api: ArticleCommentDto): CommentView {
  const userName =
    (api.user && typeof api.user.name === 'string' && api.user.name) || ''
  const authorName =
    userName ||
    (typeof api.author_name === 'string' && api.author_name) ||
    'Anonim'

  const replies =
    api.replies && Array.isArray(api.replies)
      ? api.replies.map(mapComment)
      : []

  const replyCountFromCount =
    typeof api._count?.replies === 'number' ? api._count.replies : undefined
  const replyCount = replyCountFromCount ?? replies.length

  return {
    id: String(api.id),
    content: api.content,
    authorName,
    authorEmail:
      typeof api.author_email === 'string' ? api.author_email : undefined,
    createdAt: api.created_at,
    user: api.user
      ? {
          id: String(api.user.id),
          name: authorName,
          avatar:
            typeof api.user.avatar === 'string' || api.user.avatar === null
              ? api.user.avatar
              : undefined,
        }
      : undefined,
    replyCount,
    replies,
  }
}

export function CommentList({ articleId }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    () => new Set(),
  )

  const {
    data: apiComments,
    isLoading,
    isError,
  } = useListArticleCommentsQuery(articleId)

  const comments: CommentView[] =
    apiComments && Array.isArray(apiComments)
      ? apiComments.map(mapComment)
      : []

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  const toggleExpanded = (commentId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-2">Yorumlar yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Yorumlar</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Yorumlar yüklenirken bir hata oluştu.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Yorumlar</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz yorum yapılmamış.</p>
            <p className="text-sm text-muted-foreground mt-1">
              İlk yorumu siz yapın!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderComment = (comment: CommentView, isReply = false) => (
    <div key={comment.id} className={isReply ? 'ml-8 mt-4' : 'mb-6'}>
      <Card className={isReply ? 'border-l-2 border-primary/20' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={comment.user?.avatar ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(comment.user?.name || comment.authorName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">
                  {comment.user?.name || comment.authorName}
                </span>
                {comment.user && (
                  <Badge variant="secondary" className="text-xs">
                    Üye
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>

              {!isReply && (
                <div className="flex items-center gap-4 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    className="text-xs h-8"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Yanıtla
                  </Button>

                  {comment.replyCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(comment.id)}
                      className="text-xs h-8"
                    >
                      {expandedComments.has(comment.id) ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Yanıtları Gizle
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          {comment.replyCount} Yanıt
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yanıtlar */}
      {!isReply &&
        comment.replies.length > 0 &&
        expandedComments.has(comment.id) && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}

      {/* Yanıt formu */}
      {!isReply && replyingTo === comment.id && (
        <div className="mt-4">
          <CommentForm
            articleId={articleId}
            parentId={Number.isFinite(Number(comment.id)) ? Number(comment.id) : undefined}
            onCancelReply={handleCancelReply}
            replyTo={comment.user?.name || comment.authorName}
          />
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">
              Yorumlar ({comments.length})
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {comments.map((comment) => renderComment(comment))}
        </div>
      </CardContent>
    </Card>
  )
}
