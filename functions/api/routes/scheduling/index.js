const express = require('express');
const router = express.Router();

router.post('/inspection', require('./inspectPOST'));
router.post('/remind', require('./remindPOST'));

module.exports = router;
