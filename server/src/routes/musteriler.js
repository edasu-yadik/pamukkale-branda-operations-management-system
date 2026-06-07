const router = require('express').Router();
const ctrl = require('../controllers/musteriController');
const validate = require('../middleware/validate');
const { musteriOlusturValidation, musteriGuncelleValidation } = require('../validators/musteriValidators');

router.get('/',    ctrl.tumMusteriler);
router.get('/:id', ctrl.musteriGetir);
router.get('/:id/montajlar', ctrl.musteriMontajlari);
router.post('/',   musteriOlusturValidation, validate, ctrl.musteriOlustur);
router.put('/:id', musteriGuncelleValidation, validate, ctrl.musteriGuncelle);
router.delete('/:id', ctrl.musteriSil);

module.exports = router;
