const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.use('/active', require('./active'));
router.use('/service', require('./service'));

router.delete('/:noticeId', checkUser, require('./noticeDELETE'));
router.get('/new', checkUser, require('./noticeNewGET'));

module.exports = router;
