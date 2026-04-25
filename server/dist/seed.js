"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Game_1 = __importDefault(require("./models/Game"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdw_gaming_portal';
async function seed() {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('🍃 Connected to MongoDB for seeding...');
        const gamesPath = path_1.default.join(__dirname, '../custom-games.json');
        const gamesData = JSON.parse(fs_1.default.readFileSync(gamesPath, 'utf-8'));
        console.log(`📦 Found ${gamesData.length} games. Starting migration...`);
        let count = 0;
        for (const g of gamesData) {
            // Create a unique slug by appending the first 4 chars of ID to avoid collisions
            const baseSlug = g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const uniqueSlug = `${baseSlug}-${g.id.substring(0, 4)}`;
            try {
                await Game_1.default.findOneAndUpdate({ id: g.id }, {
                    $set: {
                        title: g.title,
                        slug: uniqueSlug,
                        category: g.category,
                        description: g.description,
                        image: g.image,
                        url: g.url,
                        isFeatured: g.isFeatured || false,
                        isNew: g.isNew || false,
                        isPopular: g.isPopular || false
                    }
                }, { upsert: true });
                count++;
                if (count % 100 === 0)
                    console.log(`✅ Migrated ${count} games...`);
            }
            catch (e) {
                console.error(`⚠️ Failed to migrate game ${g.title}:`, e.message);
            }
        }
        console.log('✨ Database seeding completed successfully!');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}
seed();
