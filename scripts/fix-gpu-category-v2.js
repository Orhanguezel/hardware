const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixGpuCategory() {
  try {
    console.log('Ekran Kartı kategorisini düzeltiyorum...')
    
    // 1. Mevcut GPU kategorisini bul
    const gpuCategory = await prisma.category.findFirst({
      where: { name: 'Ekran Kartı (GPU)' },
      include: {
        products: true,
        children: true,
        _count: {
          select: {
            articles: true,
            children: true,
            products: true
          }
        }
      }
    })
    
    if (!gpuCategory) {
      console.log('❌ Ekran Kartı (GPU) kategorisi bulunamadı')
      return
    }
    
    console.log(`\nMevcut GPU kategorisi:`)
    console.log(`- ID: ${gpuCategory.id}`)
    console.log(`- Slug: ${gpuCategory.slug}`)
    console.log(`- Ürün sayısı: ${gpuCategory._count.products}`)
    
    // ID'yi değiştirmek için yeni bir kategori oluşturalım ve eski kategoriyi silelim
    console.log('\nYeni GPU kategorisi oluşturuyorum...')
    
    // Önce slug'ı geçici olarak değiştir
    await prisma.category.update({
      where: { id: gpuCategory.id },
      data: { slug: 'ekran-karti-gpu-old' }
    })
    
    // Yeni kategori oluştur
    const newGpuCategory = await prisma.category.create({
      data: {
        name: 'Ekran Kartı (GPU)',
        slug: 'ekran-karti-gpu',
        description: 'Grafik işlemci birimleri ve ekran kartları',
        icon: 'Cpu',
        color: '#8B5CF6',
        isActive: true,
        sortOrder: 2,
        parentId: gpuCategory.parentId
      }
    })
    
    console.log(`✅ Yeni GPU kategorisi oluşturuldu:`)
    console.log(`- ID: ${newGpuCategory.id}`)
    console.log(`- Slug: ${newGpuCategory.slug}`)
    
    // Ürünleri yeni kategoriye taşı
    if (gpuCategory.products && gpuCategory.products.length > 0) {
      console.log(`\n${gpuCategory.products.length} ürünü yeni kategoriye taşıyorum...`)
      
      for (const product of gpuCategory.products) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: newGpuCategory.id }
        })
        console.log(`  ✅ ${product.brand} ${product.model} taşındı`)
      }
    }
    
    // Alt kategorileri yeni kategoriye taşı
    if (gpuCategory.children && gpuCategory.children.length > 0) {
      console.log(`\n${gpuCategory.children.length} alt kategoriyi yeni kategoriye taşıyorum...`)
      
      for (const child of gpuCategory.children) {
        await prisma.category.update({
          where: { id: child.id },
          data: { parentId: newGpuCategory.id }
        })
        console.log(`  ✅ ${child.name} taşındı`)
      }
    }
    
    // Eski kategoriyi sil
    console.log('\nEski GPU kategorisini siliyorum...')
    await prisma.category.delete({
      where: { id: gpuCategory.id }
    })
    console.log('✅ Eski GPU kategorisi silindi')
    
    // Sonucu göster
    console.log('\n🎉 GPU kategorisi başarıyla düzeltildi!')
    console.log(`Yeni kategori: ${newGpuCategory.name} (${newGpuCategory.slug})`)
    console.log(`Yeni ID: ${newGpuCategory.id}`)
    
    // Kategori yapısını tekrar göster
    console.log('\n📁 Güncellenmiş Bilgisayar Bileşenleri kategorisi:')
    const updatedParent = await prisma.category.findFirst({
      where: { id: newGpuCategory.parentId },
      include: {
        children: {
          orderBy: { name: 'asc' }
        }
      }
    })
    
    if (updatedParent) {
      console.log(`Ana kategori: ${updatedParent.name}`)
      updatedParent.children.forEach(child => {
        console.log(`  ├── ${child.name} (${child.slug})`)
      })
    }
    
  } catch (error) {
    console.error('GPU kategorisi düzeltilirken hata oluştu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixGpuCategory()
