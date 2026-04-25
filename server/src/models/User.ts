import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  externalId: string; // From OAuth (Google/FB/Twitter)
  name: string;
  email?: string;
  avatar: string;
  xp: number;
  level: number;
  coins: number;
  currentFrame?: string;
  currentBanner?: string;
  unlockedAvatars: string[];
  unlockedFrames: string[];
  unlockedBanners: string[];
  savedGames: string[];
  completedMissions: string[];
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  externalId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  gems: { type: Number, default: 0 }, // New currency for playing games
  currentFrame: { type: String },
  currentBanner: { type: String },
  unlockedAvatars: [{ type: String }],
  unlockedFrames: [{ type: String }],
  unlockedBanners: [{ type: String }],
  savedGames: [{ type: String }],
  completedMissions: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
