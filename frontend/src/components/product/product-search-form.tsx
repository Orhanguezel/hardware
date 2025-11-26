'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function ProductSearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('search', searchTerm.trim())
      params.delete('page') // Reset to first page
      router.push(`/products?${params.toString()}`)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('search')
      params.delete('page') // Reset to first page
      router.push(`/products?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Marka veya model ara..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button type="submit" className="sm:w-auto">
        <Search className="w-4 h-4 mr-2" />
        Ara
      </Button>
    </form>
  )
}
