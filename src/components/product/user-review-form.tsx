'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Star, Plus, Minus } from 'lucide-react'

interface UserReviewFormProps {
  productId: string
  onReviewSubmitted?: () => void
}

/* ---------- Session tipleri (accessToken + role için genişletme) ---------- */
interface SessionUser {
  id?: string
  role?: string
}

interface SessionWithToken {
  user?: SessionUser
  accessToken?: string
}

/* ---------- Mevcut review listesi için tipler ---------- */
type ReviewStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | string

interface ExistingReviewSummary {
  id: number
  status: ReviewStatus
}

interface ReviewListResponse {
  results?: ExistingReviewSummary[]
}

/* ---------- Tekil review detayı için tipler ---------- */
interface ReviewDetail {
  rating: number
  title?: string | null
  content: string
  pros?: string[] | null
  cons?: string[] | null
}

interface ReviewDetailResponse {
  data: ReviewDetail
}

export function UserReviewForm({ productId, onReviewSubmitted }: UserReviewFormProps) {
  const { data: rawSession } = useSession()
  const session = rawSession as SessionWithToken | null

  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pros, setPros] = useState<string[]>([''])
  const [cons, setCons] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasExistingReview, setHasExistingReview] = useState(false)
  const [existingReviewStatus, setExistingReviewStatus] = useState<ReviewStatus | null>(null)
  const [existingReviewId, setExistingReviewId] = useState<number | null>(null)

  // Kullanıcının bu ürün için zaten yorumu var mı (her statüde)
  const checkExistingReview = async () => {
    if (session?.user?.id) {
      try {
        const productNumericId = Number.parseInt(productId, 10)
        const accessToken = session.accessToken

        const url = `${process.env.NEXT_PUBLIC_API_URL}/reviews/?product=${productNumericId}&user=${session.user.id}`

        const response = await fetch(url, {
          headers: {
            ...(accessToken ? { Authorization: `Token ${accessToken}` } : {}),
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data: ReviewListResponse = await response.json()
          const reviews: ExistingReviewSummary[] = Array.isArray(data.results)
            ? data.results
            : []

          console.log(
            'User reviews for product:',
            productId,
            'User:',
            session.user.id,
            'Reviews:',
            reviews,
          )

          const approvedReview = reviews.find((review) => review.status === 'APPROVED')
          const pendingReview = reviews.find((review) => review.status === 'PENDING')
          const latestReview = reviews.length > 0 ? reviews[0] : undefined

          console.log(
            'Found reviews - Approved:',
            approvedReview,
            'Pending:',
            pendingReview,
            'Latest:',
            latestReview,
          )

          if (approvedReview) {
            setHasExistingReview(true)
            setExistingReviewStatus(approvedReview.status)
            setExistingReviewId(approvedReview.id)
          } else if (pendingReview) {
            setHasExistingReview(true)
            setExistingReviewStatus(pendingReview.status)
            setExistingReviewId(pendingReview.id)
          } else if (latestReview) {
            setHasExistingReview(true)
            setExistingReviewStatus(latestReview.status)
            setExistingReviewId(latestReview.id)
          } else {
            setHasExistingReview(false)
            setExistingReviewStatus(null)
            setExistingReviewId(null)
          }
        }
      } catch (error) {
        console.error('Error checking existing review:', error)
      }
    }
  }

  useEffect(() => {
    checkExistingReview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, productId])

  const loadExistingReviewData = async () => {
    if (existingReviewId) {
      try {
        const response = await fetch(`/api/reviews/${existingReviewId}`)
        if (response.ok) {
          const data: ReviewDetailResponse = await response.json()
          const review = data.data

          setRating(review.rating)
          setTitle(review.title ?? '')
          setContent(review.content)
          setPros(review.pros && review.pros.length > 0 ? review.pros : [''])
          setCons(review.cons && review.cons.length > 0 ? review.cons : [''])
        }
      } catch (error) {
        console.error('Error loading existing review:', error)
      }
    }
  }

  const handleStarClick = (starRating: number) => {
    setRating(starRating)
  }

  const addPro = () => {
    setPros((prev) => [...prev, ''])
  }

  const removePro = (index: number) => {
    setPros((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePro = (index: number, value: string) => {
    setPros((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const addCon = () => {
    setCons((prev) => [...prev, ''])
  }

  const removeCon = (index: number) => {
    setCons((prev) => prev.filter((_, i) => i !== index))
  }

  const updateCon = (index: number, value: string) => {
    setCons((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!session?.user?.id) {
      alert('Yorum yapmak için giriş yapmalısınız')
      return
    }

    if (rating === 0) {
      alert('Lütfen bir puan verin')
      return
    }

    if (!content.trim()) {
      alert('Lütfen yorum içeriğini yazın')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          title: title.trim() || null,
          content: content.trim(),
          pros: pros.map((p) => p.trim()).filter(Boolean),
          cons: cons.map((c) => c.trim()).filter(Boolean),
        }),
      })

      const result: { success: boolean; error?: string } = await response.json()

      if (result.success) {
        setRating(0)
        setTitle('')
        setContent('')
        setPros([''])
        setCons([''])

        await checkExistingReview()

        alert('Yorumunuz başarıyla gönderildi. Onay bekliyor.')
        onReviewSubmitted?.()
      } else {
        alert(result.error || 'Yorum gönderilemedi')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session?.user?.id) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Yorum Yapmak İçin Giriş Yapın</h3>
            <p className="text-muted-foreground mb-4">
              Bu ürün hakkında yorum yapmak için hesabınıza giriş yapmalısınız.
            </p>
            <Button asChild>
              <a href="/auth/signin">Giriş Yap</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasExistingReview && existingReviewStatus === 'APPROVED') {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Zaten Değerlendirme Yaptınız</h3>
            <p className="text-muted-foreground mb-4">
              Bu ürün için onaylanmış bir değerlendirmeniz var. Her ürün için sadece bir kez
              değerlendirme yapabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasExistingReview && existingReviewStatus === 'PENDING') {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Zaten Değerlendirme Yaptınız</h3>
            <p className="text-muted-foreground mb-4">
              Değerlendirmenizin sonucunu bekleyiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasExistingReview && existingReviewStatus === 'REJECTED') {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Değerlendirmeniz Reddedildi</h3>
            <p className="text-muted-foreground mb-4">
              Bu ürün için gönderdiğiniz değerlendirme reddedildi. Yeni bir değerlendirme
              gönderebilirsiniz.
            </p>
            <Button
              onClick={() => {
                setHasExistingReview(false)
                if (existingReviewId) {
                  void loadExistingReviewData()
                }
              }}
            >
              Değerlendirmeyi Düzenle
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReviewId && existingReviewStatus === 'REJECTED'
            ? 'Yeni Değerlendirme Gönder'
            : 'Ürün Değerlendirmesi'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Puanlama */}
          <div>
            <label className="block text-sm font-medium mb-2">Genel Puanınız *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && `${rating} yıldız`}
              </span>
            </div>
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-sm font-medium mb-2">Başlık (Opsiyonel)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yorumunuza bir başlık ekleyin..."
              maxLength={100}
            />
          </div>

          {/* Yorum */}
          <div>
            <label className="block text-sm font-medium mb-2">Yorumunuz *</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ürün hakkındaki deneyimlerinizi paylaşın..."
              rows={4}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/1000 karakter
            </p>
          </div>

          {/* Artıları - Sadece admin için */}
          {session?.user?.role === 'ADMIN' && (
            <div>
              <label className="block text-sm font-medium mb-2">Artıları</label>
              <div className="space-y-2">
                {pros.map((pro, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={pro}
                      onChange={(e) => updatePro(index, e.target.value)}
                      placeholder={`Artı ${index + 1}`}
                      maxLength={100}
                    />
                    {pros.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePro(index)}
                        className="px-3"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPro}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Artı Ekle
                </Button>
              </div>
            </div>
          )}

          {/* Eksileri - Sadece admin için */}
          {session?.user?.role === 'ADMIN' && (
            <div>
              <label className="block text-sm font-medium mb-2">Eksileri</label>
              <div className="space-y-2">
                {cons.map((con, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={con}
                      onChange={(e) => updateCon(index, e.target.value)}
                      placeholder={`Eksi ${index + 1}`}
                      maxLength={100}
                    />
                    {cons.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCon(index)}
                        className="px-3"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCon}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Eksi Ekle
                </Button>
              </div>
            </div>
          )}

          {/* Gönder */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || !content.trim()}
            className="w-full"
          >
            {isSubmitting
              ? 'Gönderiliyor...'
              : existingReviewId && existingReviewStatus === 'REJECTED'
                ? 'Yeni Değerlendirme Gönder'
                : 'Değerlendirmeyi Gönder'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
