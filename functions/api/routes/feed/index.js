const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/:recordId/like', checkUser, require('./feedLikePOST'));

module.exports = router;

//aa