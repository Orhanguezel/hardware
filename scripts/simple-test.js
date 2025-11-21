const http = require('http')

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/products',
    method: 'GET'
  }

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`)
    console.log(`Headers:`, res.headers)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data)
        if (jsonData.success) {
          console.log('✅ API başarılı!')
          console.log(`📊 Ürün sayısı: ${jsonData.data.products.length}`)
          if (jsonData.data.products.length > 0) {
            console.log('📦 İlk ürün:', jsonData.data.products[0].brand, jsonData.data.products[0].model)
          }
        } else {
          console.log('❌ API hatası:', jsonData.error)
        }
      } catch (error) {
        console.log('❌ JSON parse hatası:', error.message)
        console.log('Raw response:', data.substring(0, 200))
      }
    })
  })

  req.on('error', (error) => {
    console.error('❌ Request hatası:', error.message)
  })

  req.end()
}

testAPI()
