const express = require('express');

const router = express.Router();

const onCovid19Service = require('../../../services/v1/covid19/covid19');

router.post('/', onCovid19Service.returnJson);
router.post('/xml', onCovid19Service.returnXml);
router.get('/log', onCovid19Service.returnLog);


module.exports = router;
