#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 Mevcut admin kullanıcısı kontrol ediliyor...');
    
    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: 'admin@hardware-review.com'
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin kullanıcısı zaten mevcut');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 İsim: ${existingAdmin.name}`);
      console.log(`🔑 Rol: ${existingAdmin.role}`);
      
      // Şifreyi güncelle
      console.log('🔄 Şifre güncelleniyor...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      await prisma.user.update({
        where: {
          email: 'admin@hardware-review.com'
        },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      });
      
      console.log('✅ Admin şifresi güncellendi: password123');
    } else {
      console.log('👤 Yeni admin kullanıcısı oluşturuluyor...');
      
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@hardware-review.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      });
      
      console.log('✅ Admin kullanıcısı oluşturuldu');
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`👤 İsim: ${adminUser.name}`);
      console.log(`🔑 Rol: ${adminUser.role}`);
      console.log('🔐 Şifre: password123');
    }

    // Test kullanıcısı da oluştur
    console.log('\n👤 Test kullanıcısı kontrol ediliyor...');
    
    const existingAuthor = await prisma.user.findUnique({
      where: {
        email: 'author@hardware-review.com'
      }
    });

    if (!existingAuthor) {
      const authorPassword = await bcrypt.hash('password123', 12);
      
      await prisma.user.create({
        data: {
          email: 'author@hardware-review.com',
          name: 'Test Author',
          password: authorPassword,
          role: 'AUTHOR',
          emailVerified: new Date()
        }
      });
      
      console.log('✅ Test yazar kullanıcısı oluşturuldu');
      console.log('📧 Email: author@hardware-review.com');
      console.log('🔐 Şifre: password123');
    }

    console.log('\n🎉 Kurulum tamamlandı!');
    console.log('\n📋 Giriş bilgileri:');
    console.log('   Admin: admin@hardware-review.com / password123');
    console.log('   Yazar: author@hardware-review.com / password123');
    console.log('\n🌐 Admin paneli: http://localhost:3001/admin');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
