const { body } = require('express-validator');

const MONTAJ_DURUMLARI = ['beklemede', 'planlandi', 'tamamlandi', 'iptal'];
const ODEME_DURUMLARI  = ['beklemede', 'kismi', 'tamamlandi'];

const montajOlusturValidation = [
  body('musteri_id')
    .notEmpty().withMessage('Müşteri zorunludur.')
    .isInt({ gt: 0 }).withMessage('Geçerli bir müşteri seçiniz.'),
  body('fis_no')
    .trim()
    .notEmpty().withMessage('Fiş no zorunludur.')
    .isLength({ max: 50 }),
  body('fatura_no').optional().trim().isLength({ max: 50 }),
  body('siparis_tarihi')
    .optional()
    .isISO8601().withMessage('Sipariş tarihi geçerli bir tarih olmalıdır (YYYY-MM-DD).'),
  body('montaj_tarihi')
    .optional({ nullable: true })
    .isISO8601().withMessage('Montaj tarihi geçerli bir tarih olmalıdır (YYYY-MM-DD).'),
  body('toplam_tutar')
    .notEmpty().withMessage('Toplam tutar zorunludur.')
    .isFloat({ min: 0 }).withMessage('Toplam tutar 0 veya daha büyük olmalıdır.'),
  body('montaj_durumu')
    .optional()
    .isIn(MONTAJ_DURUMLARI).withMessage(`Geçerli montaj durumları: ${MONTAJ_DURUMLARI.join(', ')}`),
  body('aciklama').optional().trim(),
];

const montajGuncelleValidation = [
  body('fatura_no').optional().trim().isLength({ max: 50 }),
  body('siparis_tarihi').optional().isISO8601(),
  body('montaj_tarihi').optional({ nullable: true }).isISO8601(),
  body('toplam_tutar').optional().isFloat({ min: 0 }),
  body('montaj_durumu').optional().isIn(MONTAJ_DURUMLARI),
  body('odeme_durumu').optional().isIn(ODEME_DURUMLARI),
  body('aciklama').optional().trim(),
];

module.exports = { montajOlusturValidation, montajGuncelleValidation };
