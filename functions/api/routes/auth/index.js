const express = require('express');
const router = express.Router();
const uploadImageIntoSubDir = require('../../../middlewares/uploadImage');
const { checkUser } = require('../../../middlewares/auth');

router.post('/signup', uploadImageIntoSubDir('users'), require('./authSignUpPOST'));
router.post('/signout', checkUser, require('./authSignOutPOST'));
router.get('/doorbell', require('./authDoorbellGET'));

module.exports = router;
