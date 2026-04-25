"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Review_1 = __importDefault(require("../models/Review"));
const Game_1 = __importDefault(require("../models/Game"));
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const router = (0, express_1.Router)();
// Middleware to check API key (same as user routes)
const authorize = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const secret = process.env.API_SECRET || 'dev_secret_key_123';
    if (!apiKey || apiKey !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};
// GET /api/reviews/:gameId
router.get('/:gameId', async (req, res) => {
    try {
        const reviews = await Review_1.default.find({ gameId: req.params.gameId }).sort({ createdAt: -1 }).limit(50);
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
// POST /api/reviews (Authenticated)
router.post('/', authorize, async (req, res) => {
    try {
        const { gameId, userId, userName, userAvatar, rating, comment } = (0, mongo_sanitize_1.default)(req.body);
        if (!gameId || !userId || !rating || !comment) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Save review
        const review = new Review_1.default({
            gameId,
            userId,
            userName,
            userAvatar,
            rating,
            comment
        });
        await review.save();
        // Update Game average rating (Skip for SITE_FEEDBACK)
        if (gameId !== 'WEBSITE_FEEDBACK') {
            const allReviews = await Review_1.default.find({ gameId });
            const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
            await Game_1.default.findOneAndUpdate({ id: gameId }, {
                $set: { rating: avgRating },
                $inc: { reviewCount: 1 }
            });
        }
        res.status(201).json(review);
    }
    catch (error) {
        console.error('Review Error:', error.message);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});
exports.default = router;
