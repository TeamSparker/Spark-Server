const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.use('/active', require('./active'));
router.use('/service', require('./service'));
router.use('/push', require('./push'));

router.delete('/:noticeId', checkUser, require('./noticeDELETE'));

module.exports = router;
