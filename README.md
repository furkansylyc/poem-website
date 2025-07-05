# Şiir Paylaşım Platformu

Modern ve kullanıcı dostu bir şiir paylaşım platformu. React, TypeScript ve Node.js kullanılarak geliştirilmiştir.

## 🌟 Özellikler

### 📖 Şiir Yönetimi
- Şiir listesi ve detay görüntüleme
- Şiir arama fonksiyonu
- Manuel tarih girişi
- Görüntülenme sayacı

### 💬 Yorum Sistemi
- Kullanıcı yorumları
- Admin onay sistemi
- Yorum yönetimi

### 👨‍💼 Admin Paneli
- Şiir ekleme/silme
- Yorum onaylama/reddetme
- İstatistik görüntüleme
- Sayaç sıfırlama

### 📱 Responsive Tasarım
- Mobil uyumlu
- Hamburger menü
- Touch friendly

## 🛠️ Teknoloji Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Deployment
- Vercel
- MongoDB Atlas
- Custom Domain

## 🚀 Kurulum

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd poem-website
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
cd backend && npm install && cd ..
```

3. **Environment variables oluşturun**
```bash
# backend/.env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=development
PORT=5000
```

4. **Development server'ı başlatın**
```bash
# Frontend
npm run dev

# Backend
cd backend && npm start
```

## 📁 Proje Yapısı

```
poem-website/
├── src/
│   ├── components/          # React bileşenleri
│   ├── services/           # API servisleri
│   ├── types.ts            # TypeScript tipleri
│   └── App.tsx             # Ana uygulama
├── backend/
│   ├── api/               # Vercel serverless API
│   └── server.js          # Local development
├── public/                # Statik dosyalar
└── vercel.json           # Deployment config
```

## 🔧 API Endpoints

### Şiirler
- `GET /api/poems` - Tüm şiirler
- `GET /api/poems/:id` - Tek şiir
- `POST /api/poems` - Şiir ekle
- `DELETE /api/poems/:id` - Şiir sil

### Yorumlar
- `POST /api/comments` - Yorum ekle
- `GET /api/poems/:id/comments` - Şiir yorumları
- `GET /api/comments` - Tüm yorumlar
- `PUT /api/comments/:id/approve` - Yorum onayla
- `DELETE /api/comments/:id` - Yorum sil

### Admin
- `POST /api/admin/login` - Admin girişi
- `POST /api/admin/setup` - Admin kurulumu

### İstatistikler
- `GET /api/visits` - Ziyaret sayısı
- `POST /api/visits/increment` - Ziyaret artır
- `POST /api/visits/reset` - Sayaçları sıfırla

## 🚀 Deployment

### Vercel
1. Environment variables ekleyin
2. GitHub repository'yi bağlayın
3. Otomatik deployment

### Custom Domain
1. DNS ayarlarını yapın
2. Vercel'de domain ekleyin
3. SSL otomatik sağlanır

## 👤 Admin Kullanımı

1. Admin paneline giriş yapın
2. Şiir ekleyin/düzenleyin/silin
3. Yorumları yönetin
4. İstatistikleri takip edin

## 🎨 Özelleştirme

- `tailwind.config.js` - Tema renkleri
- `src/index.css` - Özel CSS
- `src/components/` - Yeni bileşenler
- `backend/api/index.js` - Yeni API'ler

## 📄 Lisans

MIT License

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir.
