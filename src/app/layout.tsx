// hardware/src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { DynamicFavicon } from '@/components/DynamicFavicon'
import { DynamicSEO } from '@/components/DynamicSEO'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Donanım Puanı - Donanım İnceleme ve Karşılaştırma Sitesi',
  description: 'En güncel donanım incelemeleri, karşılaştırmaları ve rehberleri. Router, modem, ağ ekipmanları hakkında detaylı analizler.',
  keywords: 'donanım inceleme, router, modem, wifi, ağ ekipmanları, karşılaştırma',
  authors: [{ name: 'Hardware Review Team' }],
  creator: 'Hardware Review',
  publisher: 'Hardware Review',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://hardware-review.com',
    siteName: 'Hardware Review',
    title: 'Hardware Review - Donanım İnceleme ve Karşılaştırma Sitesi',
    description: 'En güncel donanım incelemeleri, karşılaştırmaları ve rehberleri.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hardware Review',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hardware Review - Donanım İnceleme ve Karşılaştırma Sitesi',
    description: 'En güncel donanım incelemeleri, karşılaştırmaları ve rehberleri.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <DynamicFavicon />
          <DynamicSEO />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
        {/* made by byiyuel */}
      </body>
    </html>
  )
}
