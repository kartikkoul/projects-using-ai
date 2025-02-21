const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const { analyzeUserData } = require("../ai/AI-functions");


router.post('/analyze', auth, async (req, res) => {
    const user = req.user.user;
    if(user.aiGenerationPower !== true){
        return res.json({message: "You do not have permission to use this feature!"});
    }

    try{
        const summary = await analyzeUserData(req.body);
        return res.json({summary});
    }catch(err){
        return res.status(500).json({message: "Server Error", error: err.message || err});
    }
});

module.exports = router;
