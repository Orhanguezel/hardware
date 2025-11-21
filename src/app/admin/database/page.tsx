'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, Table, Eye, Edit, Trash2, Plus, RefreshCw, Users, Package, FolderTree, Star } from 'lucide-react'
import Link from 'next/link'

interface TableInfo {
  name: string
  count: number
  table_name: string
  description?: string
  error?: string
}

interface DatabaseInfo {
  version: string
  size_bytes: number
  size_mb: number
}

export default function DatabasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tables, setTables] = useState<TableInfo[]>([])
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is SUPER_ADMIN
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'SUPER_ADMIN') {
      router.push('/admin')
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

  // Redirect if not SUPER_ADMIN
  if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
          <p className="text-muted-foreground mb-4">
            Bu sayfaya erişim yetkiniz bulunmuyor. Sadece Süper Admin erişebilir.
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchTableInfo()
  }, [])

  const fetchTableInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/database/tables')
      if (!response.ok) {
        throw new Error('Tablo bilgileri alınamadı')
      }
      const data = await response.json()
      setTables(data.tables || [])
      setDatabaseInfo(data.database_info || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const tableDescriptions: Record<string, string> = {
    User: 'Kullanıcılar ve yetkilendirme bilgileri',
    Category: 'Ürün ve makale kategorileri',
    Article: 'Site içeriği ve makaleler',
    Product: 'Ürün bilgileri ve özellikleri',
    ProductSpec: 'Ürün teknik özellikleri',
    PriceHistory: 'Ürün fiyat geçmişi',
    UserReview: 'Kullanıcı yorumları ve puanları',
    Comment: 'Makale yorumları',
    Tag: 'Etiketler ve kategorizasyon',
    ProductTag: 'Ürün-etiket ilişkileri',
    ProductComparison: 'Ürün karşılaştırmaları',
    AffiliateLink: 'Satış ortaklığı bağlantıları',
    OutboundClick: 'Dış bağlantı tıklama istatistikleri'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Veritabanı Yönetimi</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Veritabanı bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veritabanı Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            PostgreSQL veritabanı istatistikleri ve yönetimi
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTableInfo} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button asChild>
            <Link href="/admin/database/studio" target="_blank">
              <Database className="w-4 h-4 mr-2" />
              PostgreSQL'i Aç
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <Database className="w-5 h-5" />
              <span className="font-medium">Hata:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Info */}
      {databaseInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              PostgreSQL Veritabanı Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Sürüm</h4>
                <p className="text-lg font-mono">{databaseInfo.version}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Boyut</h4>
                <p className="text-lg font-mono">{databaseInfo.size_mb} MB</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Toplam Tablo</h4>
                <p className="text-lg font-mono">{tables.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table.name} className={`hover:shadow-md transition-shadow ${table.error ? 'border-red-200 bg-red-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Table className="w-5 h-5" />
                  {table.name}
                </CardTitle>
                <Badge variant={table.error ? "destructive" : "secondary"}>
                  {table.error ? 'Hata' : `${table.count} kayıt`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-2">
                {tableDescriptions[table.name] || 'Veritabanı tablosu'}
              </p>
              {table.table_name && (
                <p className="text-xs text-muted-foreground mb-4 font-mono">
                  Tablo: {table.table_name}
                </p>
              )}
              {table.error && (
                <p className="text-xs text-red-600 mb-4">
                  Hata: {table.error}
                </p>
              )}
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/database/studio?table=${table.name}`} target="_blank">
                    <Eye className="w-4 h-4 mr-1" />
                    Görüntüle
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/database/studio?table=${table.name}&mode=edit`} target="_blank">
                    <Edit className="w-4 h-4 mr-1" />
                    Düzenle
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hızlı Erişim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/admin/database/studio?table=User" target="_blank">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Kullanıcılar</div>
                  <div className="text-sm text-muted-foreground">Yönet</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/admin/database/studio?table=Product" target="_blank">
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Ürünler</div>
                  <div className="text-sm text-muted-foreground">Yönet</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/admin/database/studio?table=Category" target="_blank">
                <div className="text-center">
                  <FolderTree className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Kategoriler</div>
                  <div className="text-sm text-muted-foreground">Yönet</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/admin/database/studio?table=UserReview" target="_blank">
                <div className="text-center">
                  <Star className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Yorumlar</div>
                  <div className="text-sm text-muted-foreground">Yönet</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
