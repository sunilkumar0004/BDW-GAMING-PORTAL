import { Router, Request, Response } from 'express';
import Game from '../models/Game';

const router = Router();

// GET /api/games
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, type, featured, page = '1', limit = '60' } = req.query as Record<string, string>;

    const query: any = {};
    
    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by featured
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Filter by category slug
    if (category && category !== 'all') {
      const decodedCategory = decodeURIComponent(category);
      query.$or = [
        { category: new RegExp(`^${decodedCategory}$`, 'i') },
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
      Game.find(query).skip(skip).limit(limitNum).sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 }),
      Game.countDocuments(query)
    ]);

    res.json({
      games,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    console.error('Error in /api/games:', error.message);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// GET /api/games/featured
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const games = await Game.find({ isFeatured: true }).limit(15);
    res.json(games);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch featured games' });
  }
});

// GET /api/games/meta/categories
router.get('/meta/categories', async (_req: Request, res: Response) => {
  try {
    // Use aggregation to get unique categories and counts
    const categories = await Game.aggregate([
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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/games/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Find by MongoDB ID, our custom ID, or Slug
    const game = await Game.findOne({
      $or: [
        { id: id },
        { slug: id }
      ]
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Include related games (same category)
    const related = await Game.find({ 
      category: game.category, 
      id: { $ne: game.id } 
    }).limit(12);

    res.json({ game, related });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

export default router;
