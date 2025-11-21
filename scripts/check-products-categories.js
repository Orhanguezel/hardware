const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProductsCategories() {
  try {
    console.log('=== ÜRÜN VE KATEGORİ KONTROLÜ ===\n')

    // 1. Tüm kategorileri listele
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' }
      ]
    })

    console.log('📁 KATEGORİLER VE ÜRÜN SAYILARI:')
    console.log('================================')
    
    categories.forEach(category => {
      const indent = category.parentId ? '  ├── ' : '📁 '
      console.log(`${indent}${category.name}`)
      console.log(`    ID: ${category.id}`)
      console.log(`    Slug: ${category.slug}`)
      console.log(`    Ürün Sayısı: ${category._count.products}`)
      if (category.parentId) {
        const parent = categories.find(c => c.id === category.parentId)
        console.log(`    Ana Kategori: ${parent?.name || 'Bulunamadı'}`)
      }
      console.log('')
    })

    // 2. Kategorisiz ürünleri kontrol et
    console.log('\n🔍 KATEGORİSİZ ÜRÜNLER:')
    console.log('=====================')
    
    const productsWithoutCategory = await prisma.product.findMany({
      where: {
        categoryId: null
      },
      select: {
        id: true,
        brand: true,
        model: true,
        slug: true
      }
    })

    if (productsWithoutCategory.length > 0) {
      console.log(`${productsWithoutCategory.length} ürün kategorisiz:`)
      productsWithoutCategory.forEach(product => {
        console.log(`- ${product.brand} ${product.model} (${product.slug})`)
      })
    } else {
      console.log('✅ Tüm ürünler kategorili')
    }

    // 3. Her kategorideki ürünleri detaylı göster
    console.log('\n📦 KATEGORİ BAZLI ÜRÜN DETAYLARI:')
    console.log('=================================')
    
    for (const category of categories) {
      if (category._count.products > 0) {
        const products = await prisma.product.findMany({
          where: {
            categoryId: category.id
          },
          select: {
            id: true,
            brand: true,
            model: true,
            slug: true
          },
          take: 5 // İlk 5 ürünü göster
        })

        const prefix = category.parentId ? '  ├── ' : '📁 '
        console.log(`${prefix}${category.name} (${category._count.products} ürün):`)
        products.forEach(product => {
          console.log(`    - ${product.brand} ${product.model}`)
        })
        if (category._count.products > 5) {
          console.log(`    ... ve ${category._count.products - 5} ürün daha`)
        }
        console.log('')
      }
    }

    // 4. Toplam istatistikler
    const totalProducts = await prisma.product.count()
    const totalCategories = categories.length
    const categoriesWithProducts = categories.filter(c => c._count.products > 0).length
    const emptyCategories = categories.filter(c => c._count.products === 0).length

    console.log('\n📊 İSTATİSTİKLER:')
    console.log('================')
    console.log(`Toplam Ürün: ${totalProducts}`)
    console.log(`Toplam Kategori: ${totalCategories}`)
    console.log(`Ürünlü Kategori: ${categoriesWithProducts}`)
    console.log(`Boş Kategori: ${emptyCategories}`)

    if (emptyCategories > 0) {
      console.log('\n⚠️ BOŞ KATEGORİLER:')
      console.log('==================')
      categories.filter(c => c._count.products === 0).forEach(category => {
        const indent = category.parentId ? '  ├── ' : '📁 '
        console.log(`${indent}${category.name}`)
      })
    }

  } catch (error) {
    console.error('Hata oluştu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductsCategories()
