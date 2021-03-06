const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/:roomId', checkUser, require('./myroomRoomGET'));
router.get('', checkUser, require('./myroomGET'));
router.get('/thumbnail/:roomId', checkUser, require('./myroomThumbnailListGET'));
router.patch('/:roomId/thumbnail/:recordId', checkUser, require('./myroomThumbnailPATCH'));

module.exports = router;
