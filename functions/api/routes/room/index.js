const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/code/:code', checkUser, require('./roomCodeGET'));
router.post('', checkUser, require('./roomPOST'));
router.post('/:roomId/enter', checkUser, require('./roomEnterPOST'));
router.patch('/:roomId/purpose', checkUser, require('./roomPurposePATCH'));
router.get('/:roomId/waiting', checkUser, require('./roomWaitingGET'));
router.get('/:roomId', checkUser, require('./roomDetailGET'));

module.exports = router;
