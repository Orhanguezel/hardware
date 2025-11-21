const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    console.log('Mevcut kategoriler:')
    console.log('==================')
    
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

    categories.forEach((category, index) => {
      const isParent = !category.parentId
      const indent = isParent ? '' : '  ├── '
      
      console.log(`${index + 1}. ${indent}${category.name}`)
      console.log(`   ID: ${category.id}`)
      console.log(`   Slug: ${category.slug}`)
      console.log(`   Parent: ${category.parent?.name || 'Ana Kategori'}`)
      console.log(`   Makaleler: ${category._count.articles}, Alt Kategoriler: ${category._count.children}, Ürünler: ${category._count.products}`)
      console.log('')
    })

    // Ekran kartı kategorilerini özel olarak göster
    const gpuCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes('ekran') || 
      cat.name.toLowerCase().includes('kart') ||
      cat.name.toLowerCase().includes('gpu') ||
      cat.name.toLowerCase().includes('graphics')
    )

    if (gpuCategories.length > 0) {
      console.log('\n🎮 EKRAN KARTI KATEGORİLERİ:')
      console.log('============================')
      gpuCategories.forEach(cat => {
        console.log(`- ${cat.name} (${cat.slug}) - ID: ${cat.id}`)
      })
    }

  } catch (error) {
    console.error('Kategoriler kontrol edilirken hata oluştu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()
