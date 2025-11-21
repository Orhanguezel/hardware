'use client'

import { FavoriteButton } from '@/components/product/favorite-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestFavoritePage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Favorite Button Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Product 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Bu bir test ürünüdür.</p>
            <FavoriteButton productId="cmfvcnxui00011329lrefweb5" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Product 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Bu da bir test ürünüdür.</p>
            <FavoriteButton productId="test-product-2" />
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Test Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Browser console'unu açın (F12)</li>
          <li>Favori butonlarına tıklayın</li>
          <li>Console log'larını kontrol edin</li>
          <li>Hataları buraya bildirin</li>
        </ol>
      </div>
    </div>
  )
}
