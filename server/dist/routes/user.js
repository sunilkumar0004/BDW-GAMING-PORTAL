"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// Middleware to check API key
const authorize = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const secret = process.env.API_SECRET || 'dev_secret_key_123';
    if (!apiKey || apiKey !== secret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};
// GET user by externalId
router.get('/:id', authorize, async (req, res) => {
    try {
        const user = await User_1.default.findOne({ externalId: req.params.id });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST sync user data
router.post('/sync', authorize, async (req, res) => {
    const { externalId, ...updates } = req.body;
    try {
        let user = await User_1.default.findOneAndUpdate({ externalId }, { $set: updates }, { new: true, upsert: true });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
