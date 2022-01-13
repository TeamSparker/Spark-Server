const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/code/:code', checkUser, require('./roomCodeGET'));
router.post('', checkUser, require('./roomPOST'));
router.patch('/:roomId/purpose', checkUser, require('./roomPurposePATCH'));
router.get('/:roomId', checkUser, require('./roomDetailGET'));
router.get('', checkUser, require('./roomListGET'));

module.exports = router;
