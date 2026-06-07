const router = require('express').Router();
const { genelOzet } = require('../controllers/ozetController');

router.get('/', genelOzet);

module.exports = router;
