require('dotenv').config();
const express = require('express');
const cors = require('cors');

const musteriRoutes = require('./routes/musteriler');
const montajRoutes = require('./routes/montajlar');
const tahsilatRoutes = require('./routes/tahsilatlar');
const ozimRoutes = require('./routes/ozet');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ durum: 'Sunucu çalışıyor', zaman: new Date().toISOString() });
});

app.use('/api/musteriler', musteriRoutes);
app.use('/api/montajlar', montajRoutes);
app.use('/api/tahsilatlar', tahsilatRoutes);
app.use('/api/ozet', ozimRoutes);

app.use((req, res) => {
  res.status(404).json({ hata: 'Endpoint bulunamadı' });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} kullanımda. Farklı bir PORT ayarlayın (.env dosyasından).`);
  } else {
    console.error('Sunucu hatası:', err.message);
  }
  process.exit(1);
});
