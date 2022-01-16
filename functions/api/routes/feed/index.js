const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('', checkUser, require('./feedGET'));

module.exports = router;
