const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../../middlewares/auth');

router.patch('/read', checkUser, require('./activeReadPATCH'));

module.exports = router;
