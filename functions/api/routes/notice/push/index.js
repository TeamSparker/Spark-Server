const express = require('express');
const router = express.Router();

router.get('/test', require('./pushTestGET'));

module.exports = router;
