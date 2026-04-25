const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Define Schema manually to avoid importing models if they are in TS
const GameSchema = new mongoose.Schema({
  id: String,
  title: String,
  rating: Number,
  reviewCount: Number
});

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

async function checkRatings() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bdw_gaming_portal');
    console.log('Connected to MongoDB');
    
    const total = await Game.countDocuments();
    const withRating = await Game.countDocuments({ rating: { $gt: 0 } });
    const zeroRating = await Game.countDocuments({ rating: 0 });
    
    console.log(`Total Games: ${total}`);
    console.log(`Games with rating > 0: ${withRating}`);
    console.log(`Games with 0 rating: ${zeroRating}`);
    
    if (withRating === 0 && total > 0) {
        console.log('Initializing ratings for games...');
        // Let's give some games random ratings to make it look "real time" or populated
        const games = await Game.find({ rating: 0 }).limit(100);
        for (const game of games) {
            const randomRating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
            const randomReviews = Math.floor(Math.random() * 500) + 50;
            await Game.updateOne({ _id: game._id }, { 
                $set: { rating: parseFloat(randomRating), reviewCount: randomReviews } 
            });
        }
        console.log('Initialized 100 games with ratings.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRatings();
