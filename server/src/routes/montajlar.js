const router = require('express').Router();
const ctrl = require('../controllers/montajController');
const validate = require('../middleware/validate');
const { montajOlusturValidation, montajGuncelleValidation } = require('../validators/montajValidators');

router.get('/',    ctrl.tumMontajlar);
router.get('/:id', ctrl.montajGetir);
router.get('/:id/tahsilatlar', ctrl.montajTahsilatlari);
router.post('/',   montajOlusturValidation, validate, ctrl.montajOlustur);
router.put('/:id', montajGuncelleValidation, validate, ctrl.montajGuncelle);
router.delete('/:id', ctrl.montajSil);

module.exports = router;
