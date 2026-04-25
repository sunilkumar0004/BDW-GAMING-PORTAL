import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  image: string;
  url: string;
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
  playCount: number;
  rating: number;
  reviewCount: number;
  type?: 'browser' | 'download';
  trailer?: string;
  developer?: string;
  released?: string;
  platforms?: string[];
  tags?: string[];
  downloads?: string;
  players?: string;
  size?: string;
  screenshots?: string[];
  downloadLinks?: {
    playStore?: string;
    appStore?: string;
    steam?: string;
    epicGames?: string;
    pc?: string;
  };
}

const GameSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  url: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  playCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  type: { type: String, enum: ['browser', 'download'], default: 'browser' },
  trailer: { type: String },
  developer: { type: String },
  released: { type: String },
  platforms: { type: [String] },
  tags: { type: [String] },
  downloads: { type: String },
  players: { type: String },
  size: { type: String },
  screenshots: { type: [String] },
  downloadLinks: {
    playStore: { type: String },
    appStore: { type: String },
    steam: { type: String },
    epicGames: { type: String },
    pc: { type: String },
  }
}, { timestamps: true, strict: false });

// Optimized Indexes for performance
GameSchema.index({ category: 1, rating: -1 });
GameSchema.index({ isFeatured: 1, createdAt: -1 });
GameSchema.index({ isPopular: 1, playCount: -1 });
GameSchema.index({ id: 1 }, { unique: true });
GameSchema.index({ slug: 1 }, { unique: true });
GameSchema.index(
  { title: 'text', category: 'text', description: 'text' },
  { weights: { title: 10, category: 5, description: 1 }, name: "GameTextIndex" }
);

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
