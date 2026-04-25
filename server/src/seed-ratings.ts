import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Game from './models/Game';
import Review from './models/Review';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdw_gaming_portal';

async function seedRatings() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const games = await Game.find({});
    console.log(`Found ${games.length} games. Populating ratings...`);

    let count = 0;
    for (const game of games) {
      // Generate a realistic rating between 3.8 and 4.9
      const rating = parseFloat((Math.random() * (4.9 - 3.8) + 3.8).toFixed(1));
      const reviewCount = Math.floor(Math.random() * 1000) + 50;

      await Game.updateOne(
        { _id: game._id },
        { $set: { rating, reviewCount } }
      );

      count++;
      if (count % 500 === 0) console.log(`Updated ${count} games...`);
    }

    console.log(`Successfully updated ${count} games with realistic ratings!`);
    
    // Also seed some initial reviews for the "featured" games to make it look active
    const featuredGames = await Game.find({ isFeatured: true }).limit(10);
    const mockUsers = [
      { name: 'AlexGamer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
      { name: 'PokiFan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Poki' },
      { name: 'Skillz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Skillz' },
      { name: 'ProPlayer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro' }
    ];

    for (const fg of featuredGames) {
      for (let i = 0; i < 3; i++) {
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const review = new Review({
          gameId: fg.id,
          userId: `mock_${Math.random().toString(36).substr(2, 9)}`,
          userName: user.name,
          userAvatar: user.avatar,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
          comment: 'Awesome game! Really love the gameplay and graphics. Highly recommended for everyone!'
        });
        await review.save();
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedRatings();
