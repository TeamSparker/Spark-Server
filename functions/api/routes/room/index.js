const express = require('express');
const router = express.Router();

router.post('', require('./roomPOST'));

module.exports = router;
