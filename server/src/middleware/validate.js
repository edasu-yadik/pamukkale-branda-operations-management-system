const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const hatalar = validationResult(req);
  if (!hatalar.isEmpty()) {
    return res.status(400).json({
      hata: 'Doğrulama hatası',
      detaylar: hatalar.array().map((h) => ({ alan: h.path, mesaj: h.msg })),
    });
  }
  next();
}

module.exports = validate;
