const express = require('express');
const router = express.Router();

router.get('', require('./roomListGET'));

module.exports = router;
