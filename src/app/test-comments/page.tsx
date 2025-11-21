'use client'

import { useState, useEffect } from 'react'
import { CommentForm } from '@/components/comments/comment-form'
import { CommentList } from '@/components/comments/comment-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestCommentsPage() {
  const [articleId, setArticleId] = useState('cmfvs31g40001ikz132vps9uc') // test haber ID'si

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Yorum Sistemi Test Sayfası</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bu sayfa yorum sistemini test etmek için oluşturulmuştur.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Article ID: {articleId}
            </p>
          </CardContent>
        </Card>

        <CommentForm 
          articleId={articleId}
        />

        <CommentList articleId={articleId} />
      </div>
    </div>
  )
}
