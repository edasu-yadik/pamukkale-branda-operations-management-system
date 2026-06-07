const router = require('express').Router();
const ctrl = require('../controllers/tahsilatController');
const validate = require('../middleware/validate');
const { tahsilatOlusturValidation, tahsilatGuncelleValidation } = require('../validators/tahsilatValidators');

router.get('/',    ctrl.tumTahsilatlar);
router.get('/:id', ctrl.tahsilatGetir);
router.post('/',   tahsilatOlusturValidation, validate, ctrl.tahsilatOlustur);
router.put('/:id', tahsilatGuncelleValidation, validate, ctrl.tahsilatGuncelle);
router.delete('/:id', ctrl.tahsilatSil);

module.exports = router;
