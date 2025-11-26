'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin,
  Mail,
  MessageCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  className?: string
}

export function ShareButton({ url, title, description, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const shareOptions = [
    {
      name: 'Kopyala',
      icon: Copy,
      action: () => copyToClipboard(url)
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => shareToFacebook(url, title)
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => shareToTwitter(url, title)
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => shareToLinkedIn(url, title, description)
    },
    {
      name: 'E-posta',
      icon: Mail,
      action: () => shareToEmail(url, title, description)
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => shareToWhatsApp(url, title)
    }
  ]

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link kopyalandı!')
    } catch (error: unknown) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success(error instanceof Error ? error.message : 'Link kopyalandı!')
    }
  }

  const shareToFacebook = (url: string, title: string) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = (url: string, title: string) => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const shareToLinkedIn = (url: string, title: string, description?: string) => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`
    window.open(linkedinUrl, '_blank', 'width=600,height=400')
  }

  const shareToEmail = (url: string, title: string, description?: string) => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${description || ''}\n\n${url}`)
    const emailUrl = `mailto:?subject=${subject}&body=${body}`
    window.location.href = emailUrl
  }

  const shareToWhatsApp = (url: string, title: string) => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        })
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className={`w-full justify-start ${className}`}
        onClick={handleNativeShare}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Paylaş
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-2 z-50 min-w-[200px]">
          <div className="space-y-1">
            {shareOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <button
                  key={index}
                  onClick={() => {
                    option.action()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <Icon className="w-4 h-4" />
                  {option.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
