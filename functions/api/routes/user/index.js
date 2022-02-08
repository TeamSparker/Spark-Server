const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');
const uploadImageIntoSubDir = require('../../../middlewares/uploadImage');

router.get('/profile', checkUser, require('./userProfileGET'));
router.patch('/profile', checkUser, uploadImageIntoSubDir('users'), require('./userProfilePATCH'));

module.exports = router;
