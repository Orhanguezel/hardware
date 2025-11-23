//  hardware/src/components/comments/comment-system.tsx

'use client'

import { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import { useSession } from 'next-auth/react'
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
  Send
} from 'lucide-react'

interface Comment {
  id: number
  content: string
  author_name: string
  author_email: string
  created_at: string
  helpful_count: number
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  parent?: number | null
  replies?: Comment[]
}

interface CommentSystemProps {
  articleId: number | string
  articleTitle?: string
  comments?: Comment[]
  onCommentSubmit?: (content: string, parentId?: string) => void
  onHelpfulVote?: (commentId: number) => void
}

export default function CommentSystem({
  articleId,
  articleTitle,
  comments: initialComments = [],
  // onCommentSubmit, // şu an kullanılmıyor, lint hatasını önlemek için destructure’dan çıkarıldı
  onHelpfulVote
}: CommentSystemProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful'>('newest')

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments()
  }, [articleId])

  // Sort comments based on selected filter
  const getSortedComments = (comments: Comment[]) => {
    // Only show parent comments (not replies)
    const parentComments = comments.filter(c => c.status === 'APPROVED' && !c.parent)

    switch (sortBy) {
      case 'oldest':
        return [...parentComments].sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      case 'helpful':
        return [...parentComments].sort((a, b) => b.helpful_count - a.helpful_count)
      case 'newest':
      default:
        return [...parentComments].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }
  }

  // Handle helpful vote
  const handleHelpfulVote = async (commentId: number) => {
    if (!(session as any)?.accessToken) {
      alert('Yorum oylamak için giriş yapmalısınız')
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        // Update the comment's helpful count
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, helpful_count: data.data.helpful_count }
              : comment
          )
        )
      } else {
        alert('Oylama sırasında bir hata oluştu: ' + data.error)
      }
    } catch (error) {
      console.error('Error voting for comment:', error)
      alert('Oylama sırasında bir hata oluştu')
    }
  }

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?article=${articleId}`)
      const data = await response.json()

      if (data.success) {
        setComments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !session) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          articleId,
          authorId: (session.user as any)?.id,
          authorName: session.user?.name,
          authorEmail: session.user?.email,
          ipAddress: '127.0.0.1' // In production, get real IP
        }),
      })

      const result = await response.json()

      if (result.success) {
        setNewComment('')
        // Refresh comments
        fetchComments()
        alert('Yorumunuz başarıyla gönderildi ve moderasyon için bekliyor.')
      } else {
        alert(result.error || 'Yorum gönderilirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !replyingTo) return

    // If not logged in, ask for name and email
    if (!session) {
      const name = prompt('Adınızı girin:')
      const email = prompt('E-posta adresinizi girin:')

      if (!name || !email) {
        alert('Ad ve e-posta bilgileri gereklidir')
        return
      }

      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: replyContent.trim(),
            articleId,
            parent: replyingTo,
            authorName: name,
            authorEmail: email,
            ipAddress: '127.0.0.1'
          })
        })

        const data = await response.json()

        if (data.success) {
          setReplyContent('')
          setReplyingTo(null)
          fetchComments()
          alert('Yanıtınız gönderildi ve moderasyon için bekliyor.')
        } else {
          alert('Yanıt gönderilemedi: ' + data.error)
        }
      } catch (error) {
        console.error('Error submitting reply:', error)
        alert('Yanıt gönderilirken bir hata oluştu')
      }
    } else {
      // Logged in user
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: replyContent.trim(),
            articleId,
            parent: replyingTo,
            authorId: (session.user as any)?.id,
            authorName: session.user?.name,
            authorEmail: session.user?.email,
            ipAddress: '127.0.0.1'
          })
        })

        const data = await response.json()

        if (data.success) {
          setReplyContent('')
          setReplyingTo(null)
          fetchComments()
          alert('Yanıtınız gönderildi ve moderasyon için bekliyor.')
        } else {
          alert('Yanıt gönderilemedi: ' + data.error)
        }
      } catch (error) {
        console.error('Error submitting reply:', error)
        alert('Yanıt gönderilirken bir hata oluştu')
      }
    }
  }

  const CommentItem = ({
    comment,
    isReply = false,
    onHelpfulVote,
  }: {
    comment: Comment
    isReply?: boolean
    onHelpfulVote?: (commentId: number) => void
  }) => {
    const [showReplies, setShowReplies] = useState(false)

    // Handle replies toggle with proper event handling
    const handleToggleReplies = (e: MouseEvent) => {
      e.stopPropagation()
      setShowReplies(!showReplies)
    }

    // Don't render if this is a reply and we're not in reply mode
    if (comment.parent && !isReply) {
      return null
    }

    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Comment Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{comment.author_name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                {comment.status === 'PENDING' && (
                  <Badge variant="secondary">Bekliyor</Badge>
                )}
              </div>

              {/* Comment Content */}
              <div className="pl-13">
                <p className="text-sm leading-relaxed">{comment.content}</p>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 pl-13">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onHelpfulVote?.(comment.id)
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Faydalı ({comment.helpful_count})
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

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="pl-13 pt-4 border-t">
                  <div className="space-y-3">
                    <Textarea
                      placeholder={`${comment.author_name} kullanıcısına yanıt verin...`}
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

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-13">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleReplies}
                    className="text-muted-foreground"
                  >
                    {showReplies ? 'Yanıtları Gizle' : `${comment.replies.length} Yanıtı Görüntüle`}
                  </Button>

                  {showReplies && (
                    <div className="mt-4 space-y-4">
                      {comment.replies.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          isReply
                          onHelpfulVote={onHelpfulVote}
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
    (c) => c.status === 'APPROVED' && !c.parent
  ).length

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {session ? (
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
                <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Gönder
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
              <h3 className="text-lg font-semibold mb-2">Yorum yapmak için giriş yapın</h3>
              <p className="text-muted-foreground mb-4">
                Düşüncelerinizi paylaşmak ve diğer kullanıcılarla etkileşim kurmak için hesabınıza giriş yapın.
              </p>
              <Button asChild>
                <a href="/auth/signin">Giriş Yap</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {articleTitle ? `${articleTitle} için Yorumlar` : 'Yorumlar'} ({approvedTopLevelCount})
          </h3>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'helpful')}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="helpful">En Faydalı</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {getSortedComments(comments).map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onHelpfulVote={handleHelpfulVote}
            />
          ))}
        </div>

        {getSortedComments(comments).length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Henüz yorum yok</h3>
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
