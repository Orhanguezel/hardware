const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

const sampleTags = [
  // General tags
  { name: 'Gaming', slug: 'gaming', type: 'GENERAL' },
  { name: 'Professional', slug: 'professional', type: 'GENERAL' },
  { name: 'Budget', slug: 'budget', type: 'GENERAL' },
  { name: 'Premium', slug: 'premium', type: 'GENERAL' },
  { name: 'Portable', slug: 'portable', type: 'GENERAL' },
  { name: 'Desktop', slug: 'desktop', type: 'GENERAL' },
  
  // Brand tags
  { name: 'NVIDIA', slug: 'nvidia', type: 'BRAND' },
  { name: 'AMD', slug: 'amd', type: 'BRAND' },
  { name: 'Intel', slug: 'intel', type: 'BRAND' },
  { name: 'Samsung', slug: 'samsung', type: 'BRAND' },
  { name: 'ASUS', slug: 'asus', type: 'BRAND' },
  { name: 'MSI', slug: 'msi', type: 'BRAND' },
  { name: 'Corsair', slug: 'corsair', type: 'BRAND' },
  { name: 'Logitech', slug: 'logitech', type: 'BRAND' },
  
  // Feature tags
  { name: 'Wi-Fi 6', slug: 'wifi-6', type: 'FEATURE' },
  { name: 'Wi-Fi 6E', slug: 'wifi-6e', type: 'FEATURE' },
  { name: '4K', slug: '4k', type: 'FEATURE' },
  { name: '144Hz', slug: '144hz', type: 'FEATURE' },
  { name: 'RGB', slug: 'rgb', type: 'FEATURE' },
  { name: 'Mechanical', slug: 'mechanical', type: 'FEATURE' },
  { name: 'Wireless', slug: 'wireless', type: 'FEATURE' },
  { name: 'Bluetooth', slug: 'bluetooth', type: 'FEATURE' },
  { name: 'USB-C', slug: 'usb-c', type: 'FEATURE' },
  { name: 'Ray Tracing', slug: 'ray-tracing', type: 'FEATURE' },
  
  // Price range tags
  { name: 'Under 1000₺', slug: 'under-1000', type: 'PRICE_RANGE' },
  { name: '1000-3000₺', slug: '1000-3000', type: 'PRICE_RANGE' },
  { name: '3000-5000₺', slug: '3000-5000', type: 'PRICE_RANGE' },
  { name: '5000₺+', slug: '5000-plus', type: 'PRICE_RANGE' },
  { name: 'High-End', slug: 'high-end', type: 'PRICE_RANGE' },
  { name: 'Mid-Range', slug: 'mid-range', type: 'PRICE_RANGE' },
  { name: 'Entry-Level', slug: 'entry-level', type: 'PRICE_RANGE' }
]

async function createSampleTags() {
  console.log('Creating sample tags...')
  
  for (const tag of sampleTags) {
    try {
      const response = await fetch(`${DJANGO_API_URL}/tags/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tag),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Created tag: ${tag.name}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log(`❌ Failed to create tag ${tag.name}:`, errorData.error || 'Unknown error')
      }
    } catch (error) {
      console.log(`❌ Error creating tag ${tag.name}:`, error.message)
    }
  }
  
  console.log('Sample tags creation completed!')
}

// Run the script
createSampleTags().catch(console.error)
