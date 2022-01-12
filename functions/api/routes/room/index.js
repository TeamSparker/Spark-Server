const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/code/:code', checkUser, require('./roomCodeGET'));
router.post('', checkUser, require('./roomPOST'));
router.get('/:roomId', checkUser, require('./roomDetailGET'));

module.exports = router;
