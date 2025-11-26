# Hardware Review Site - Kurulum

## Gereksinimler
- **Node.js**: 18+
- **Python**: 3.8+
- **PostgreSQL**: 14+

## Kurulum

### 1. Bağımlılıkları Yükleyin
```bash
# Frontend
npm install

# Backend
cd backend
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Çalıştırma

### Terminal 1 - Backend
```bash
cd backend
venv\Scripts\Activate.ps1
python manage.py runserver
```

### Terminal 2 - Frontend
```bash
npm run dev
```

## Erişim
- **Site**: http://localhost:3001
- **Admin**: http://localhost:8000/admin
