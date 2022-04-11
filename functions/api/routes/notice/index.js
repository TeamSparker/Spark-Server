const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.use('/active', require('./active'));
router.use('/service', require('./service'));

router.get('/new', checkUser, require('./noticeNewGET'));
router.get('/setting', checkUser, require('./noticeSettingGET'));
router.post('/remind', require('./remindPOST'));
router.patch('/setting', checkUser, require('./noticeSettingPATCH'));
router.delete('/:noticeId', checkUser, require('./noticeDELETE'));

module.exports = router;
