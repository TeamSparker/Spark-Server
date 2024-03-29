const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');
const uploadImageIntoSubDir = require('../../../middlewares/uploadImage');

router.get('/code/:code', checkUser, require('./roomCodeGET'));
router.post('', checkUser, require('./roomPOST'));
router.post('/:roomId/enter', checkUser, require('./roomEnterPOST'));
router.patch('/:roomId/purpose', checkUser, require('./roomPurposePATCH'));
router.get('/:roomId/waiting', checkUser, require('./roomWaitingGET'));
router.get('/:roomId', checkUser, require('./roomDetailGET'));
router.get('', checkUser, require('./roomListGET'));
router.get('/:roomId/waiting/member', checkUser, require('./roomWaitingMemberGET'));
router.post('/:roomId/start', checkUser, require('./roomStartPOST'));
router.post('/:roomId/status', checkUser, require('./roomStatusPOST'));
router.post('/:roomId/spark', checkUser, require('./sparkPOST'));
router.post('/:roomId/record', checkUser, uploadImageIntoSubDir('certification'), require('./roomRecordPOST'));
router.delete('/:roomId', checkUser, require('./roomDELETE'));
router.delete('/:roomId/out', checkUser, require('./roomOutDELETE'));
router.patch('/:roomId/read', checkUser, require('./roomReadPATCH'));
router.get('/:roomId/timeline', checkUser, require('./roomTimelineGET'));

module.exports = router;
