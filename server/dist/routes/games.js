"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Game_1 = __importDefault(require("../models/Game"));
const router = (0, express_1.Router)();
// GET /api/games
router.get('/', async (req, res) => {
    try {
        const { search, category, page = '1', limit = '60' } = req.query;
        const query = {};
        // Filter by category slug
        if (category && category !== 'all') {
            const decodedCategory = decodeURIComponent(category);
            // We'll use a regex or case-insensitive match for category names, or map it.
            // For now, let's assume 'category' query is the category name or slug.
            query.$or = [
                { category: new RegExp(`^${decodedCategory}$`, 'i') },
                // Add slug matching if we had category slugs, for now just name
            ];
        }
        // Filter by search (text index)
        if (search) {
            query.$text = { $search: search };
        }
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(1000, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;
        const [games, total] = await Promise.all([
            Game_1.default.find(query).skip(skip).limit(limitNum).sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 }),
            Game_1.default.countDocuments(query)
        ]);
        res.json({
            games,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error('Error in /api/games:', error.message);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});
// GET /api/games/featured
router.get('/featured', async (_req, res) => {
    try {
        const games = await Game_1.default.find({ isFeatured: true }).limit(15);
        res.json(games);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch featured games' });
    }
});
// GET /api/games/meta/categories
router.get('/meta/categories', async (_req, res) => {
    try {
        // Use aggregation to get unique categories and counts
        const categories = await Game_1.default.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: {
                    name: '$_id',
                    count: 1,
                    slug: { $toLower: { $replaceOne: { input: '$_id', find: ' ', replacement: '-' } } }, // Simple slugify
                    icon: { $literal: 'sports_esports' } // Default icon
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
// GET /api/games/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Find by MongoDB ID, our custom ID, or Slug
        const game = await Game_1.default.findOne({
            $or: [
                { id: id },
                { slug: id }
            ]
        });
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        // Include related games (same category)
        const related = await Game_1.default.find({
            category: game.category,
            id: { $ne: game.id }
        }).limit(12);
        res.json({ game, related });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch game' });
    }
});
exports.default = router;
