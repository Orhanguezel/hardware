'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, CheckCircle, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return
    
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('http://localhost:8000/api/newsletter/subscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'homepage'
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSuccess(true)
        setMessage(data.message)
        setEmail('')
        setTimeout(() => {
          setIsSuccess(false)
          setMessage('')
        }, 5000)
      } else {
        setIsSuccess(false)
        setMessage(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
            <Mail className="w-4 h-4 mr-2" />
            Bülten
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            En Güncel İncelemeleri Kaçırmayın
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Haftalık bültenimize abone olun ve yeni incelemeler, karşılaştırmalar 
            ve özel indirim fırsatlarından ilk siz haberdar olun.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Abone Ol'
                )}
              </Button>
            </div>
          </form>
          
          {message && (
            <div className={`mb-6 flex items-center justify-center gap-2 ${
              isSuccess ? 'text-green-200' : 'text-red-200'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>5,000+ abone</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Haftalık güncellemeler</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>İstediğiniz zaman çıkış</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
