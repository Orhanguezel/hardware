const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixGpuCategory() {
  try {
    console.log('Ekran Kartı kategorisini düzeltiyorum...')
    
    // 1. Mevcut GPU kategorisini bul
    const oldGpuCategory = await prisma.category.findFirst({
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
    
    if (!oldGpuCategory) {
      console.log('❌ Ekran Kartı (GPU) kategorisi bulunamadı')
      return
    }
    
    console.log(`\nMevcut GPU kategorisi:`)
    console.log(`- ID: ${oldGpuCategory.id}`)
    console.log(`- Slug: ${oldGpuCategory.slug}`)
    console.log(`- Ürün sayısı: ${oldGpuCategory._count.products}`)
    console.log(`- Alt kategori sayısı: ${oldGpuCategory._count.children}`)
    console.log(`- Makale sayısı: ${oldGpuCategory._count.articles}`)
    
    // 2. Yeni GPU kategorisi oluştur (güzel slug ile)
    console.log('\nYeni GPU kategorisi oluşturuyorum...')
    
    const newGpuCategory = await prisma.category.create({
      data: {
        name: 'Ekran Kartı (GPU)',
        slug: 'ekran-karti-gpu',
        description: 'Grafik işlemci birimleri ve ekran kartları',
        icon: 'Cpu',
        color: '#8B5CF6',
        isActive: true,
        sortOrder: 2,
        parentId: oldGpuCategory.parentId // Aynı parent'ı kullan
      }
    })
    
    console.log(`✅ Yeni GPU kategorisi oluşturuldu:`)
    console.log(`- ID: ${newGpuCategory.id}`)
    console.log(`- Slug: ${newGpuCategory.slug}`)
    
    // 3. Ürünleri yeni kategoriye taşı
    if (oldGpuCategory.products && oldGpuCategory.products.length > 0) {
      console.log(`\n${oldGpuCategory.products.length} ürünü yeni kategoriye taşıyorum...`)
      
      for (const product of oldGpuCategory.products) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: newGpuCategory.id }
        })
        console.log(`  ✅ ${product.brand} ${product.model} taşındı`)
      }
    }
    
    // 4. Alt kategorileri yeni kategoriye taşı (eğer varsa)
    if (oldGpuCategory.children && oldGpuCategory.children.length > 0) {
      console.log(`\n${oldGpuCategory.children.length} alt kategoriyi yeni kategoriye taşıyorum...`)
      
      for (const child of oldGpuCategory.children) {
        await prisma.category.update({
          where: { id: child.id },
          data: { parentId: newGpuCategory.id }
        })
        console.log(`  ✅ ${child.name} taşındı`)
      }
    }
    
    // 5. Eski kategoriyi sil
    console.log('\nEski GPU kategorisini siliyorum...')
    await prisma.category.delete({
      where: { id: oldGpuCategory.id }
    })
    console.log('✅ Eski GPU kategorisi silindi')
    
    // 6. Sonucu göster
    console.log('\n🎉 GPU kategorisi başarıyla düzeltildi!')
    console.log(`Yeni kategori: ${newGpuCategory.name} (${newGpuCategory.slug})`)
    console.log(`Yeni ID: ${newGpuCategory.id}`)
    
    // 7. Kategori yapısını tekrar göster
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
