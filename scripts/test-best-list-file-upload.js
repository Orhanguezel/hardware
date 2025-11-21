const fetch = require('node-fetch')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

async function testBestListFileUpload() {
  try {
    console.log('Best List File Upload test ediliyor...')
    
    // Create a test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ])
    
    // Create FormData for the article
    const formData = new FormData()
    
    // Basic article data
    formData.append('title', 'Test Best List Article')
    formData.append('subtitle', 'Test subtitle')
    formData.append('excerpt', 'Test excerpt')
    formData.append('content', '<p>Test content</p>')
    formData.append('type', 'BEST_LIST')
    formData.append('categoryId', '1') // Assuming category 1 exists
    formData.append('status', 'DRAFT')
    formData.append('metaTitle', 'Test Meta Title')
    formData.append('metaDescription', 'Test Meta Description')
    
    // Best list items with file upload
    const bestListItems = [
      {
        id: '1',
        title: 'Test Product 1',
        description: 'Test description 1',
        image: '', // Will be replaced with uploaded file URL
        pros: ['Pro 1', 'Pro 2'],
        cons: ['Con 1'],
        price: '1000',
        rating: 8,
        link: 'https://example.com/product1'
      },
      {
        id: '2',
        title: 'Test Product 2',
        description: 'Test description 2',
        image: 'https://example.com/image2.jpg', // URL fallback
        pros: ['Pro 3'],
        cons: ['Con 2', 'Con 3'],
        price: '2000',
        rating: 9,
        link: 'https://example.com/product2'
      }
    ]
    
    formData.append('bestListItems', JSON.stringify(bestListItems))
    
    // Add image file for the first item
    formData.append('best_list_item_0_image_file', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    })
    
    console.log('📤 Test verisi hazırlandı')
    console.log('📋 Best list items:', bestListItems.length)
    console.log('🖼️  Image file eklendi: test-image.png')
    
    // Send request
    const response = await fetch('http://localhost:3001/api/articles', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Token your-token-here' // Replace with actual token
      }
    })
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      return
    }
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Best List Article başarıyla oluşturuldu!')
      console.log(`📄 Article ID: ${result.data.id}`)
      console.log(`🔗 Slug: ${result.data.slug}`)
      console.log(`📝 Title: ${result.data.title}`)
      console.log(`📊 Type: ${result.data.type}`)
      
      if (result.data.best_list_extra) {
        console.log(`📋 Best list items: ${result.data.best_list_extra.items.length}`)
        result.data.best_list_extra.items.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.title}`)
          console.log(`     Image: ${item.image}`)
          console.log(`     Price: ${item.price}`)
          console.log(`     Rating: ${item.rating}/10`)
        })
      }
    } else {
      console.error('❌ API hatası:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error.message)
  }
}

// Check if we're running this script directly
if (require.main === module) {
  testBestListFileUpload()
}

module.exports = { testBestListFileUpload }
