const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middlewares/uploadImage');

router.post('/signup',uploadImage, require('./authSignupPOST'));

module.exports = router;
