import * as fs from 'fs';
import * as path from 'path';
import { Game, Category } from '../types/game';

// ─── API Sources ──────────────────────────────────────────────────────────────
const PROVIDERS = {
  GAMEPIX: 'https://feeds.gamepix.com/v2/json?pagination=96',
  GAMEMONETIZE: 'https://rss.gamemonetize.com/rssfeed.php?format=json&amount=200',
  GAMEDISTRIBUTION: Array.from({ length: 10 }, (_, i) => 
    `https://catalog.api.gamedistribution.com/api/v2.0/rss/All/?collection=all&amount=100&page=${i+1}&format=json`
  )
};

// ─── Cache ────────────────────────────────────────────────────────────────────
let cachedGames: Game[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 1 * 60 * 1000; // 1 minute cache

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getIcon(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('action')) return 'flare';
  if (cat.includes('puzzle')) return 'extension';
  if (cat.includes('racing') || cat.includes('car')) return 'directions_car';
  if (cat.includes('sports')) return 'sports_basketball';
  if (cat.includes('shooter') || cat.includes('gun')) return 'crisis_alert';
  if (cat.includes('match') || cat.includes('3')) return 'style';
  if (cat.includes('adventure')) return 'explore';
  if (cat.includes('girl') || cat.includes('dress') || cat.includes('fashion')) return 'auto_awesome';
  if (cat.includes('horror') || cat.includes('zombie')) return 'sentiment_very_dissatisfied';
  if (cat.includes('.io') || cat.includes(' io')) return 'wifi_tethering';
  if (cat.includes('idle') || cat.includes('clicker')) return 'touch_app';
  if (cat.includes('tower')) return 'fort';
  if (cat.includes('cooking') || cat.includes('food')) return 'restaurant';
  if (cat.includes('card')) return 'style';
  if (cat.includes('board')) return 'casino';
  if (cat.includes('simulation')) return 'settings';
  if (cat.includes('strategy')) return 'psychology';
  if (cat.includes('rpg') || cat.includes('role')) return 'shield';
  if (cat.includes('platform')) return 'terrain';
  if (cat.includes('bubble')) return 'bubble_chart';
  return 'gamepad';
}

function transformGame(game: any, provider: 'GD' | 'GP' | 'GM'): Game {
  let id = '', title = '', image = '', url = '', category = '', description = '';

  if (provider === 'GD') {
    id = game.Md5 || game.Title?.toLowerCase().replace(/\s+/g, '-');
    title = game.Title || 'Unknown';
    const assets = game.Asset || [];
    image = assets.find((img: string) => img.includes('512x512')) || assets[0] || '';
    url = game.Url || '';
    category = game.Category?.[0] || 'Casual';
    description = game.Description || '';
  } else if (provider === 'GP') {
    id = game.id;
    title = game.title;
    image = game.image;
    url = game.url;
    category = game.category || 'Casual';
    description = game.description || '';
  } else if (provider === 'GM') {
    id = game.id;
    title = game.title;
    image = game.thumb;
    url = game.url;
    category = game.category || 'Casual';
    description = game.description || '';
  }

  return applyProxy({
    id, title, image, url, category, description,
    isFeatured: false,
    isNew: false
  });
}

function loadCustomGames(): Game[] {
  try {
    let filePath = path.resolve(process.cwd(), 'custom-games.json');
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(process.cwd(), 'client', 'custom-games.json');
    }
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as Game[];
  } catch (e) {
    console.warn('⚠️  Could not load custom-games.json:', e);
    return [];
  }
}

function applyProxy(game: Game): Game {
  const needsProxy = (url: string) => 
    url.includes('gamedistribution.com') || 
    url.includes('gamemonetize.com') ||
    url.includes('gamepix.com');

  return {
    ...game,
    image: game.image && needsProxy(game.image) 
      ? `/api/proxy/image?url=${encodeURIComponent(game.image)}` 
      : game.image,
    url: game.url && needsProxy(game.url)
      ? `/api/proxy/game?url=${encodeURIComponent(game.url)}`
      : game.url
  };
}

// ─── Main Fetch ───────────────────────────────────────────────────────────────
export async function fetchAllGames(): Promise<Game[]> {
  const now = Date.now();
  if (cachedGames && now - cacheTime < CACHE_TTL) return cachedGames;

  console.log('🔄 Fetching games from multiple providers...');

  const fetches = [
    // GamePix
    fetch(PROVIDERS.GAMEPIX).then(r => r.json()).then(d => d.data.map((g: any) => transformGame(g, 'GP'))).catch(() => []),
    // GameMonetize
    fetch(PROVIDERS.GAMEMONETIZE).then(r => r.json()).then(d => d.map((g: any) => transformGame(g, 'GM'))).catch(() => []),
    // GameDistribution
    ...PROVIDERS.GAMEDISTRIBUTION.map(url => 
      fetch(url).then(r => r.json()).then(d => d.map((g: any) => transformGame(g, 'GD'))).catch(() => [])
    )
  ];

  const allResults = await Promise.all(fetches);
  const combined = allResults.flat();

  // Deduplicate by Title
  const seen = new Set<string>();
  const unique = combined.filter(g => {
    const key = g.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const customGames = loadCustomGames().map(applyProxy);
  
  // Tag featured and new
  const final = [...customGames, ...unique].map((g, i) => ({
    ...g,
    isFeatured: i < 20,
    isNew: i > combined.length - 50
  }));

  cachedGames = final;
  cacheTime = now;

  console.log(`✅ Total games cached: ${cachedGames.length} from all providers.`);
  return cachedGames;
}

// ─── Force-refresh cache ──────────────────────────────────────────────────────
export function invalidateCache(): void {
  cachedGames = null;
  cacheTime = 0;
  console.log('🗑️  Game cache cleared.');
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const games = await fetchAllGames();
  const countMap: Record<string, number> = {};

  games.forEach((g) => {
    countMap[g.category] = (countMap[g.category] || 0) + 1;
  });

  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      icon: getIcon(name),
      count,
    }));
}
