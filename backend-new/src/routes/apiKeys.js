const express = require('express');
const router = express.Router();
const ApiKey = require('../models/ApiKey');

// Get all API keys
router.get('/', async (req, res) => {
    try {
        const apiKeys = await ApiKey.find().select('-apiKey');
        res.json(apiKeys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new API key
router.post('/', async (req, res) => {
    const apiKey = new ApiKey({
        service: req.body.service,
        apiKey: req.body.apiKey,
        description: req.body.description
    });

    try {
        const newApiKey = await apiKey.save();
        res.status(201).json(newApiKey);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update API key
router.patch('/:id', async (req, res) => {
    try {
        const apiKey = await ApiKey.findById(req.params.id);
        if (req.body.service) apiKey.service = req.body.service;
        if (req.body.apiKey) apiKey.apiKey = req.body.apiKey;
        if (req.body.description) apiKey.description = req.body.description;
        if (req.body.isActive !== undefined) apiKey.isActive = req.body.isActive;

        const updatedApiKey = await apiKey.save();
        res.json(updatedApiKey);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete API key
router.delete('/:id', async (req, res) => {
    try {
        await ApiKey.findByIdAndDelete(req.params.id);
        res.json({ message: 'API key deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;