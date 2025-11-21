const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkProducts() {
  try {
    console.log('=== ÜRÜN KONTROLÜ ===')
    
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            userReviews: true,
            productSpecs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`Toplam ürün sayısı: ${products.length}`)
    console.log('')

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.brand} ${product.model}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Kategori: ${product.category?.name || 'Kategori yok'} (${product.category?.slug || 'slug yok'})`)
      console.log(`   Oluşturulma: ${product.createdAt}`)
      console.log(`   Yorumlar: ${product._count.userReviews}, Özellikler: ${product._count.productSpecs}`)
      console.log('')
    })

    // Kategorileri de kontrol et
    console.log('=== KATEGORİ KONTROLÜ ===')
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    categories.forEach(category => {
      if (category._count.products > 0) {
        console.log(`${category.name}: ${category._count.products} ürün`)
      }
    })

    // Admin panel API'sini test et
    console.log('\n=== ADMIN PANEL API TESTİ ===')
    const adminProducts = await prisma.product.findMany({
      select: {
        id: true,
        brand: true,
        model: true,
        slug: true,
        categoryId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Admin API'de görünen ürün sayısı: ${adminProducts.length}`)
    
    if (adminProducts.length > 0) {
      console.log('Son eklenen ürünler:')
      adminProducts.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.brand} ${product.model} (${product.createdAt})`)
      })
    }

  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()
