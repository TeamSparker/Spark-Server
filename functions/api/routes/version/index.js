const express = require('express');
const router = express.Router();

router.get('', require('./versionGET'));

module.exports = router;
