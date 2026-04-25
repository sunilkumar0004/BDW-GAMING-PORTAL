import { Router, Request, Response } from 'express';
import Review from '../models/Review';
import Game from '../models/Game';
import mongoSanitize from 'mongo-sanitize';

const router = Router();

// Middleware to check API key (same as user routes)
const authorize = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  const secret = process.env.API_SECRET || 'dev_secret_key_123';
  if (!apiKey || apiKey !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// GET /api/reviews/:gameId
router.get('/:gameId', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ gameId: req.params.gameId }).sort({ createdAt: -1 }).limit(50);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews (Authenticated)
router.post('/', authorize, async (req: Request, res: Response) => {
  try {
    const { gameId, userId, userName, userAvatar, rating, comment } = mongoSanitize(req.body);

    if (!gameId || !userId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save review
    const review = new Review({
      gameId,
      userId,
      userName,
      userAvatar,
      rating,
      comment
    });
    await review.save();

    // Update Game average rating
    const allReviews = await Review.find({ gameId });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
      : rating;

    await Game.findOneAndUpdate(
      { id: gameId },
      { 
        $set: { rating: avgRating },
        $inc: { reviewCount: 1 }
      }
    );

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Review Error:', error.message);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
