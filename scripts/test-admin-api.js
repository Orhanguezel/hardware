const fetch = require('node-fetch')

async function testAdminAPI() {
  try {
    console.log('Admin Products API test ediliyor...')
    
    const response = await fetch('http://localhost:3001/api/admin/products')
    
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`)
      return
    }
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ API başarılı!')
      console.log(`📊 Toplam ürün sayısı: ${data.data.products.length}`)
      console.log(`📄 Sayfa bilgisi: ${data.data.pagination.page}/${data.data.pagination.totalPages}`)
      
      if (data.data.products.length > 0) {
        console.log('\n📦 İlk 5 ürün:')
        data.data.products.slice(0, 5).forEach((product, index) => {
          console.log(`${index + 1}. ${product.brand} ${product.model}`)
          console.log(`   Kategori: ${product.category?.name || 'Kategori yok'}`)
          console.log(`   Yorumlar: ${product.reviewCount}, Özellikler: ${product.specsCount}`)
          console.log('')
        })
      }
    } else {
      console.error('❌ API hatası:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error.message)
  }
}

testAdminAPI()
