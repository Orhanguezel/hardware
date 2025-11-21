'use client'

import { useState, useEffect } from 'react'
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

export function UserReviewForm({ productId, onReviewSubmitted }: UserReviewFormProps) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pros, setPros] = useState<string[]>([''])
  const [cons, setCons] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasExistingReview, setHasExistingReview] = useState(false)
  const [existingReviewStatus, setExistingReviewStatus] = useState<string | null>(null)
  const [existingReviewId, setExistingReviewId] = useState<number | null>(null)

  // Check if user already has a review for this product
  const checkExistingReview = async () => {
    if (session?.user) {
      try {
        // Get all reviews for this product by this user (all statuses)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/?product=${parseInt(productId)}&user=${session.user.id}`, {
          headers: {
            'Authorization': `Token ${(session as any).accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const data = await response.json()
          const reviews = data.results || []
          
          console.log('User reviews for product:', productId, 'User:', session.user.id, 'Reviews:', reviews)
          
          // Find APPROVED review first, then PENDING review, then most recent review
          const approvedReview = reviews.find((review: any) => review.status === 'APPROVED')
          const pendingReview = reviews.find((review: any) => review.status === 'PENDING')
          const latestReview = reviews.length > 0 ? reviews[0] : null
          
          console.log('Found reviews - Approved:', approvedReview, 'Pending:', pendingReview, 'Latest:', latestReview)
          
          if (approvedReview) {
            // If there's an APPROVED review, show that
            setHasExistingReview(true)
            setExistingReviewStatus(approvedReview.status)
            setExistingReviewId(approvedReview.id)
          } else if (pendingReview) {
            // If there's a PENDING review, show that
            setHasExistingReview(true)
            setExistingReviewStatus(pendingReview.status)
            setExistingReviewId(pendingReview.id)
          } else if (latestReview) {
            // If no APPROVED or PENDING review, show the most recent one
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
  }, [session?.user, productId])

  const loadExistingReviewData = async () => {
    if (existingReviewId) {
      try {
        const response = await fetch(`/api/reviews/${existingReviewId}`)
        if (response.ok) {
          const data = await response.json()
          const review = data.data
          setRating(review.rating)
          setTitle(review.title || '')
          setContent(review.content)
          setPros(review.pros || [''])
          setCons(review.cons || [''])
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
    setPros([...pros, ''])
  }

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index))
  }

  const updatePro = (index: number, value: string) => {
    const newPros = [...pros]
    newPros[index] = value
    setPros(newPros)
  }

  const addCon = () => {
    setCons([...cons, ''])
  }

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index))
  }

  const updateCon = (index: number, value: string) => {
    const newCons = [...cons]
    newCons[index] = value
    setCons(newCons)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
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
      // Always create a new review, even for REJECTED ones
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          title: title.trim() || null,
          content: content.trim(),
          pros: pros.filter(p => p.trim()),
          cons: cons.filter(c => c.trim())
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRating(0)
        setTitle('')
        setContent('')
        setPros([''])
        setCons([''])
        
        // Refresh review status after submission
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

  if (!session?.user) {
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
              Bu ürün için onaylanmış bir değerlendirmeniz var. Her ürün için sadece bir kez değerlendirme yapabilirsiniz.
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
              Bu ürün için gönderdiğiniz değerlendirme reddedildi. Yeni bir değerlendirme gönderebilirsiniz.
            </p>
            <Button onClick={() => {
              setHasExistingReview(false)
              // Load existing review data
              if (existingReviewId) {
                loadExistingReviewData()
              }
            }}>
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
          {existingReviewId && existingReviewStatus === 'REJECTED' ? 'Yeni Değerlendirme Gönder' : 'Ürün Değerlendirmesi'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Puanlama */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Genel Puanınız *
            </label>
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
            <label className="block text-sm font-medium mb-2">
              Başlık (Opsiyonel)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yorumunuza bir başlık ekleyin..."
              maxLength={100}
            />
          </div>

          {/* Yorum */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Yorumunuz *
            </label>
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
              <label className="block text-sm font-medium mb-2">
                Artıları
              </label>
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
              <label className="block text-sm font-medium mb-2">
                Eksileri
              </label>
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
              : (existingReviewId && existingReviewStatus === 'REJECTED' ? 'Yeni Değerlendirme Gönder' : 'Değerlendirmeyi Gönder')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
