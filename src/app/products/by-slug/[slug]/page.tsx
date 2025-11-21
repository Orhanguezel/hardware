import { notFound } from 'next/navigation'
import { ProductDetailClient } from '@/components/product/product-detail-client'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getProduct(slug: string) {
  try {
    const url = `http://localhost:8000/api/products/${slug}/`
    console.log('Fetching product from URL:', url)
    
    const response = await fetch(url, {
      cache: 'no-store'
    })
    
    console.log('Product response status:', response.status)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Product not found (404)')
        return null
      }
      const errorData = await response.json().catch(() => ({}))
      console.log('Product fetch error:', errorData)
      throw new Error(`Failed to fetch product: ${response.status}`)
    }
    
           const data = await response.json()
           console.log('Product data:', data)
           console.log('Product ID:', data.id, 'Type:', typeof data.id)
           return data
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}
