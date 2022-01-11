const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/read', require('./serviceReadPATCH'));

module.exports = router;
