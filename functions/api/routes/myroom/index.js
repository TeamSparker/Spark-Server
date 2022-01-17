const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/:roomId', checkUser, require('./myroomRoomGET'));
router.get('', checkUser, require('./myroomGET'));

module.exports = router;
