const express = require('express');
const router = express.Router();
const uploadImageIntoSubDir = require('../../../middlewares/uploadImage');

router.post('/signup', uploadImageIntoSubDir('users'), require('./authSignUpPOST'));
router.get('/doorbell', require('./authDoorbellGET'));

module.exports = router;
