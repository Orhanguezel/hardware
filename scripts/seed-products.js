const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const products = [
  // Bilgisayar Bileşenleri - Ekran Kartı
  {
    brand: 'NVIDIA',
    model: 'RTX 4090',
    slug: 'nvidia-rtx-4090',
    description: 'En güçlü gaming ekran kartı, 4K ve ray tracing performansı',
    releaseYear: 2022,
    categorySlug: 'ekran-karti-gpu',
    specs: [
      { name: 'GPU Çekirdeği', value: 'Ada Lovelace', type: 'TEXT' },
      { name: 'VRAM', value: '24', unit: 'GB GDDR6X', type: 'TEXT' },
      { name: 'Boost Clock', value: '2520', unit: 'MHz', type: 'NUMBER' },
      { name: 'CUDA Çekirdek', value: '16384', type: 'NUMBER' },
      { name: 'TDP', value: '450', unit: 'W', type: 'NUMBER' },
      { name: 'Ray Tracing', value: 'Evet', type: 'BOOLEAN' }
    ]
  },
  {
    brand: 'AMD',
    model: 'RX 7900 XTX',
    slug: 'amd-rx-7900-xtx',
    description: 'AMD\'nin en güçlü ekran kartı, yüksek çözünürlük gaming',
    releaseYear: 2022,
    categorySlug: 'ekran-karti-gpu',
    specs: [
      { name: 'GPU Çekirdeği', value: 'RDNA 3', type: 'TEXT' },
      { name: 'VRAM', value: '24', unit: 'GB GDDR6', type: 'TEXT' },
      { name: 'Boost Clock', value: '2500', unit: 'MHz', type: 'NUMBER' },
      { name: 'Stream İşlemci', value: '6144', type: 'NUMBER' },
      { name: 'TDP', value: '355', unit: 'W', type: 'NUMBER' },
      { name: 'Ray Tracing', value: 'Evet', type: 'BOOLEAN' }
    ]
  },
  {
    brand: 'NVIDIA',
    model: 'RTX 4080',
    slug: 'nvidia-rtx-4080',
    description: 'Üst düzey gaming performansı, DLSS 3 desteği',
    releaseYear: 2022,
    categorySlug: 'ekran-karti-gpu',
    specs: [
      { name: 'GPU Çekirdeği', value: 'Ada Lovelace', type: 'TEXT' },
      { name: 'VRAM', value: '16', unit: 'GB GDDR6X', type: 'TEXT' },
      { name: 'Boost Clock', value: '2505', unit: 'MHz', type: 'NUMBER' },
      { name: 'CUDA Çekirdek', value: '9728', type: 'NUMBER' },
      { name: 'TDP', value: '320', unit: 'W', type: 'NUMBER' }
    ]
  },

  // Monitör
  {
    brand: 'Samsung',
    model: 'Odyssey G9',
    slug: 'samsung-odyssey-g9',
    description: '49" ultrawide gaming monitör, 240Hz yenileme hızı',
    releaseYear: 2023,
    categorySlug: 'monitor',
    specs: [
      { name: 'Panel Boyutu', value: '49', unit: 'inch', type: 'NUMBER' },
      { name: 'Çözünürlük', value: '5120x1440', type: 'TEXT' },
      { name: 'Yenileme Hızı', value: '240', unit: 'Hz', type: 'NUMBER' },
      { name: 'Panel Tipi', value: 'VA', type: 'TEXT' },
      { name: 'Tepki Süresi', value: '1', unit: 'ms', type: 'NUMBER' },
      { name: 'HDR', value: 'Evet', type: 'BOOLEAN' }
    ]
  },
  {
    brand: 'LG',
    model: 'UltraGear 27GP950',
    slug: 'lg-ultragear-27gp950',
    description: '27" 4K gaming monitör, 144Hz, Nano IPS',
    releaseYear: 2021,
    categorySlug: 'monitor',
    specs: [
      { name: 'Panel Boyutu', value: '27', unit: 'inch', type: 'NUMBER' },
      { name: 'Çözünürlük', value: '3840x2160', type: 'TEXT' },
      { name: 'Yenileme Hızı', value: '144', unit: 'Hz', type: 'NUMBER' },
      { name: 'Panel Tipi', value: 'Nano IPS', type: 'TEXT' },
      { name: 'Tepki Süresi', value: '1', unit: 'ms', type: 'NUMBER' },
      { name: 'HDR10', value: 'Evet', type: 'BOOLEAN' }
    ]
  },

  // Router
  {
    brand: 'ASUS',
    model: 'AX11000',
    slug: 'asus-ax11000',
    description: 'Wi-Fi 6E gaming router, tri-band, 11000 Mbps',
    releaseYear: 2021,
    categorySlug: 'router',
    specs: [
      { name: 'Wi-Fi Standardı', value: 'Wi-Fi 6E', type: 'TEXT' },
      { name: 'Toplam Hız', value: '11000', unit: 'Mbps', type: 'NUMBER' },
      { name: 'Band', value: 'Tri-Band', type: 'TEXT' },
      { name: 'Port Sayısı', value: '8', type: 'NUMBER' },
      { name: 'USB Port', value: '2', type: 'NUMBER' },
      { name: 'Gaming Özellikler', value: 'Evet', type: 'BOOLEAN' }
    ]
  },
  {
    brand: 'TP-Link',
    model: 'Archer AX73',
    slug: 'tp-link-archer-ax73',
    description: 'Wi-Fi 6 router, dual-band, 5400 Mbps',
    releaseYear: 2021,
    categorySlug: 'router',
    specs: [
      { name: 'Wi-Fi Standardı', value: 'Wi-Fi 6', type: 'TEXT' },
      { name: 'Toplam Hız', value: '5400', unit: 'Mbps', type: 'NUMBER' },
      { name: 'Band', value: 'Dual-Band', type: 'TEXT' },
      { name: 'Port Sayısı', value: '4', type: 'NUMBER' },
      { name: 'USB Port', value: '1', type: 'NUMBER' },
      { name: 'OFDMA', value: 'Evet', type: 'BOOLEAN' }
    ]
  },

  // Gaming Mouse
  {
    brand: 'Logitech',
    model: 'G Pro X Superlight',
    slug: 'logitech-g-pro-x-superlight',
    description: 'Ultra hafif gaming mouse, 25.000 DPI',
    releaseYear: 2020,
    categorySlug: 'gaming-mouse',
    specs: [
      { name: 'Ağırlık', value: '63', unit: 'g', type: 'NUMBER' },
      { name: 'DPI', value: '25000', type: 'NUMBER' },
      { name: 'Sensor', value: 'Hero 25K', type: 'TEXT' },
      { name: 'Tepki Süresi', value: '1', unit: 'ms', type: 'NUMBER' },
      { name: 'Kablosuz', value: 'Evet', type: 'BOOLEAN' },
      { name: 'Pil Ömrü', value: '70', unit: 'saat', type: 'NUMBER' }
    ]
  },
  {
    brand: 'Razer',
    model: 'DeathAdder V3 Pro',
    slug: 'razer-deathadder-v3-pro',
    description: 'Ergonomik gaming mouse, 30.000 DPI',
    releaseYear: 2022,
    categorySlug: 'gaming-mouse',
    specs: [
      { name: 'Ağırlık', value: '63', unit: 'g', type: 'NUMBER' },
      { name: 'DPI', value: '30000', type: 'NUMBER' },
      { name: 'Sensor', value: 'Focus Pro 30K', type: 'TEXT' },
      { name: 'Tepki Süresi', value: '0.2', unit: 'ms', type: 'NUMBER' },
      { name: 'Kablosuz', value: 'Evet', type: 'BOOLEAN' },
      { name: 'Pil Ömrü', value: '90', unit: 'saat', type: 'NUMBER' }
    ]
  },

  // Gaming Klavye
  {
    brand: 'Corsair',
    model: 'K100 RGB',
    slug: 'corsair-k100-rgb',
    description: 'Mekanik gaming klavye, Cherry MX Speed',
    releaseYear: 2020,
    categorySlug: 'gaming-klavye',
    specs: [
      { name: 'Switch', value: 'Cherry MX Speed', type: 'TEXT' },
      { name: 'Aydınlatma', value: 'RGB', type: 'TEXT' },
      { name: 'Tepki Süresi', value: '0.5', unit: 'ms', type: 'NUMBER' },
      { name: 'Anti-Ghosting', value: 'Evet', type: 'BOOLEAN' },
      { name: 'Makro Tuşları', value: '6', type: 'NUMBER' },
      { name: 'Kablolu', value: 'Evet', type: 'BOOLEAN' }
    ]
  },

  // CPU
  {
    brand: 'Intel',
    model: 'Core i9-13900K',
    slug: 'intel-core-i9-13900k',
    description: 'En güçlü Intel işlemci, 24 çekirdek',
    releaseYear: 2022,
    categorySlug: 'islemci-cpu',
    specs: [
      { name: 'Çekirdek', value: '24', type: 'NUMBER' },
      { name: 'Thread', value: '32', type: 'NUMBER' },
      { name: 'Base Clock', value: '3.0', unit: 'GHz', type: 'NUMBER' },
      { name: 'Boost Clock', value: '5.8', unit: 'GHz', type: 'NUMBER' },
      { name: 'Cache', value: '36', unit: 'MB', type: 'NUMBER' },
      { name: 'TDP', value: '125', unit: 'W', type: 'NUMBER' }
    ]
  },
  {
    brand: 'AMD',
    model: 'Ryzen 9 7950X',
    slug: 'amd-ryzen-9-7950x',
    description: 'En güçlü AMD işlemci, 16 çekirdek',
    releaseYear: 2022,
    categorySlug: 'islemci-cpu',
    specs: [
      { name: 'Çekirdek', value: '16', type: 'NUMBER' },
      { name: 'Thread', value: '32', type: 'NUMBER' },
      { name: 'Base Clock', value: '4.5', unit: 'GHz', type: 'NUMBER' },
      { name: 'Boost Clock', value: '5.7', unit: 'GHz', type: 'NUMBER' },
      { name: 'Cache', value: '80', unit: 'MB', type: 'NUMBER' },
      { name: 'TDP', value: '170', unit: 'W', type: 'NUMBER' }
    ]
  }
]

async function main() {
  console.log('Ürünler oluşturuluyor...')

  for (const productData of products) {
    const { specs, categorySlug, ...productInfo } = productData

    // Kategoriyi bul
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })

    if (!category) {
      console.log(`❌ Kategori bulunamadı: ${categorySlug}`)
      continue
    }

    // Ürünü oluştur
    const product = await prisma.product.upsert({
      where: { slug: productInfo.slug },
      update: {
        ...productInfo,
        categoryId: category.id
      },
      create: {
        ...productInfo,
        categoryId: category.id
      }
    })

    console.log(`✓ Ürün oluşturuldu: ${product.brand} ${product.model}`)

    // Özellikleri ekle
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i]
      await prisma.productSpec.upsert({
        where: {
          productId_name: {
            productId: product.id,
            name: spec.name
          }
        },
        update: {
          value: spec.value,
          unit: spec.unit,
          type: spec.type,
          sortOrder: i
        },
        create: {
          productId: product.id,
          name: spec.name,
          value: spec.value,
          unit: spec.unit,
          type: spec.type,
          sortOrder: i,
          isVisible: true
        }
      })
    }

    console.log(`  ✓ ${specs.length} özellik eklendi`)
  }

  console.log('\n🎉 Tüm ürünler başarıyla oluşturuldu!')
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
