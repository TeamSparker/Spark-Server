const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('', checkUser, require('./feedGET'));
router.post('/:recordId/like', checkUser, require('./feedLikePOST'));

module.exports = router;
