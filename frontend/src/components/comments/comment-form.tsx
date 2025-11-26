// src/components/comments/comment-form.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Send, User, Mail } from 'lucide-react'
import { toast } from 'sonner'

import {
  useSubmitArticleCommentMutation,
} from '@/integrations/hardware/rtk/endpoints/articles.endpoints'

interface CommentFormProps {
  articleId: number | string
  parentId?: number
  replyTo?: string
  onCancelReply?: () => void
}

export function CommentForm({
  articleId,
  parentId,
  replyTo,
  onCancelReply,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')

  const [submitComment, { isLoading }] = useSubmitArticleCommentMutation()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedContent = content.trim()
    const trimmedName = authorName.trim()
    const trimmedEmail = authorEmail.trim()

    if (!trimmedContent) {
      toast.error('Yorum yazmanız gerekiyor')
      return
    }

    if (!trimmedName) {
      toast.error('İsim girmeniz gerekiyor')
      return
    }

    try {
      const res = await submitComment({
        articleId,
        content: trimmedContent,
        author_name: trimmedName,
        author_email: trimmedEmail || undefined,
        parent_id: typeof parentId === 'number' ? parentId : undefined,
      }).unwrap()

      if (!res.success) {
        throw new Error(
          (typeof res.message === 'string' && res.message) ||
            'Yorum eklenirken bir hata oluştu',
        )
      }

      toast.success(
        (typeof res.message === 'string' && res.message) ||
          'Yorumunuz eklendi!',
      )

      // Formu temizle
      setContent('')
      setAuthorName('')
      setAuthorEmail('')

      // Reply iptal et
      if (onCancelReply) {
        onCancelReply()
      }

      // Şimdilik listeyi yenile; ileride RTK cache invalidation + yeniden fetch ile çözeriz
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error submitting comment via RTK:', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Yorum eklenirken bir hata oluştu'
      toast.error(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {parentId ? `Yanıtla: ${replyTo ?? ''}` : 'Yorum Yaz'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="authorName"
                className="text-sm font-medium flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                İsim *
              </label>
              <Input
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="İsminizi girin"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="authorEmail"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email (isteğe bağlı)
              </label>
              <Input
                id="authorEmail"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Yorumunuz *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              rows={4}
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              * Gerekli alanlar. Email adresiniz gizli kalacaktır.
            </p>

            <div className="flex items-center gap-2">
              {onCancelReply && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelReply}
                  disabled={isLoading}
                >
                  İptal
                </Button>
              )}

              <Button
                type="submit"
                disabled={
                  isLoading || !content.trim() || !authorName.trim()
                }
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
