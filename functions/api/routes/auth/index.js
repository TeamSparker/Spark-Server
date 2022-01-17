const express = require('express');
const router = express.Router();
const uploadImageIntoSubDir = require('../../../middlewares/uploadImage');

router.post('/signup', uploadImageIntoSubDir('users'), require('./authSignUpPOST'));

module.exports = router;
