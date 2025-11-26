#!/bin/bash

# Hardware Review Site - Hızlı Kurulum Scripti
# Bu script projeyi hızlıca kurmak için gerekli adımları otomatik olarak yapar

echo "🚀 Hardware Review Site - Hızlı Kurulum"
echo "========================================"

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata kontrolü fonksiyonu
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Hata: $1${NC}"
        exit 1
    fi
}

# Node.js kontrolü
echo -e "${BLUE}📋 Sistem gereksinimleri kontrol ediliyor...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı. Lütfen Node.js v18+ yükleyin.${NC}"
    echo "   İndirme: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versiyonu çok eski. v18+ gerekli.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) bulundu${NC}"

# npm kontrolü
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm bulunamadı.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) bulundu${NC}"

# Bağımlılıkları yükle
echo -e "${BLUE}📦 Bağımlılıklar yükleniyor...${NC}"
npm install
check_error "Bağımlılık yükleme başarısız"

# Environment dosyası kontrolü
echo -e "${BLUE}⚙️  Environment konfigürasyonu kontrol ediliyor...${NC}"

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local dosyası bulunamadı. Oluşturuluyor...${NC}"
    
    # NEXTAUTH_SECRET oluştur
    if command -v openssl &> /dev/null; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
    else
        NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    fi
    
    cat > .env.local << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth.js
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="http://localhost:3001"

# OAuth Providers (Opsiyonel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# Email Configuration (Opsiyonel)
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""
EOF
    
    echo -e "${GREEN}✅ .env.local dosyası oluşturuldu${NC}"
else
    echo -e "${GREEN}✅ .env.local dosyası mevcut${NC}"
fi

# Veritabanı kurulumu
echo -e "${BLUE}🗄️  Veritabanı kuruluyor...${NC}"

echo "   Prisma client oluşturuluyor..."
npm run db:generate
check_error "Prisma client oluşturma başarısız"

echo "   Veritabanı şeması oluşturuluyor..."
npm run db:push
check_error "Veritabanı şeması oluşturma başarısız"

echo "   Test verileri yükleniyor..."
npm run db:seed
check_error "Test verileri yükleme başarısız"

echo -e "${GREEN}✅ Veritabanı kurulumu tamamlandı${NC}"

# Build kontrolü
echo -e "${BLUE}🔨 Production build kontrol ediliyor...${NC}"
npm run build
check_error "Build başarısız"

echo -e "${GREEN}✅ Build başarılı${NC}"

# Kurulum tamamlandı
echo ""
echo -e "${GREEN}🎉 Kurulum başarıyla tamamlandı!${NC}"
echo ""
echo -e "${BLUE}📋 Sonraki adımlar:${NC}"
echo -e "   ${YELLOW}1.${NC} Development server'ı başlatın: ${GREEN}npm run dev${NC}"
echo -e "   ${YELLOW}2.${NC} Tarayıcıda açın: ${GREEN}http://localhost:3001${NC}"
echo -e "   ${YELLOW}3.${NC} Test hesapları ile giriş yapın:"
echo -e "      ${YELLOW}•${NC} Admin: ${GREEN}admin@hardware-review.com${NC} / ${GREEN}password123${NC}"
echo -e "      ${YELLOW}•${NC} Yazar: ${GREEN}author@hardware-review.com${NC} / ${GREEN}password123${NC}"
echo ""
echo -e "${BLUE}📚 Dokümantasyon:${NC}"
echo -e "   ${YELLOW}•${NC} Detaylı rehber: ${GREEN}./SETUP_GUIDE.md${NC}"
echo -e "   ${YELLOW}•${NC} README: ${GREEN}./README.md${NC}"
echo ""
echo -e "${GREEN}🚀 İyi kodlamalar!${NC}"
