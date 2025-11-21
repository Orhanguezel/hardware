# 🚀 Hardware Review Site - Kurulum ve Kullanım Rehberi

Bu rehber, Hardware Review sitesinin kurulumu, konfigürasyonu ve kullanımı hakkında detaylı bilgiler içerir.

## 📋 İçindekiler

- [Sistem Gereksinimleri](#sistem-gereksinimleri)
- [Kurulum](#kurulum)
- [Konfigürasyon](#konfigürasyon)
- [Veritabanı Kurulumu](#veritabanı-kurulumu)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Production Deployment](#production-deployment)
- [Kullanım Rehberi](#kullanım-rehberi)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Sorun Giderme](#sorun-giderme)

## 🔧 Sistem Gereksinimleri

### Minimum Gereksinimler
- **Node.js**: v18.17.0 veya üzeri
- **npm**: v9.0.0 veya üzeri
- **RAM**: 4GB (geliştirme), 8GB (production)
- **Disk**: 2GB boş alan
- **İşletim Sistemi**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### Önerilen Gereksinimler
- **Node.js**: v20.x LTS
- **RAM**: 8GB (geliştirme), 16GB (production)
- **SSD**: Hızlı veritabanı işlemleri için

## 📦 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd hardware-review-site
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Dosyasını Oluşturun
```bash
# .env.local dosyası oluşturun
cp env.example .env.local
```

### 4. Environment Değişkenlerini Düzenleyin
`.env.local` dosyasını açın ve aşağıdaki değerleri düzenleyin:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth.js (ÖNEMLİ: Güvenli bir secret kullanın)
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3001"

# OAuth Providers (Opsiyonel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Email Configuration (Opsiyonel)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@hardware-review.com"
```

## ⚙️ Konfigürasyon

### Veritabanı Konfigürasyonu

#### SQLite (Varsayılan - Geliştirme)
```env
DATABASE_URL="file:./prisma/dev.db"
```

#### PostgreSQL (Production)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hardware_review_db"
```

### NextAuth Konfigürasyonu

#### Güvenli Secret Oluşturma
```bash
# Terminal'de çalıştırın
openssl rand -base64 32
```

#### OAuth Provider Kurulumu

**Google OAuth:**
1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni proje oluşturun
3. APIs & Services > Credentials
4. OAuth 2.0 Client ID oluşturun
5. Authorized redirect URIs: `http://localhost:3001/api/auth/callback/google`

**Discord OAuth:**
1. [Discord Developer Portal](https://discord.com/developers/applications)'a gidin
2. New Application oluşturun
3. OAuth2 > General
4. Redirect URI: `http://localhost:3001/api/auth/callback/discord`

## 🗄️ Veritabanı Kurulumu

### 1. Prisma Client Oluşturun
```bash
npm run db:generate
```

### 2. Veritabanını Oluşturun
```bash
# SQLite için
npm run db:push

# Migration ile (PostgreSQL için)
npm run db:migrate
```

### 3. Test Verilerini Yükleyin
```bash
npm run db:seed
```

Bu komut aşağıdaki test verilerini oluşturur:
- **Admin Kullanıcı**: `admin@hardware-review.com` / `password123`
- **Yazar Kullanıcı**: `author@hardware-review.com` / `password123`
- **Kategoriler**: Router, Modem, Networking
- **Ürünler**: ASUS RT-AX88U Pro, TP-Link Archer AX73
- **Makaleler**: Örnek inceleme ve karşılaştırma makaleleri
- **Affiliate Linkler**: Test linkleri

## 🚀 Geliştirme Ortamı

### 1. Development Server'ı Başlatın
```bash
npm run dev
```

Site şu adreste çalışacak: `http://localhost:3001`

### 2. Mevcut Scripts

```bash
# Development
npm run dev          # Development server (port 3001)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint kontrolü

# Database
npm run db:generate  # Prisma client oluştur
npm run db:push      # Schema'yı veritabanına uygula
npm run db:migrate   # Migration çalıştır
npm run db:seed      # Test verilerini yükle
```

### 3. Geliştirme İpuçları

- **Hot Reload**: Dosya değişiklikleri otomatik olarak yansır
- **TypeScript**: Tip kontrolü aktif
- **ESLint**: Kod kalitesi kontrolü
- **Prisma Studio**: `npx prisma studio` ile veritabanını görüntüleyin

## 🌐 Production Deployment

### 1. Vercel (Önerilen)

```bash
# Vercel CLI yükleyin
npm i -g vercel

# Deploy edin
vercel

# Environment variables ayarlayın
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
```

### 2. Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build ve run
docker build -t hardware-review .
docker run -p 3000:3000 hardware-review
```

### 3. Manual Deployment

```bash
# Build oluşturun
npm run build

# Production server başlatın
npm start
```

## 📖 Kullanım Rehberi

### Admin Paneli

#### Giriş
1. `http://localhost:3001/auth/signin` adresine gidin
2. Test hesabı ile giriş yapın:
   - **Admin**: `admin@hardware-review.com` / `password123`
   - **Yazar**: `author@hardware-review.com` / `password123`

#### Admin Özellikleri
- **Makale Yönetimi**: `/admin/articles`
- **Ürün Yönetimi**: `/admin/products`
- **Yorum Yönetimi**: `/admin/comments`
- **Analitik**: `/admin/analytics`
- **Link Doğrulama**: `/admin/links`

### Makale Oluşturma

#### 1. Yeni Makale
```bash
# Admin paneli > Articles > New Article
# veya
# /admin/articles/new
```

#### 2. Makale Türleri
- **REVIEW**: Ürün incelemeleri
- **COMPARE**: Ürün karşılaştırmaları
- **GUIDE**: Nasıl yapılır rehberleri
- **BEST_LIST**: En iyi ürün listeleri
- **NEWS**: Teknoloji haberleri

#### 3. Makale Yapısı
```typescript
interface Article {
  title: string           // Makale başlığı
  subtitle?: string       // Alt başlık
  excerpt?: string        // Özet
  content: string         // JSON formatında içerik
  type: ArticleType       // Makale türü
  categoryId?: string     // Kategori ID
  status: ArticleStatus   // Durum (DRAFT/PUBLISHED)
  metaTitle?: string      // SEO başlığı
  metaDescription?: string // SEO açıklaması
}
```

### Ürün Yönetimi

#### 1. Ürün Ekleme
```bash
# API ile
POST /api/products
{
  "brand": "ASUS",
  "model": "RT-AX88U Pro",
  "specs": {
    "wifiStandard": "Wi-Fi 6E",
    "bands": ["2.4GHz", "5GHz", "6GHz"],
    "maxSpeed": "6000 Mbps"
  },
  "releaseYear": 2023
}
```

#### 2. Affiliate Link Ekleme
```bash
# Admin paneli > Products > Add Affiliate Link
# veya API ile
POST /api/products/{productId}/affiliate-links
{
  "merchant": "Amazon",
  "urlTemplate": "https://amazon.com/product/{productId}"
}
```

### SEO Optimizasyonu

#### 1. Meta Tags
- Her makale için `metaTitle` ve `metaDescription` ekleyin
- Open Graph ve Twitter Card meta'ları otomatik oluşturulur

#### 2. Sitemap
- Otomatik sitemap: `/sitemap.xml`
- Robots.txt: `/robots.txt`

#### 3. URL Yapısı
```
/reviews/[slug]          # İnceleme makaleleri
/compare/[slug]          # Karşılaştırma makaleleri
/guides/[slug]           # Rehber makaleleri
/best/[slug]             # En iyi listeler
/news/[slug]             # Haber makaleleri
/category/[slug]         # Kategori sayfaları
/products/[slug]         # Ürün sayfaları
```

## 🔌 API Dokümantasyonu

### Authentication Endpoints

```bash
# Giriş
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "password"
}

# Çıkış
POST /api/auth/signout

# Session
GET /api/auth/session
```

### Articles API

```bash
# Makaleleri listele
GET /api/reviews?page=1&limit=10&category=router&type=REVIEW

# Makale oluştur
POST /api/reviews
{
  "title": "Makale Başlığı",
  "content": "Makale içeriği",
  "type": "REVIEW",
  "categoryId": "category-id"
}

# Makale detayı
GET /api/reviews/[id]
```

### Products API

```bash
# Ürünleri listele
GET /api/products?page=1&limit=10&brand=ASUS

# Ürün oluştur
POST /api/products
{
  "brand": "ASUS",
  "model": "RT-AX88U Pro",
  "specs": {...}
}

# Ürün detayı
GET /api/products/[id]
```

### Search API

```bash
# Arama
GET /api/search?q=wifi6&type=REVIEW&category=router
```

### Outbound Tracking

```bash
# Tıklama takibi
POST /api/outbound
{
  "productId": "product-id",
  "merchant": "Amazon",
  "articleId": "article-id",
  "userId": "user-id" // Opsiyonel
}
```

## 🔍 Sorun Giderme

### Yaygın Sorunlar

#### 1. Veritabanı Bağlantı Hatası
```bash
# SQLite dosyasının var olduğundan emin olun
ls -la prisma/dev.db

# Prisma client'ı yeniden oluşturun
npm run db:generate
npm run db:push
```

#### 2. NextAuth Hatası
```bash
# NEXTAUTH_SECRET'in ayarlandığından emin olun
echo $NEXTAUTH_SECRET

# Environment dosyasını kontrol edin
cat .env.local | grep NEXTAUTH
```

#### 3. Build Hatası
```bash
# Node modules'ı temizleyin
rm -rf node_modules package-lock.json
npm install

# TypeScript hatalarını kontrol edin
npm run build
```

#### 4. Port Çakışması
```bash
# Port 3001 kullanımda mı kontrol edin
netstat -ano | findstr :3001

# Farklı port kullanın
npm run dev -- --port 3002
```

### Log Kontrolü

```bash
# Development logs
npm run dev

# Production logs (Vercel)
vercel logs

# Database logs
npx prisma studio
```

### Performans Optimizasyonu

#### 1. Image Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  }
}
```

#### 2. Database Indexing
```sql
-- Prisma schema'ya ekleyin
model Article {
  @@index([status, publishedAt])
  @@index([categoryId, status])
}
```

#### 3. Caching
```typescript
// API routes'da caching ekleyin
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
```

## 📞 Destek

### Geliştirici Kaynakları
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org
- **Tailwind CSS**: https://tailwindcss.com/docs

### Topluluk
- **GitHub Issues**: Proje repository'sinde issue açın
- **Discord**: Geliştirici topluluğu
- **Stack Overflow**: `hardware-review` tag'i ile soru sorun

### Lisans
Bu proje MIT lisansı altında lisanslanmıştır.

---

**Son Güncelleme**: 2024-01-20  
**Versiyon**: 1.0.0  
**Geliştirici**: Hardware Review Team

🎉 **Başarılı kurulum için teşekkürler!** Site artık kullanıma hazır.
