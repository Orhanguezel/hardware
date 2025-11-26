# Hardware Review Site

Donanım inceleme ve karşılaştırma sitesi. Router, modem ve ağ ekipmanları hakkında detaylı incelemeler, objektif karşılaştırmalar ve uzman rehberleri.

<!-- made by byiyuel -->

## 🚀 Özellikler

- **İçerik Yönetimi**: Review, Best List, Compare, Guide ve News içerik türleri
- **Skor Motoru**: Ağırlıklı kriterler ile objektif puanlama sistemi
- **Affiliate Yönetimi**: Çoklu satıcı desteği ve tıklama takibi
- **Arama ve Filtreleme**: Gelişmiş arama ve kategori filtreleri
- **SEO Optimizasyonu**: Schema markup, sitemap ve meta optimizasyonu
- **Admin Paneli**: Kapsamlı içerik ve kullanıcı yönetimi
- **Responsive Tasarım**: Modern ve kullanıcı dostu arayüz

## 🛠 Teknoloji Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Django REST Framework, PostgreSQL
- **Database**: PostgreSQL
- **Authentication**: Django Auth + NextAuth.js
- **Storage**: Django Media Files
- **Deployment**: Vercel (Frontend) + Railway/Heroku (Backend)

## 📋 Kurulum

### Gereksinimler

- Node.js 18+
- Python 3.8+
- PostgreSQL 14+
- npm veya yarn

### 1. Bağımlılıkları Yükleyin

```bash
# Frontend bağımlılıkları
npm install

# Backend bağımlılıkları
cd backend
pip install -r requirements.txt
```

### 2. Ortam Değişkenlerini Ayarlayın

```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyerek gerekli değişkenleri ayarlayın:

```env
# Django API
DJANGO_API_URL="http://localhost:8000/api"
NEXT_PUBLIC_API_URL="http://localhost:8000/api"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"
```

### 3. Veritabanını Kurun

```bash
# Django migration'larını çalıştırın
cd backend
python manage.py migrate

# Örnek verileri yükleyin
python manage.py seed_data

# Superuser oluşturun (opsiyonel)
python manage.py createsuperuser
```

### 4. Uygulamayı Başlatın

```bash
# Backend'i başlatın (Terminal 1)
cd backend
python manage.py runserver 8000

# Frontend'i başlatın (Terminal 2)
npm run dev
```

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:8000/api](http://localhost:8000/api)
- Django Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

## 👤 Test Hesapları

- **Admin**: `admin@hardware-review.com` / `password123`
- **Yazar**: `author@hardware-review.com` / `password123`

## 📚 Detaylı Dokümantasyon

Kapsamlı kurulum talimatları, API dokümantasyonu ve deployment rehberleri için proje içindeki dokümantasyon dosyalarını inceleyin.

## 🗄 Veritabanı Şeması

### Ana Modeller

- **User**: Kullanıcı bilgileri ve rolleri
- **Article**: İçerik yönetimi (review, best list, compare, guide, news)
- **Product**: Ürün bilgileri ve özellikleri
- **Category**: Hiyerarşik kategori yapısı
- **Tag**: Etiket sistemi
- **ReviewExtra**: İnceleme puanlama verileri
- **CompareExtra**: Karşılaştırma verileri
- **AffiliateLink**: Affiliate link yönetimi
- **OutboundClick**: Tıklama takibi

### Kullanıcı Rolleri

- **VISITOR**: Ziyaretçi
- **MEMBER**: Üye
- **AUTHOR**: Yazar
- **EDITOR**: Editör
- **ADMIN**: Yönetici
- **SUPER_ADMIN**: Süper yönetici

## 📊 Skor Motoru

İnceleme puanlama sistemi ağırlıklı kriterlere dayanır:

- **Performans** (35%): Genel performans ve hız
- **İstikrar & Ping** (25%): Bağlantı kararlılığı
- **Kapsama & Çekim** (20%): Sinyal gücü ve kapsama
- **Yazılım & Arayüz** (10%): Kullanıcı deneyimi
- **Fiyat & Değer** (10%): Fiyat/performans oranı

## 🔗 API Endpoints

### İçerik
- `GET /api/reviews` - İnceleme listesi
- `POST /api/reviews` - Yeni inceleme oluştur
- `GET /api/search?q=` - Arama
- `GET /api/products` - Ürün listesi

### Kullanıcı
- `GET /api/auth/[...nextauth]` - Authentication
- `POST /api/comments` - Yorum oluştur

### Admin
- `GET /api/admin/articles` - Tüm içerikler
- `PUT /api/admin/articles/:id` - İçerik güncelle
- `GET /api/admin/analytics` - Analitik veriler

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── admin/             # Admin panel
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── layout/           # Layout components
│   └── sections/         # Page sections
├── lib/                  # Utility functions
├── types/                # TypeScript types
└── styles/               # Global styles

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Seed data
```

## 🚀 Deployment

### Vercel (Önerilen)

1. Projeyi Vercel'e yükleyin
2. Ortam değişkenlerini ayarlayın
3. PostgreSQL veritabanı kurun (Neon, Supabase, vb.)
4. Deploy edin

### Ortam Değişkenleri (Production)

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 📈 Performans

- **Lighthouse Score**: SEO ≥ 95, Performance ≥ 90
- **Core Web Vitals**: LCP < 2.5s, CLS < 0.1
- **Image Optimization**: Next.js Image, WebP/AVIF
- **Caching**: ISR, Edge Cache

## 🤝 Katkıda Bulunma

Bu proje özel bir projedir. Katkıda bulunmak için iletişime geçin.

## 📄 Lisans

Bu proje özel lisans altındadır.
