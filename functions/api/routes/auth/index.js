const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middlewares/uploadImage');
const { checkUser } = require('../../../middlewares/auth');

router.post('/signup',uploadImage, require('./authSignupPOST'));
// router.get('/test', checkUser, require('./authTestGET'));
router.get('/test', checkUser, require('./authTestGET'));

module.exports = router;
