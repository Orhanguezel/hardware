import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Star, TrendingUp } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 py-20">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            En Güncel İncelemeler
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">Donanım İncelemeleri ve</span>{' '}
            <span className="text-primary">Karşılaştırmaları</span>
          </h1>
          
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Router, modem ve ağ ekipmanları hakkında detaylı incelemeler, 
            objektif karşılaştırmalar ve uzman rehberleri ile en doğru seçimi yapın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/reviews">
                İncelemeleri Keşfet
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/best">
                En İyi Ürünler
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-white">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>100+ İnceleme</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Günlük Güncellemeler</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Güvenilir Kaynak
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
