const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/code/:code', checkUser, require('./roomCodeGET'));
router.post('', checkUser, require('./roomPOST'));
router.post('/:roomId/enter', checkUser, require('./roomEnterPOST'));
router.patch('/:roomId/purpose', checkUser, require('./roomPurposePATCH'));
router.get('/:roomId/waiting', checkUser, require('./roomWaitingGET'));
router.get('/:roomId', checkUser, require('./roomDetailGET'));
router.get('', checkUser, require('./roomListGET'));
router.get('/:roomId/waiting/member', checkUser, require('./roomWaitingMemberGET'));
router.post('/:roomId/start', checkUser, require('./roomStartPOST'));

module.exports = router;
