'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Users,
  LogOut,
  Home,
  FolderTree,
  Tag,
  Star,
  Database
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'İçerikler', href: '/admin/articles', icon: FileText, roles: ['ADMIN', 'SUPER_ADMIN', 'EDITOR'] },
  { name: 'Ürünler', href: '/admin/products', icon: Package, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Kategoriler', href: '/admin/categories', icon: FolderTree, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Etiketler', href: '/admin/tags', icon: Tag, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Kullanıcı Yorumları', href: '/admin/reviews', icon: Star, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Yorumlar', href: '/admin/comments', icon: MessageSquare, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Veritabanı', href: '/admin/database', icon: Database, roles: ['SUPER_ADMIN'] },
  { name: 'Analitikler', href: '/admin/analytics', icon: BarChart3, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Kullanıcılar', href: '/admin/users', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Ayarlar', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user has admin, super admin, or editor role
    const userRole = (session.user as any)?.role
    if (!userRole || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(userRole)) {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!session) {
    return null
  }

  // Check role again before rendering
  const userRole = (session.user as any)?.role
  if (!userRole || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
          <p className="text-muted-foreground mb-4">
            Bu sayfaya erişim yetkiniz bulunmuyor.
          </p>
          <Button asChild>
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-background border-r min-h-screen p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {session.user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="font-medium">{session.user?.name}</p>
                <Badge variant="outline" className="text-xs">
                  {(session.user as any)?.role || 'USER'}
                </Badge>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation
              .filter(item => !session?.user?.role || item.roles.includes(session.user.role))
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
          </nav>

          <div className="mt-8 pt-8 border-t">
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                <Home className="w-5 h-5" />
                Siteye Dön
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
