const express = require('express');
const router = express.Router();

router.use('/active', require('./active'));
router.use('/service', require('./service'));

module.exports = router;
