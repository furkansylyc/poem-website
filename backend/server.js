require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// API routes'ları import et
const apiRoutes = require('./api');

// Debug: Environment variables'ı kontrol et
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://senolsoyleyici.com.tr', 'https://senolsoyleyici.com.tr/'] 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB bağlantısı başarılı');
}).catch((err) => {
  console.error('MongoDB bağlantı hatası:', err);
});

// Şiir Modeli
const poemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Poem = mongoose.model('Poem', poemSchema);

// Admin Modeli
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware - JWT doğrulama
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token gerekli' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Geçersiz token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Tüm şiirleri getir
app.get('/api/poems', async (req, res) => {
  try {
    const poems = await Poem.find().sort({ date: -1 });
    res.json(poems);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek şiir getir
app.get('/api/poems/:id', async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Şiir bulunamadı' });
    }
    res.json(poem);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Admin girişi
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Admin kullanıcısını kontrol et
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Şifreyi kontrol et
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, message: 'Giriş başarılı' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şiir ekle (Admin gerekli)
app.post('/api/poems', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Başlık ve içerik gerekli' });
    }

    const poem = new Poem({
      title,
      content,
      date: new Date()
    });

    const savedPoem = await poem.save();
    res.status(201).json(savedPoem);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şiir sil (Admin gerekli)
app.delete('/api/poems/:id', authenticateToken, async (req, res) => {
  try {
    const poem = await Poem.findByIdAndDelete(req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Şiir bulunamadı' });
    }
    res.json({ message: 'Şiir silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// İlk admin kullanıcısını oluştur (sadece bir kez çalıştırın)
app.post('/api/admin/setup', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Admin zaten mevcut' });
    }

    const hashedPassword = await bcrypt.hash('senol1970', 10);
    const admin = new Admin({
      username: 'senolsylyc',
      password: hashedPassword
    });

    await admin.save();
    res.json({ message: 'Admin kullanıcısı oluşturuldu' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// API routes'ları kullan
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API çalışıyor' });
});

// Vercel serverless function export
module.exports = app;

// Local development için
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
  });
} 