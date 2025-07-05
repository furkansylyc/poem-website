require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Debug: Environment variables'ı kontrol et
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

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

// Yorum Modeli
const commentSchema = new mongoose.Schema({
  poemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poem', required: true },
  name: { type: String, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false }
});

const Comment = mongoose.model('Comment', commentSchema);

// Ziyaret Sayacı Modeli
const visitSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const Visit = mongoose.model('Visit', visitSchema);

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
    console.error('Poems fetch error:', error);
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
    console.error('Poem fetch error:', error);
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
    console.error('Login error:', error);
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
    console.error('Add poem error:', error);
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
    console.error('Delete poem error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorum ekle
app.post('/api/comments', async (req, res) => {
  try {
    const { poemId, name, comment } = req.body;
    
    if (!poemId || !name || !comment) {
      return res.status(400).json({ message: 'Şiir ID, ad ve yorum gerekli' });
    }

    // Şiirin var olduğunu kontrol et
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: 'Şiir bulunamadı' });
    }

    const newComment = new Comment({
      poemId,
      name,
      comment,
      approved: false
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şiir için onaylanmış yorumları getir
app.get('/api/poems/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      poemId: req.params.id, 
      approved: true 
    }).sort({ date: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tüm yorumları getir (Admin için)
app.get('/api/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('poemId', 'title')
      .sort({ date: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Get all comments error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorum onayla/reddet (Admin için)
app.put('/api/comments/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { approved } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    res.json(comment);
  } catch (error) {
    console.error('Approve comment error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorum sil (Admin için)
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    res.json({ message: 'Yorum silindi' });
  } catch (error) {
    console.error('Delete comment error:', error);
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
    console.error('Setup admin error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ziyaret sayısını getir
app.get('/api/visits', async (req, res) => {
  try {
    let visit = await Visit.findOne();
    if (!visit) {
      visit = new Visit({ count: 0 });
      await visit.save();
    }
    res.json({ count: visit.count });
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ziyaret sayısını artır
app.post('/api/visits/increment', async (req, res) => {
  try {
    let visit = await Visit.findOne();
    if (!visit) {
      visit = new Visit({ count: 1 });
    } else {
      visit.count += 1;
      visit.lastUpdated = new Date();
    }
    await visit.save();
    res.json({ count: visit.count });
  } catch (error) {
    console.error('Increment visits error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ziyaret sayısını sıfırla (Admin için)
app.post('/api/visits/reset', authenticateToken, async (req, res) => {
  try {
    let visit = await Visit.findOne();
    if (!visit) {
      visit = new Visit({ count: 0 });
    } else {
      visit.count = 0;
      visit.lastUpdated = new Date();
    }
    await visit.save();
    res.json({ count: visit.count, message: 'Ziyaret sayacı sıfırlandı' });
  } catch (error) {
    console.error('Reset visits error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API çalışıyor' });
});

// Vercel serverless function export
module.exports = app; 