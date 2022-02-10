const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/profile', checkUser, require('./userProfileGET'));

module.exports = router;
