const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupCategories() {
  try {
    console.log('Kategori temizleme işlemi başlıyor...')
    
    // 1. Test kategorisini sil
    console.log('\n1. Test kategorisini siliyorum...')
    const testCategory = await prisma.category.findFirst({
      where: { name: 'test' }
    })
    
    if (testCategory) {
      await prisma.category.delete({
        where: { id: testCategory.id }
      })
      console.log('✅ Test kategorisi silindi')
    } else {
      console.log('❌ Test kategorisi bulunamadı')
    }

    // 2. Masaüstü kategorisini kontrol et ve düzelt
    console.log('\n2. Masaüstü kategorisini kontrol ediyorum...')
    const masaustuCategory = await prisma.category.findFirst({
      where: { name: 'Masaüstü' }
    })
    
    if (masaustuCategory) {
      // Eğer bu kategori alt kategorisi yoksa ve ürünü yoksa sil
      const hasChildren = masaustuCategory.children && masaustuCategory.children.length > 0
      const hasProducts = masaustuCategory.products && masaustuCategory.products.length > 0
      
      if (!hasChildren && !hasProducts) {
        await prisma.category.delete({
          where: { id: masaustuCategory.id }
        })
        console.log('✅ Boş Masaüstü kategorisi silindi')
      } else {
        console.log('⚠️ Masaüstü kategorisi alt kategorileri veya ürünleri var, silinmedi')
      }
    } else {
      console.log('❌ Masaüstü kategorisi bulunamadı')
    }

    // 3. Ekran Kartı (GPU) kategorisinin slugını kontrol et
    console.log('\n3. Ekran Kartı (GPU) kategorisini kontrol ediyorum...')
    const gpuCategory = await prisma.category.findFirst({
      where: { name: 'Ekran Kartı (GPU)' }
    })
    
    if (gpuCategory) {
      console.log(`Mevcut slug: ${gpuCategory.slug}`)
      console.log(`Mevcut ID: ${gpuCategory.id}`)
      
      // Slug zaten güzel görünüyor (ekran-karti-gpu)
      if (gpuCategory.slug === 'ekran-karti-gpu') {
        console.log('✅ Ekran Kartı kategorisinin slugı zaten güzel')
      } else {
        // Slugı güncelle
        await prisma.category.update({
          where: { id: gpuCategory.id },
          data: { slug: 'ekran-karti-gpu' }
        })
        console.log('✅ Ekran Kartı kategorisinin slugı güncellendi')
      }
    }

    // 4. Kategori yapısını tekrar göster
    console.log('\n4. Temizleme sonrası kategori yapısı:')
    console.log('=====================================')
    
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            articles: true,
            children: true,
            products: true
          }
        }
      },
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' }
      ]
    })

    const mainCategories = categories.filter(cat => !cat.parentId)
    
    mainCategories.forEach(category => {
      console.log(`\n📁 ${category.name} (${category.slug})`)
      console.log(`   ID: ${category.id}`)
      console.log(`   Makaleler: ${category._count.articles}, Alt Kategoriler: ${category._count.children}, Ürünler: ${category._count.products}`)
      
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          console.log(`   ├── ${child.name} (${child.slug})`)
        })
      }
    })

  } catch (error) {
    console.error('Kategori temizleme sırasında hata oluştu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupCategories()
