# ⚡ Hızlı Başlangıç

Hardware Review sitesini en hızlı şekilde çalıştırmak için bu rehberi takip edin.

## 🚀 1 Dakikada Kurulum

### Windows
```bash
# Batch dosyasını çalıştırın
quick-start.bat
```

### Linux/Mac
```bash
# Shell script'ini çalıştırın
./quick-start.sh
```

### Node.js
```bash
# npm script'ini çalıştırın
npm run quick-start
```

## 📋 Manuel Kurulum (5 Dakika)

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Environment Dosyasını Oluşturun
```bash
cp env.example .env.local
```

### 3. Veritabanını Kurun
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Development Server'ı Başlatın
```bash
npm run dev
```

### 5. Tarayıcıda Açın
```
http://localhost:3001
```

## 👤 Test Hesapları

| Rol | Email | Şifre |
|-----|-------|-------|
| Admin | admin@hardware-review.com | password123 |
| Yazar | author@hardware-review.com | password123 |

## 📚 Detaylı Dokümantasyon

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: Kapsamlı kurulum rehberi
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Production deployment rehberi
- **[README.md](./README.md)**: Proje genel bakış

## 🔧 Faydalı Komutlar

```bash
# Development
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server

# Database
npm run db:studio    # Prisma Studio
npm run db:reset     # Database'i sıfırla
npm run setup        # Tam kurulum

# Utilities
npm run lint         # Code linting
npm run quick-start  # Otomatik kurulum
```

## 🆘 Sorun Giderme

### Veritabanı Hatası
```bash
npm run db:push
```

### Build Hatası
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Çakışması
```bash
npm run dev -- --port 3002
```

## 🎯 Sonraki Adımlar

1. **Admin Paneline Giriş**: `/admin`
2. **İlk Makale Oluştur**: `/admin/articles/new`
3. **Ürün Ekle**: `/admin/products`
4. **SEO Ayarları**: Meta tag'leri düzenle

---

**Hızlı başlangıç için teşekkürler!** 🎉
