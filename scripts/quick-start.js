#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

// Renk kodları
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Log fonksiyonları
const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`)
};

// Hata kontrolü
function checkError(error, message) {
  if (error) {
    log.error(`❌ Hata: ${message}`);
    process.exit(1);
  }
}

// Komut çalıştırma
function runCommand(command, description) {
  try {
    log.info(`📋 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    log.success(`✅ ${description} tamamlandı`);
  } catch (error) {
    checkError(true, `${description} başarısız`);
  }
}

// Ana kurulum fonksiyonu
async function quickStart() {
  console.log('\n🚀 Hardware Review Site - Hızlı Kurulum');
  console.log('========================================\n');

  // Node.js versiyon kontrolü
  log.info('📋 Sistem gereksinimleri kontrol ediliyor...');
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      log.error('❌ Node.js versiyonu çok eski. v18+ gerekli.');
      process.exit(1);
    }
    
    log.success(`✅ Node.js ${nodeVersion} bulundu`);
  } catch (error) {
    log.error('❌ Node.js bulunamadı. Lütfen Node.js v18+ yükleyin.');
    process.exit(1);
  }

  // npm versiyon kontrolü
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log.success(`✅ npm ${npmVersion} bulundu`);
  } catch (error) {
    log.error('❌ npm bulunamadı.');
    process.exit(1);
  }

  // Bağımlılıkları yükle
  runCommand('npm install', 'Bağımlılıklar yükleniyor');

  // Environment dosyası kontrolü
  log.info('⚙️  Environment konfigürasyonu kontrol ediliyor...');
  
  if (!fs.existsSync('.env.local')) {
    log.warning('⚠️  .env.local dosyası bulunamadı. Oluşturuluyor...');
    
    // NEXTAUTH_SECRET oluştur
    const nextAuthSecret = crypto.randomBytes(32).toString('base64');
    
    const envContent = `# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth.js
NEXTAUTH_SECRET="${nextAuthSecret}"
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
`;

    fs.writeFileSync('.env.local', envContent);
    log.success('✅ .env.local dosyası oluşturuldu');
  } else {
    log.success('✅ .env.local dosyası mevcut');
  }

  // Veritabanı kurulumu
  log.info('🗄️  Veritabanı kuruluyor...');
  
  runCommand('npm run db:generate', 'Prisma client oluşturuluyor');
  runCommand('npm run db:push', 'Veritabanı şeması oluşturuluyor');
  runCommand('npm run db:seed', 'Test verileri yükleniyor');

  // Build kontrolü
  runCommand('npm run build', 'Production build kontrol ediliyor');

  // Kurulum tamamlandı
  console.log('\n🎉 Kurulum başarıyla tamamlandı!\n');
  
  console.log('📋 Sonraki adımlar:');
  console.log('   1. Development server\'ı başlatın: npm run dev');
  console.log('   2. Tarayıcıda açın: http://localhost:3001');
  console.log('   3. Test hesapları ile giriş yapın:');
  console.log('      • Admin: admin@hardware-review.com / password123');
  console.log('      • Yazar: author@hardware-review.com / password123');
  
  console.log('\n📚 Dokümantasyon:');
  console.log('   • Detaylı rehber: ./SETUP_GUIDE.md');
  console.log('   • README: ./README.md');
  
  console.log('\n🚀 İyi kodlamalar!\n');
}

// Script'i çalıştır
quickStart().catch((error) => {
  log.error(`❌ Beklenmeyen hata: ${error.message}`);
  process.exit(1);
});
