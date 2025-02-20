const express = require('express');
const router = express.Router();
const axios = require('axios');
const { aiInit } = require('../ai/AI-functions');

router.use(aiInit);

router.post('/analyze', async (req, res) => {
  
});

module.exports = router;
