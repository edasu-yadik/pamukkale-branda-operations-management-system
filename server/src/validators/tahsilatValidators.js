const { body } = require('express-validator');

const ODEME_YONTEMLERI = ['nakit', 'havale', 'kredi_karti', 'cek', 'diger'];

const tahsilatOlusturValidation = [
  body('montaj_id')
    .notEmpty().withMessage('Montaj zorunludur.')
    .isInt({ gt: 0 }).withMessage('Geçerli bir montaj seçiniz.'),
  body('tutar')
    .notEmpty().withMessage('Tutar zorunludur.')
    .isFloat({ gt: 0 }).withMessage('Tutar 0\'dan büyük olmalıdır.'),
  body('tahsilat_tarihi')
    .optional()
    .isISO8601().withMessage('Tahsilat tarihi geçerli bir tarih olmalıdır.'),
  body('odeme_yontemi')
    .optional()
    .isIn(ODEME_YONTEMLERI).withMessage(`Geçerli ödeme yöntemleri: ${ODEME_YONTEMLERI.join(', ')}`),
  body('aciklama').optional().trim(),
];

const tahsilatGuncelleValidation = [
  body('tutar').optional().isFloat({ gt: 0 }).withMessage('Tutar 0\'dan büyük olmalıdır.'),
  body('tahsilat_tarihi').optional().isISO8601(),
  body('odeme_yontemi').optional().isIn(ODEME_YONTEMLERI),
  body('aciklama').optional().trim(),
];

module.exports = { tahsilatOlusturValidation, tahsilatGuncelleValidation };
