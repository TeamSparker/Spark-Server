const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../../middlewares/auth');

router.get('', checkUser, require('./serviceGET'));
router.patch('/read', checkUser, require('./serviceReadPATCH'));

module.exports = router;
