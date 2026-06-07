const { body } = require('express-validator');

const musteriOlusturValidation = [
  body('ad_soyad')
    .trim()
    .notEmpty().withMessage('Ad soyad zorunludur.')
    .isLength({ max: 150 }).withMessage('Ad soyad en fazla 150 karakter olabilir.'),
  body('telefon')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Telefon en fazla 20 karakter olabilir.'),
  body('adres').optional().trim(),
  body('notlar').optional().trim(),
];

const musteriGuncelleValidation = [
  body('ad_soyad')
    .optional()
    .trim()
    .notEmpty().withMessage('Ad soyad boş olamaz.')
    .isLength({ max: 150 }).withMessage('Ad soyad en fazla 150 karakter olabilir.'),
  body('telefon').optional().trim().isLength({ max: 20 }),
  body('adres').optional().trim(),
  body('notlar').optional().trim(),
];

module.exports = { musteriOlusturValidation, musteriGuncelleValidation };
