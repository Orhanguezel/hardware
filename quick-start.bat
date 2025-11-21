@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Hardware Review Site - Hızlı Kurulum Scripti (Windows)
REM Bu script projeyi hızlıca kurmak için gerekli adımları otomatik olarak yapar

echo.
echo 🚀 Hardware Review Site - Hızlı Kurulum
echo ========================================
echo.

REM Node.js kontrolü
echo 📋 Sistem gereksinimleri kontrol ediliyor...

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js bulunamadı. Lütfen Node.js v18+ yükleyin.
    echo    İndirme: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do set NODE_MAJOR=%%i

if %NODE_MAJOR% lss 18 (
    echo ❌ Node.js versiyonu çok eski. v18+ gerekli.
    pause
    exit /b 1
)

echo ✅ Node.js %NODE_VERSION% bulundu

REM npm kontrolü
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm bulunamadı.
    pause
    exit /b 1
)

for /f %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% bulundu

REM Bağımlılıkları yükle
echo.
echo 📦 Bağımlılıklar yükleniyor...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Hata: Bağımlılık yükleme başarısız
    pause
    exit /b 1
)

REM Environment dosyası kontrolü
echo.
echo ⚙️  Environment konfigürasyonu kontrol ediliyor...

if not exist ".env.local" (
    echo ⚠️  .env.local dosyası bulunamadı. Oluşturuluyor...
    
    REM NEXTAUTH_SECRET oluştur
    for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 0)"') do set NEXTAUTH_SECRET=%%i
    
    (
        echo # Database
        echo DATABASE_URL="file:./prisma/dev.db"
        echo.
        echo # NextAuth.js
        echo NEXTAUTH_SECRET="%NEXTAUTH_SECRET%"
        echo NEXTAUTH_URL="http://localhost:3001"
        echo.
        echo # OAuth Providers (Opsiyonel)
        echo GOOGLE_CLIENT_ID=""
        echo GOOGLE_CLIENT_SECRET=""
        echo DISCORD_CLIENT_ID=""
        echo DISCORD_CLIENT_SECRET=""
        echo.
        echo # Email Configuration (Opsiyonel)
        echo EMAIL_SERVER_HOST=""
        echo EMAIL_SERVER_PORT=""
        echo EMAIL_SERVER_USER=""
        echo EMAIL_SERVER_PASSWORD=""
        echo EMAIL_FROM=""
    ) > .env.local
    
    echo ✅ .env.local dosyası oluşturuldu
) else (
    echo ✅ .env.local dosyası mevcut
)

REM Veritabanı kurulumu
echo.
echo 🗄️  Veritabanı kuruluyor...

echo    Prisma client oluşturuluyor...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Hata: Prisma client oluşturma başarısız
    pause
    exit /b 1
)

echo    Veritabanı şeması oluşturuluyor...
call npm run db:push
if %errorlevel% neq 0 (
    echo ❌ Hata: Veritabanı şeması oluşturma başarısız
    pause
    exit /b 1
)

echo    Test verileri yükleniyor...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Hata: Test verileri yükleme başarısız
    pause
    exit /b 1
)

echo ✅ Veritabanı kurulumu tamamlandı

REM Build kontrolü
echo.
echo 🔨 Production build kontrol ediliyor...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Hata: Build başarısız
    pause
    exit /b 1
)

echo ✅ Build başarılı

REM Kurulum tamamlandı
echo.
echo 🎉 Kurulum başarıyla tamamlandı!
echo.
echo 📋 Sonraki adımlar:
echo    1. Development server'ı başlatın: npm run dev
echo    2. Tarayıcıda açın: http://localhost:3001
echo    3. Test hesapları ile giriş yapın:
echo       • Admin: admin@hardware-review.com / password123
echo       • Yazar: author@hardware-review.com / password123
echo.
echo 📚 Dokümantasyon:
echo    • Detaylı rehber: ./SETUP_GUIDE.md
echo    • README: ./README.md
echo.
echo 🚀 İyi kodlamalar!
echo.
pause
