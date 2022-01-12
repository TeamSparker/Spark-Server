const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/code/:code', checkUser, require('./roomCodeGET'));
router.post('', checkUser, require('./roomPOST'));
router.post('/:roomId/enter', checkUser, require('./roomEnterPOST'));

module.exports = router;
