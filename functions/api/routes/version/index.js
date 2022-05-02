const express = require('express');
const router = express.Router();

router.get('', require('./versionGET'));
router.patch('', require('./versionPATCH'));

module.exports = router;
