'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  User, 
  Mail, 
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'MEMBER' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  createdAt: string
  emailVerified?: boolean
  _count: {
    authoredArticles: number
    comments: number
  }
}

interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'MEMBER' | 'EDITOR' | 'ADMIN'
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER'
  })

  useEffect(() => {
    fetchUsers(1)
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1)
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    fetchUsers(1)
  }, [roleFilter, statusFilter])

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const result = await response.json()
      if (result.success) {
        setUsers(result.data)
        setPagination(prev => ({
          ...prev,
          page: result.meta.page,
          total: result.meta.total,
          totalPages: result.meta.totalPages
        }))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createUserData),
      })

      const result = await response.json()

      if (result.success) {
        await fetchUsers()
        setIsCreateDialogOpen(false)
        setCreateUserData({ name: '', email: '', password: '', role: 'MEMBER' })
        alert('Kullanıcı başarıyla oluşturuldu')
      } else {
        alert(result.error || 'Kullanıcı oluşturulamadı')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchUsers()
      } else {
        alert(result.error || 'Kullanıcı durumu güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchUsers()
      } else {
        alert(result.error || 'Kullanıcı rolü güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleEmailVerification = async (userId: string, verified: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailVerified: verified }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchUsers()
      } else {
        alert(result.error || 'Email doğrulama durumu güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating email verification:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        await fetchUsers()
      } else {
        alert(result.error || 'Kullanıcı silinemedi')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Bir hata oluştu')
    }
  }

  // Server-side filtering, so we use users directly
  const filteredUsers = users

  const roleColors = {
    'SUPER_ADMIN': 'destructive',
    'ADMIN': 'destructive',
    'EDITOR': 'default',
    'MEMBER': 'secondary'
  } as const

  const roleLabels = {
    'SUPER_ADMIN': 'Süper Yönetici',
    'ADMIN': 'Yönetici',
    'EDITOR': 'Editör',
    'MEMBER': 'Üye'
  }

  const statusColors = {
    'ACTIVE': 'default',
    'INACTIVE': 'secondary',
    'BANNED': 'destructive'
  } as const

  const statusLabels = {
    'ACTIVE': 'Aktif',
    'INACTIVE': 'Pasif',
    'BANNED': 'Yasaklı'
  }

  const stats = {
    total: pagination.total,
    active: users.filter(u => u.status === 'ACTIVE').length,
    admins: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    editors: users.filter(u => u.role === 'EDITOR').length,
    verified: users.filter(u => u.emailVerified).length
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Kullanıcılar yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-muted-foreground">
          Tüm kullanıcıları yönetin ve rollerini düzenleyin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doğrulanmış</p>
                <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yönetici</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Editör</p>
                <p className="text-2xl font-bold text-purple-600">{stats.editors}</p>
              </div>
              <Edit className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="İsim veya email ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tüm Roller</option>
                <option value="SUPER_ADMIN">Süper Yönetici</option>
                <option value="ADMIN">Yönetici</option>
                <option value="EDITOR">Editör</option>
                <option value="AUTHOR">Yazar</option>
                <option value="MEMBER">Üye</option>
                <option value="VISITOR">Ziyaretçi</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
                <option value="BANNED">Yasaklı</option>
              </select>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Kullanıcı Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">İsim</Label>
                      <Input
                        id="name"
                        value={createUserData.name}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Kullanıcı adı"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createUserData.email}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createUserData.password}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Şifre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Rol</Label>
                      <select
                        id="role"
                        value={createUserData.role}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, role: e.target.value as CreateUserData['role'] }))}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="MEMBER">Üye</option>
                        <option value="EDITOR">Editör</option>
                        <option value="ADMIN">Yönetici</option>
                      </select>
                    </div>
                    <Button onClick={handleCreateUser} className="w-full">
                      Kullanıcı Oluştur
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || 'User'} className="w-12 h-12 rounded-full" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{user.name || 'İsimsiz Kullanıcı'}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{user.email || 'Email yok'}</span>
                      {user.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Kayıt: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</span>
          </div>
        </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {user._count?.authoredArticles || 0} makale, {user._count?.comments || 0} yorum
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={roleColors[user.role] || 'outline'}>
                      {roleLabels[user.role] || 'Bilinmeyen'}
                    </Badge>
                    <Badge variant={statusColors[user.status] || 'outline'}>
                      {statusLabels[user.status] || 'Bilinmeyen'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Email Verification */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEmailVerification(user.id, !user.emailVerified)}
                      title={user.emailVerified ? 'Email doğrulamasını kaldır' : 'Email doğrulamasını ekle'}
                    >
                      {user.emailVerified ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>

                    {/* Status Change - ADMIN cannot modify SUPER_ADMIN status */}
                    {user.role !== 'SUPER_ADMIN' && (
                      <>
                        {user.status === 'ACTIVE' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(user.id, 'BANNED')}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Yasakla
                          </Button>
                        ) : user.status ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Aktifleştir
                          </Button>
                        ) : null}
                      </>
                    )}
                    
                    {/* Role Change - Only for SUPER_ADMIN */}
                    {user.role && (session?.user as any)?.role === 'SUPER_ADMIN' && (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-2 py-1 text-sm border rounded bg-background"
                        disabled={user.role === 'SUPER_ADMIN'}
                      >
                        <option value="MEMBER">Üye</option>
                        <option value="EDITOR">Editör</option>
                        <option value="ADMIN">Yönetici</option>
                        <option value="SUPER_ADMIN" disabled>Süper Yönetici</option>
                      </select>
                    )}

                    {/* Delete - ADMIN cannot delete SUPER_ADMIN */}
                    {user.role !== 'SUPER_ADMIN' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Kullanıcı Bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun kullanıcı bulunamadı.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Toplam {pagination.total} kullanıcıdan {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchUsers(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}