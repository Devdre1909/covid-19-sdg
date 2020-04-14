const express = require('express');

const router = express.Router();

const onCovid19Controller = require('../../controllers/apis/v1/covid19');

router.use('/on-covid-19', onCovid19Controller);

module.exports = router;
