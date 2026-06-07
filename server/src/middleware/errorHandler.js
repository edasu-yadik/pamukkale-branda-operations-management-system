function errorHandler(err, req, res, next) {
  console.error(`[HATA] ${req.method} ${req.path}:`, err.message);

  if (err.code === '23505') {
    return res.status(409).json({ hata: 'Bu kayıt zaten mevcut (tekrar eden değer).' });
  }
  if (err.code === '23503') {
    return res.status(409).json({ hata: 'İlişkili kayıt bulunamadı veya silinemez.' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ hata: 'Geçersiz değer: izin verilen seçenekler aşıldı.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    hata: err.message || 'Sunucu hatası oluştu.',
  });
}

module.exports = errorHandler;
