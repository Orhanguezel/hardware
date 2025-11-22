import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Router, 
  Wifi, 
  Shield, 
  Zap, 
  Settings, 
  Gamepad2, 
  Monitor,
  Cpu,
  HardDrive,
  Headphones,
  Camera,
  Smartphone,
  Laptop,
  Database,
  Globe
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  color?: string | null
  isActive: boolean
  sortOrder: number
  _count: {
    articles: number
    products: number
  }
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'router': Router,
  'modem': Wifi,
  'mesh': Shield,
  'access-point': Zap,
  'network-switch': Settings,
  'gaming': Gamepad2,
  'monitor': Monitor,
  'gpu': Cpu,
  'cpu': Cpu,
  'storage': HardDrive,
  'headphones': Headphones,
  'camera': Camera,
  'smartphone': Smartphone,
  'laptop': Laptop,
  'server': Database,
  'internet': Globe,
  'default': Settings
}

const colorMap: Record<string, string> = {
  'router': 'bg-blue-500',
  'modem': 'bg-green-500',
  'mesh': 'bg-purple-500',
  'access-point': 'bg-orange-500',
  'network-switch': 'bg-red-500',
  'gaming': 'bg-indigo-500',
  'monitor': 'bg-cyan-500',
  'gpu': 'bg-pink-500',
  'cpu': 'bg-yellow-500',
  'storage': 'bg-gray-500',
  'headphones': 'bg-teal-500',
  'camera': 'bg-rose-500',
  'smartphone': 'bg-violet-500',
  'laptop': 'bg-emerald-500',
  'server': 'bg-slate-500',
  'internet': 'bg-sky-500',
  'default': 'bg-gray-500'
}

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const getIcon = (iconName?: string) => {
    if (!iconName) return iconMap.default
    return iconMap[iconName.toLowerCase()] || iconMap.default
  }

  const getColor = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    for (const [key, color] of Object.entries(colorMap)) {
      if (name.includes(key)) return color
    }
    return colorMap.default
  }
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Kategoriler
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Donanım türlerine göre kategorilere ayrılmış incelemeler ve rehberler
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories
            .filter(category => category.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .slice(0, 6)
            .map((category, index) => {
              const Icon = getIcon(category.icon || undefined)
              const color = category.color || getColor(category.name)
              const totalContent = category._count.articles + category._count.products
              
              return (
                <Card 
                  key={category.id} 
                  className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${color} text-white group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {totalContent} içerik
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                      {category.description || `${category.name} kategorisindeki ürünler ve incelemeler`}
                    </p>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors btn-animate"
                    >
                      <Link href={`/category/${category.slug}`}>
                        Kategoriyi İncele
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>
    </section>
  )
}
