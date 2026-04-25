import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import Game from './models/Game';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdw_gaming_portal';

// Aggressive API Fetching to reach 3205+ games
const GD_API = (page: number) => `https://catalog.api.gamedistribution.com/api/v2.0/rss/All/?collection=All&categories=All&type=all&amount=100&page=${page}&format=json`;

function transformGame(game: any): any {
  const assets: string[] = game.Asset || [];
  let bestImage = assets.find((img: string) => img.includes('512x512')) || assets[0] || '';
  const category = game.Category && game.Category.length ? game.Category[0] : 'Casual';

  return {
    id: game.Md5 || `api-${game.Title?.substring(0,3)}-${Math.random().toString(36).substr(2, 4)}`,
    title: game.Title || 'Unknown Game',
    image: bestImage,
    url: game.Url || '',
    category,
    description: game.Description || '',
    isFeatured: false,
    isNew: false,
    isPopular: false
  };
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🍃 Connected to MongoDB for FULL restoration (Target: 3205+)...');

    const uniqueGamesMap = new Map();

    // 1. Load from Custom Files (Priority)
    const customPaths = [
      path.join(__dirname, '../custom-games.json'),
      path.join(__dirname, '../../client/custom-games.json')
    ];

    for (const p of customPaths) {
      if (fs.existsSync(p)) {
        console.log(`📁 Reading custom games from: ${p}`);
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        data.forEach((g: any) => uniqueGamesMap.set(g.id, g));
      }
    }

    console.log(`📦 Loaded ${uniqueGamesMap.size} games from local files.`);

    // 2. Fetch from API until we reach a high number
    console.log('🌐 Fetching additional games from GameDistribution API (40 pages)...');
    for (let page = 1; page <= 40; page++) {
      try {
        const response = await fetch(GD_API(page));
        if (!response.ok) break;
        const data = await response.json() as any[];
        if (!data || data.length === 0) break;

        data.forEach(g => {
          const transformed = transformGame(g);
          if (!uniqueGamesMap.has(transformed.id)) {
            uniqueGamesMap.set(transformed.id, transformed);
          }
        });

        if (page % 5 === 0) console.log(`  ✓ Progress: ${uniqueGamesMap.size} unique games found...`);
      } catch (e) {
        console.warn(`  ✗ Page ${page} failed`);
      }
    }

    const uniqueGames = Array.from(uniqueGamesMap.values());
    console.log(`🚀 Total games to migrate: ${uniqueGames.length}`);

    let count = 0;
    for (const g of uniqueGames) {
      const baseSlug = g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueSlug = `${baseSlug}-${String(g.id).substring(0, 4)}`;
      
      await Game.findOneAndUpdate(
        { id: g.id },
        { 
          $set: {
            title: g.title,
            slug: uniqueSlug,
            category: g.category,
            description: g.description,
            image: g.image,
            url: g.url,
            isFeatured: g.isFeatured || false,
            isNew: g.isNew || false,
            isPopular: g.isPopular || false,
            // New fields
            type: g.type || 'browser',
            trailer: g.trailer,
            developer: g.developer,
            released: g.released,
            platforms: g.platforms,
            tags: g.tags,
            downloads: g.downloads,
            players: g.players,
            size: g.size,
            screenshots: g.screenshots,
            downloadLinks: g.downloadLinks,
            rating: g.rating || 0,
            reviewCount: g.reviewCount || 0
          }
        },
        { upsert: true }
      );
      count++;
      if (count % 500 === 0) console.log(`✅ Migrated ${count} games...`);
    }

    console.log(`✨ Restoration complete! Final Database Count: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Restoration failed:', err);
    process.exit(1);
  }
}

seed();
