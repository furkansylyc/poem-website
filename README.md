# Şenol Söyleyici Şiirler

Modern ve dinamik şiir paylaşım platformu.

## Özellikler

- 📝 Şiir listesi ve görüntüleme
- 🔍 Şiir arama
- 👤 Admin paneli (şiir ekleme/silme)
- 🔐 Güvenli admin girişi
- 📱 Responsive tasarım
- ⚡ Hızlı ve modern UI

## Teknolojiler

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt

## Kurulum

### 1. Frontend Kurulumu

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

### 2. Backend Kurulumu

```bash
# Backend klasörüne git
cd backend

# Bağımlılıkları yükle
npm install

# Environment variables ayarla
cp env.example .env
# .env dosyasını düzenle

# Sunucuyu başlat
npm run dev
```

### 3. MongoDB Kurulumu

1. [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı oluşturun
2. Yeni cluster oluşturun
3. Database connection string'i alın
4. `.env` dosyasına ekleyin

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/siirler
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

## Admin Kurulumu

Backend çalıştıktan sonra admin kullanıcısını oluşturun:

```bash
curl -X POST http://localhost:5000/api/admin/setup
```

**Admin Bilgileri:**
- Kullanıcı adı: `senolsylyc`
- Şifre: `senol1970`

## Deployment

### Vercel (Önerilen)

1. GitHub'a projeyi yükleyin
2. [Vercel](https://vercel.com) hesabı oluşturun
3. GitHub reponuzu import edin
4. Environment variables'ları ayarlayın
5. Deploy edin

### Backend Deployment

Backend için ayrı bir servis kullanın:
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Heroku](https://heroku.com)

## API Endpoints

### Public
- `GET /api/poems` - Tüm şiirleri getir
- `GET /api/poems/:id` - Tek şiir getir

### Admin (JWT gerekli)
- `POST /api/admin/login` - Admin girişi
- `POST /api/poems` - Şiir ekle
- `DELETE /api/poems/:id` - Şiir sil
- `POST /api/admin/setup` - Admin kurulumu

## Lisans

MIT License 