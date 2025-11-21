const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Bilgisayar',
    slug: 'bilgisayar',
    description: 'Masaüstü ve dizüstü bilgisayarlar',
    icon: 'Laptop',
    color: '#3B82F6',
    sortOrder: 1,
    children: [
      {
        name: 'Masaüstü Bilgisayar',
        slug: 'masaustu-bilgisayar',
        description: 'Masaüstü bilgisayarlar ve sistemler'
      },
      {
        name: 'Dizüstü Bilgisayar',
        slug: 'dizustu-bilgisayar',
        description: 'Laptop ve notebook bilgisayarlar'
      },
      {
        name: 'All-in-One',
        slug: 'all-in-one',
        description: 'Tümü bir arada bilgisayarlar'
      },
      {
        name: 'Mini PC',
        slug: 'mini-pc',
        description: 'Kompakt bilgisayar sistemleri'
      }
    ]
  },
  {
    name: 'Telefon',
    slug: 'telefon',
    description: 'Akıllı telefonlar ve aksesuarları',
    icon: 'Smartphone',
    color: '#10B981',
    sortOrder: 2,
    children: [
      {
        name: 'iPhone',
        slug: 'iphone',
        description: 'Apple iPhone modelleri'
      },
      {
        name: 'Samsung Galaxy',
        slug: 'samsung-galaxy',
        description: 'Samsung Galaxy serisi'
      },
      {
        name: 'Android Telefonlar',
        slug: 'android-telefonlar',
        description: 'Android işletim sistemi telefonlar'
      },
      {
        name: 'Telefon Aksesuarları',
        slug: 'telefon-aksesuarlari',
        description: 'Telefon kılıfları, şarj cihazları vb.'
      }
    ]
  },
  {
    name: 'Çevre Birimleri',
    slug: 'cevre-birimleri',
    description: 'Klavye, fare, hoparlör ve diğer çevre birimleri',
    icon: 'Mouse',
    color: '#8B5CF6',
    sortOrder: 3,
    children: [
      {
        name: 'Klavye',
        slug: 'klavye',
        description: 'Mekanik ve membran klavyeler'
      },
      {
        name: 'Fare',
        slug: 'fare',
        description: 'Gaming ve ofis fareleri'
      },
      {
        name: 'Hoparlör',
        slug: 'hoparlor',
        description: 'Masaüstü ve taşınabilir hoparlörler'
      },
      {
        name: 'Kulaklık',
        slug: 'kulaklik',
        description: 'Kablolu ve kablosuz kulaklıklar'
      },
      {
        name: 'Webcam',
        slug: 'webcam',
        description: 'Web kameraları ve görüntüleme cihazları'
      }
    ]
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Oyun donanımları ve aksesuarları',
    icon: 'Gamepad2',
    color: '#F59E0B',
    sortOrder: 4,
    children: [
      {
        name: 'Gaming Mouse',
        slug: 'gaming-mouse',
        description: 'Oyun fareleri'
      },
      {
        name: 'Gaming Klavye',
        slug: 'gaming-klavye',
        description: 'Mekanik gaming klavyeler'
      },
      {
        name: 'Gaming Kulaklık',
        slug: 'gaming-kulaklik',
        description: 'Oyun kulaklıkları'
      },
      {
        name: 'Gaming Monitör',
        slug: 'gaming-monitor',
        description: 'Yüksek yenileme hızlı monitörler'
      },
      {
        name: 'Oyun Konsolu',
        slug: 'oyun-konsolu',
        description: 'PlayStation, Xbox ve Nintendo'
      }
    ]
  },
  {
    name: 'TV, Ses ve Görüntü Sistemi',
    slug: 'tv-ses-goruntu',
    description: 'Televizyon, ses sistemleri ve görüntü cihazları',
    icon: 'Monitor',
    color: '#EF4444',
    sortOrder: 5,
    children: [
      {
        name: 'Televizyon',
        slug: 'televizyon',
        description: 'LED, OLED, QLED TV\'ler'
      },
      {
        name: 'Monitör',
        slug: 'monitor',
        description: 'Masaüstü monitörler'
      },
      {
        name: 'Projeksiyon',
        slug: 'projeksiyon',
        description: 'Projeksiyon cihazları'
      },
      {
        name: 'Soundbar',
        slug: 'soundbar',
        description: 'Ses çubukları'
      },
      {
        name: 'AV Receiver',
        slug: 'av-receiver',
        description: 'Ses ve görüntü alıcıları'
      }
    ]
  },
  {
    name: 'Bilgisayar Bileşenleri',
    slug: 'bilgisayar-bilesenleri',
    description: 'İşlemci, ekran kartı, RAM ve diğer bileşenler',
    icon: 'Cpu',
    color: '#06B6D4',
    sortOrder: 6,
    children: [
      {
        name: 'İşlemci (CPU)',
        slug: 'islemci-cpu',
        description: 'Intel ve AMD işlemciler'
      },
      {
        name: 'Ekran Kartı (GPU)',
        slug: 'ekran-karti-gpu',
        description: 'NVIDIA ve AMD ekran kartları'
      },
      {
        name: 'Anakart',
        slug: 'anakart',
        description: 'Motherboard\'lar'
      },
      {
        name: 'RAM',
        slug: 'ram',
        description: 'Bellek modülleri'
      },
      {
        name: 'Depolama',
        slug: 'depolama',
        description: 'SSD, HDD ve NVMe sürücüler'
      },
      {
        name: 'Güç Kaynağı',
        slug: 'guc-kaynagi',
        description: 'PSU\'lar'
      },
      {
        name: 'Soğutma',
        slug: 'sogutma',
        description: 'Fan, heatsink ve sıvı soğutma'
      },
      {
        name: 'Kasa',
        slug: 'kasa',
        description: 'PC kasaları'
      }
    ]
  },
  {
    name: 'Ağ Modem Ürünleri',
    slug: 'ag-modem-urunleri',
    description: 'Router, modem, switch ve ağ ekipmanları',
    icon: 'Router',
    color: '#84CC16',
    sortOrder: 7,
    children: [
      {
        name: 'Router',
        slug: 'router',
        description: 'Wi-Fi router\'lar'
      },
      {
        name: 'Modem',
        slug: 'modem',
        description: 'ADSL, VDSL ve fiber modemler'
      },
      {
        name: 'Mesh Sistem',
        slug: 'mesh-sistem',
        description: 'Mesh Wi-Fi sistemleri'
      },
      {
        name: 'Access Point',
        slug: 'access-point',
        description: 'Kablosuz erişim noktaları'
      },
      {
        name: 'Network Switch',
        slug: 'network-switch',
        description: 'Ethernet switch\'ler'
      },
      {
        name: 'Ağ Kartı',
        slug: 'ag-karti',
        description: 'Ethernet ve Wi-Fi kartları'
      }
    ]
  },
  {
    name: 'Yazıcı ve Tüketim',
    slug: 'yazici-tuketim',
    description: 'Yazıcılar, tarayıcılar ve tüketim malzemeleri',
    icon: 'Printer',
    color: '#F97316',
    sortOrder: 8,
    children: [
      {
        name: 'Lazer Yazıcı',
        slug: 'lazer-yazici',
        description: 'Siyah beyaz ve renkli lazer yazıcılar'
      },
      {
        name: 'Mürekkep Püskürtmeli',
        slug: 'murekkep-puskurtmeli',
        description: 'Inkjet yazıcılar'
      },
      {
        name: 'Tarayıcı',
        slug: 'tarayici',
        description: 'Belge tarayıcıları'
      },
      {
        name: 'Çok Fonksiyonlu',
        slug: 'cok-fonksiyonlu',
        description: 'Yazdırma, tarama, fotokopi cihazları'
      },
      {
        name: 'Yazıcı Toneri',
        slug: 'yazici-toneri',
        description: 'Toner kartuşları'
      },
      {
        name: 'Mürekkep Kartuşu',
        slug: 'murekkep-kartusu',
        description: 'Inkjet kartuşları'
      }
    ]
  }
]

async function main() {
  console.log('Kategoriler oluşturuluyor...')

  for (const categoryData of categories) {
    const { children, ...parentData } = categoryData

    // Ana kategoriyi oluştur
    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: parentData,
      create: parentData
    })

    console.log(`✓ Ana kategori oluşturuldu: ${parent.name}`)

    // Alt kategorileri oluştur
    for (const childData of children) {
      await prisma.category.upsert({
        where: { slug: childData.slug },
        update: {
          ...childData,
          parentId: parent.id
        },
        create: {
          ...childData,
          parentId: parent.id
        }
      })

      console.log(`  ✓ Alt kategori oluşturuldu: ${childData.name}`)
    }
  }

  console.log('\n🎉 Tüm kategoriler başarıyla oluşturuldu!')
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
