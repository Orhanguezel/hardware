# 🚀 Deployment Rehberi

Hardware Review sitesini production ortamına deploy etmek için detaylı rehber.

## 📋 İçindekiler

- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Domain Configuration](#domain-configuration)
- [SSL Certificate](#ssl-certificate)
- [Monitoring](#monitoring)

## 🌐 Vercel Deployment (Önerilen)

### 1. Vercel CLI ile Deployment

```bash
# Vercel CLI yükleyin
npm i -g vercel

# Proje dizininde
vercel

# Production'a deploy
vercel --prod
```

### 2. Vercel Dashboard ile Deployment

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. "New Project" tıklayın
3. GitHub repository'nizi import edin
4. Build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3. Environment Variables (Vercel)

Vercel Dashboard > Project > Settings > Environment Variables:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Opsiyonel)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@your-domain.com
```

### 4. PostgreSQL Database (Vercel)

#### Neon Database (Önerilen)
1. [Neon](https://neon.tech/) hesabı oluşturun
2. Yeni database oluşturun
3. Connection string'i Vercel'e ekleyin

#### Supabase
1. [Supabase](https://supabase.com/) hesabı oluşturun
2. Yeni proje oluşturun
3. Settings > Database > Connection string

#### PlanetScale
1. [PlanetScale](https://planetscale.com/) hesabı oluşturun
2. Yeni database oluşturun
3. Connection string'i alın

### 5. Custom Domain (Vercel)

1. Vercel Dashboard > Project > Settings > Domains
2. "Add Domain" tıklayın
3. Domain'inizi ekleyin
4. DNS ayarlarını yapın:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

## 🐳 Docker Deployment

### 1. Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/hardware_review
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=hardware_review
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 3. Build ve Run

```bash
# Build
docker build -t hardware-review .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  hardware-review

# Docker Compose
docker-compose up -d
```

## 🔧 Manual Deployment

### 1. Server Gereksinimleri

- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: 2GB minimum, 4GB önerilen
- **CPU**: 1 core minimum, 2 core önerilen
- **Disk**: 20GB minimum
- **Node.js**: v18+ LTS

### 2. Server Kurulumu

```bash
# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu
sudo npm install -g pm2

# Nginx kurulumu
sudo apt update
sudo apt install nginx

# Git kurulumu
sudo apt install git
```

### 3. Uygulama Kurulumu

```bash
# Repository'yi klonlayın
git clone https://github.com/your-username/hardware-review-site.git
cd hardware-review-site

# Bağımlılıkları yükleyin
npm install

# Environment dosyasını oluşturun
cp env.example .env.production

# Build oluşturun
npm run build

# PM2 ile başlatın
pm2 start npm --name "hardware-review" -- start
pm2 save
pm2 startup
```

### 4. Nginx Konfigürasyonu

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static/ {
        alias /path/to/your/app/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Image optimization
    location /api/image {
        proxy_pass http://localhost:3000;
    }
}
```

## 🔐 Environment Variables

### Production Environment

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-super-secure-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# Storage (Opsiyonel)
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="your-bucket-name"
R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"

# Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
PLAUSIBLE_DOMAIN="your-domain.com"

# reCAPTCHA
RECAPTCHA_SECRET_KEY="your-recaptcha-secret"
RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
```

### Güvenli Secret Oluşturma

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online
https://generate-secret.vercel.app/32
```

## 🗄️ Database Setup

### 1. PostgreSQL Kurulumu

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Database Oluşturma

```bash
# PostgreSQL'e bağlanın
sudo -u postgres psql

# Database ve kullanıcı oluşturun
CREATE DATABASE hardware_review;
CREATE USER hardware_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE hardware_review TO hardware_user;
\q
```

### 3. Migration

```bash
# Production'da migration çalıştırın
NODE_ENV=production npm run db:push

# Seed data (opsiyonel)
NODE_ENV=production npm run db:seed
```

## 🌍 Domain Configuration

### 1. DNS Ayarları

#### A Record (Root Domain)
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600
```

#### CNAME (Subdomain)
```
Type: CNAME
Name: www
Value: your-domain.com
TTL: 3600
```

### 2. Subdomain Ayarları

```bash
# Admin subdomain
Type: A
Name: admin
Value: YOUR_SERVER_IP

# API subdomain
Type: A
Name: api
Value: YOUR_SERVER_IP
```

## 🔒 SSL Certificate

### 1. Let's Encrypt (Certbot)

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası oluşturma
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Otomatik yenileme
sudo crontab -e
# Ekleyin: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Nginx SSL Konfigürasyonu

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL optimizasyonları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP'den HTTPS'e yönlendirme
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Monitoring

### 1. PM2 Monitoring

```bash
# PM2 durumunu kontrol edin
pm2 status

# Logları görüntüleyin
pm2 logs hardware-review

# Monitoring dashboard
pm2 monit
```

### 2. Nginx Monitoring

```bash
# Nginx durumu
sudo systemctl status nginx

# Nginx logları
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Database Monitoring

```bash
# PostgreSQL durumu
sudo systemctl status postgresql

# Database bağlantıları
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### 4. Uptime Monitoring

#### UptimeRobot
1. [UptimeRobot](https://uptimerobot.com/) hesabı oluşturun
2. Yeni monitor ekleyin
3. URL: `https://your-domain.com`
4. Monitoring interval: 5 dakika

#### Pingdom
1. [Pingdom](https://www.pingdom.com/) hesabı oluşturun
2. Yeni check ekleyin
3. URL ve monitoring ayarlarını yapın

## 🔄 Backup Strategy

### 1. Database Backup

```bash
# Günlük backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U hardware_user hardware_review > /backup/hardware_review_$DATE.sql

# Eski backup'ları sil (7 günden eski)
find /backup -name "hardware_review_*.sql" -mtime +7 -delete
```

### 2. File Backup

```bash
# Upload dosyalarını backup'la
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /path/to/uploads

# Eski backup'ları sil
find /backup -name "uploads_*.tar.gz" -mtime +30 -delete
```

### 3. Automated Backup

```bash
# Crontab'a ekleyin
0 2 * * * /path/to/backup-script.sh
```

## 🚨 Troubleshooting

### Yaygın Sorunlar

#### 1. Build Hatası
```bash
# Node modules'ı temizleyin
rm -rf node_modules package-lock.json
npm install

# Cache'i temizleyin
npm run build -- --no-cache
```

#### 2. Database Bağlantı Hatası
```bash
# PostgreSQL servisini kontrol edin
sudo systemctl status postgresql

# Bağlantıyı test edin
psql -h localhost -U hardware_user -d hardware_review
```

#### 3. Nginx 502 Hatası
```bash
# Uygulamanın çalıştığını kontrol edin
pm2 status

# Port'un dinlendiğini kontrol edin
netstat -tlnp | grep :3000
```

#### 4. SSL Sertifika Hatası
```bash
# Sertifikayı yenileyin
sudo certbot renew

# Nginx'i yeniden başlatın
sudo systemctl reload nginx
```

## 📞 Destek

### Geliştirici Kaynakları
- **Vercel Docs**: https://vercel.com/docs
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

### Topluluk
- **GitHub Issues**: Proje repository'sinde issue açın
- **Discord**: Geliştirici topluluğu
- **Stack Overflow**: `hardware-review` tag'i ile soru sorun

---

**Son Güncelleme**: 2024-01-20  
**Versiyon**: 1.0.0

🎉 **Başarılı deployment için teşekkürler!**