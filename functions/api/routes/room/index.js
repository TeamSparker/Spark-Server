const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('', require('./roomPOST'));
router.get('/code/:code', checkUser, require('./roomCodeGET'));

module.exports = router;
