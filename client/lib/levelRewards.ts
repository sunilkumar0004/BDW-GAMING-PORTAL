// ── Progression Constants ───────────────────────────────────────────────────
// Max level is 100. Each level costs 200 XP flat.
// Total XP to reach Lv100 = 20,000 XP.

export const MAX_LEVEL = 100;
export const XP_PER_LEVEL = 200;

/** XP required to have fully completed level N (i.e. entered level N+1) */
export const xpForLevel = (level: number): number =>
  Math.min(level, MAX_LEVEL) * XP_PER_LEVEL;

/** Current level given raw total XP */
export const levelFromXp = (xp: number): number =>
  Math.min(Math.floor(xp / XP_PER_LEVEL), MAX_LEVEL);

/** Progress toward the NEXT level (0–1) */
export const xpProgressFraction = (xp: number): number => {
  const lvl = levelFromXp(xp);
  if (lvl >= MAX_LEVEL) return 1;
  const levelStart = lvl * XP_PER_LEVEL;
  return (xp - levelStart) / XP_PER_LEVEL;
};

// ── Level Rewards ───────────────────────────────────────────────────────────
// Every level gives a small title/badge.
// Milestone levels give avatar unlocks + special titles.

export interface LevelReward {
  level: number;
  title: string;       // badge / rank name
  coins?: number;      // currency reward
  xpBonus?: number;    // extra XP burst (milestone only)
  avatarUrl?: string;  // unlock a new avatar
  frameColor?: string; // profile frame color/style
  bannerUrl?: string;  // profile banner background
  description: string;
}

// DiceBear API for avatars (deterministic via seed, no network cost):
const av = (style: string, seed: string) =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;

// High-quality banners from wallpapersden (same source as game art)
const bn = (id: string) => `https://images.wallpapersden.com/image/download/${id}.jpg`;

export const LEVEL_REWARDS: Record<number, LevelReward> = {
  1:   { level: 1,  title: 'Rookie',      coins: 50,   description: 'Welcome to the arena, rookie!' },
  2:   { level: 2,  title: 'Scout',       coins: 50,   description: 'Keep exploring the game library.' },
  3:   { level: 3,  title: 'Gamer',       coins: 50,   description: 'You\'re getting the hang of this.' },
  4:   { level: 4,  title: 'Player',      coins: 50,   description: 'Solid start. Keep earning XP.' },
  5:   { level: 5,  title: 'Adventurer',  coins: 200,  description: 'First milestone!', avatarUrl: av('adventurer', 'lvl5hero'), xpBonus: 100 },
  6:   { level: 6,  title: 'Ranger',      coins: 60,   description: 'Adventure continues.' },
  7:   { level: 7,  title: 'Wanderer',    coins: 60,   description: 'Wandering the game world.' },
  8:   { level: 8,  title: 'Hunter',      coins: 60,   description: 'Hunting for the best games.' },
  9:   { level: 9,  title: 'Seeker',      coins: 60,   description: 'Almost at double digits!' },
  10:  { level: 10, title: 'Veteran',     coins: 500,  description: '10 levels deep!', avatarUrl: av('bottts', 'veteran10'), frameColor: 'linear-gradient(135deg, #00d2ff, #3a7bd5)', xpBonus: 200 },
  20:  { level: 20, title: 'Expert',      coins: 1000, description: 'Official Valorant Episode Key Art.', avatarUrl: av('lorelei', 'expert20'), bannerUrl: 'https://images.alphacoders.com/132/1322237.png', xpBonus: 300 },
  30:  { level: 30, title: 'Champion',    coins: 1500, description: 'Champion of the gaming portal.', avatarUrl: av('bottts-neutral', 'champion30'), frameColor: 'linear-gradient(135deg, #FFD700, #FFA500)', xpBonus: 500 },
  40:  { level: 40, title: 'Hero',        coins: 2000, description: 'Official PUBG: Battlegrounds 4K Poster.', avatarUrl: av('fun-emoji', 'hero40'), bannerUrl: 'https://images.alphacoders.com/131/1311099.jpg', xpBonus: 600 },
  50:  { level: 50, title: 'Master',      coins: 3000, description: 'Halfway to Legend!', avatarUrl: av('pixel-art', 'master50'), frameColor: 'linear-gradient(135deg, #7B5EFF, #3496FF)', xpBonus: 1000 },
  60:  { level: 60, title: 'Warlord',     coins: 4000, description: 'Official GTA V: Los Santos Key Art.', avatarUrl: av('bottts', 'warlord60'), bannerUrl: 'https://images.alphacoders.com/513/513228.jpg', xpBonus: 800 },
  70:  { level: 70, title: 'Titan',       coins: 5000, description: 'Titan-level gamer.', avatarUrl: av('adventurer', 'titan70'), frameColor: 'linear-gradient(135deg, #FF4B4B, #FF9068)', xpBonus: 900 },
  80:  { level: 80, title: 'Guardian',    coins: 6000, description: 'Official Garena Free Fire 4K Art.', avatarUrl: av('pixel-art', 'guardian80'), bannerUrl: 'https://images.alphacoders.com/131/1314981.jpg', xpBonus: 1100 },
  90:  { level: 90, title: 'Archlich',    coins: 7500, description: 'Near legendary status.', avatarUrl: av('bottts-neutral', 'archlich90'), frameColor: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', xpBonus: 1200 },
  100: { level: 100, title: '⚡ LEGEND',  coins: 20000, description: 'Official League of Legends: Worlds Key Art.', avatarUrl: av('bottts', 'legend100Ultimate'), frameColor: 'linear-gradient(135deg, #00F260, #0575E6)', bannerUrl: 'https://images.alphacoders.com/133/1333742.jpg', xpBonus: 5000 },
};

// Helper — get the most recent reward for a given level (exact match or nearest below)
export const getRewardForLevel = (level: number): LevelReward | null => {
  const exact = LEVEL_REWARDS[level];
  if (exact) return exact;
  // Fallback for non-milestone levels
  const coins = level * 20 + 50; 
  if (level < 5) return { level, title: ['Rookie','Scout','Gamer','Player'][level-1] || 'Player', coins, description: `Level ${level} reached!` };
  if (level < 10) return { level, title: 'Ranger', coins, description: `Level ${level} reached!` };
  if (level < 20) return { level, title: 'Specialist', coins, description: `Level ${level} reached!` };
  if (level < 30) return { level, title: 'Expert', coins, description: `Level ${level} reached!` };
  if (level < 40) return { level, title: 'Elite', coins, description: `Level ${level} reached!` };
  if (level < 50) return { level, title: 'Champion', coins, description: `Level ${level} reached!` };
  if (level < 60) return { level, title: 'Hero', coins, description: `Level ${level} reached!` };
  if (level < 70) return { level, title: 'Warlord', coins, description: `Level ${level} reached!` };
  if (level < 80) return { level, title: 'Titan', coins, description: `Level ${level} reached!` };
  if (level < 90) return { level, title: 'Conqueror', coins, description: `Level ${level} reached!` };
  if (level < 100) return { level, title: 'Demigod', coins, description: `Level ${level} reached!` };
  return null;
};
