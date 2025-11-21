'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Send, User, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface CommentFormProps {
  articleId: string
  parentId?: string
  replyTo?: string
  onCancelReply?: () => void
}

export function CommentForm({ 
  articleId, 
  parentId, 
  replyTo,
  onCancelReply 
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Yorum yazmanız gerekiyor')
      return
    }

    if (!authorName.trim()) {
      toast.error('İsim girmeniz gerekiyor')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
          parentId: parentId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Yorum eklenirken bir hata oluştu')
      }

      toast.success(data.message || 'Yorumunuz eklendi!')
      
      // Formu temizle
      setContent('')
      setAuthorName('')
      setAuthorEmail('')
      
      // Sayfayı yenile
      window.location.reload()
      
      // Reply iptal et
      if (onCancelReply) {
        onCancelReply()
      }

    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error(error instanceof Error ? error.message : 'Yorum eklenirken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {parentId ? `Yanıtla: ${replyTo}` : 'Yorum Yaz'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="authorName" className="text-sm font-medium flex items-center gap-2">
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
              <label htmlFor="authorEmail" className="text-sm font-medium flex items-center gap-2">
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
                  disabled={isSubmitting}
                >
                  İptal
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim() || !authorName.trim()}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
