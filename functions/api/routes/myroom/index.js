const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/:roomType', checkUser, require('./myroomGET'));

module.exports = router;
