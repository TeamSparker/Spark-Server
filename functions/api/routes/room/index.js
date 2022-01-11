const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/code/:code', checkUser, require('./roomCodeGET'));
router.post('', checkUser, require('./roomPOST'));

module.exports = router;
