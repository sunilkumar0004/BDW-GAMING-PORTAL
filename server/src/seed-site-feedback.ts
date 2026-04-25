import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Game from './models/Game';
import Review from './models/Review';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdw_gaming_portal';

async function seedSiteFeedback() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const siteId = 'WEBSITE_FEEDBACK';

    // 1. Create a dummy "Game" entry for the website if it doesn't exist
    // This allows the rating system to work just like a game
    await Game.findOneAndUpdate(
      { id: siteId },
      {
        $set: {
          title: 'BDW Gaming Portal',
          slug: 'site-feedback',
          category: 'Portal',
          image: '/logo.png',
          url: 'https://bdw-gaming.com',
          isFeatured: false,
          rating: 4.9,
          reviewCount: 1250,
          description: 'User feedback and ratings for the BDW Gaming Portal.'
        }
      },
      { upsert: true }
    );

    // 2. Add some realistic reviews
    const reviews = [
      {
        userId: 'system_1',
        userName: 'Alex Gamer',
        rating: 5,
        comment: 'Best unblocked gaming portal! The PC games section is amazing.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        userId: 'system_2',
        userName: 'Sarah Jenkins',
        rating: 5,
        comment: 'Love the interface and how fast everything loads. No lag at all!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
      {
        userId: 'system_3',
        userName: 'Mike Ross',
        rating: 4,
        comment: 'Great selection of games, would love to see more strategy titles.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      },
      {
        userId: 'system_4',
        userName: 'Emily Chen',
        rating: 5,
        comment: 'The new PC version download feature is a game changer. 5 stars!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
      }
    ];

    await Review.deleteMany({ gameId: siteId });
    
    for (const r of reviews) {
      await Review.create({
        gameId: siteId,
        ...r
      });
    }

    console.log('Successfully seeded site feedback reviews!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed site feedback:', err);
    process.exit(1);
  }
}

seedSiteFeedback();
