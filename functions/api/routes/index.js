const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/feed', require('./feed'));
router.use('/myroom', require('./myroom'));
router.use('/notice', require('./notice'));
router.use('/room', require('./room'));
router.use('/user', require('./user'));
router.use('/scheduling', require('./scheduling'));

module.exports = router;
