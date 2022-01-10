const express = require('express');
const router = express.Router();

router.post('', require('./roomPOST'));
router.get('/code/:code', require('./roomCodeGET'));

module.exports = router;
