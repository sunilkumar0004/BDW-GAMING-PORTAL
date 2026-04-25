"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllGames = fetchAllGames;
exports.invalidateCache = invalidateCache;
exports.getCategories = getCategories;
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ─── API Sources ──────────────────────────────────────────────────────────────
// Fetches 3 pages x 200 = up to 600 games from GameDistribution
const API_PAGES = [1, 2, 3, 4, 5, 6, 7, 8];
const buildApiUrl = (page) => `https://catalog.api.gamedistribution.com/api/v2.0/rss/All/?collection=All&categories=All&type=all&amount=200&page=${page}&format=json`;
// ─── Custom Games File ────────────────────────────────────────────────────────
// Edit server/custom-games.json to add games. No code change needed.
// Find the server root by walking up from __dirname
function findServerRoot() {
    // __dirname = /server/src/services or similar
    let dir = __dirname;
    for (let i = 0; i < 5; i++) {
        const candidate = path.join(dir, 'custom-games.json');
        if (fs.existsSync(candidate))
            return candidate;
        dir = path.dirname(dir);
    }
    // Absolute fallback — update this if you move the server folder
    return path.join(process.cwd(), 'custom-games.json');
}
// ─── Cache ────────────────────────────────────────────────────────────────────
let cachedGames = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes — edit to 0 for instant refresh during dev
// ─── Helpers ──────────────────────────────────────────────────────────────────
function getIcon(category) {
    const cat = category.toLowerCase();
    if (cat.includes('action'))
        return 'flare';
    if (cat.includes('puzzle'))
        return 'extension';
    if (cat.includes('racing') || cat.includes('car'))
        return 'directions_car';
    if (cat.includes('sports'))
        return 'sports_basketball';
    if (cat.includes('shooter') || cat.includes('gun'))
        return 'crisis_alert';
    if (cat.includes('match') || cat.includes('3'))
        return 'style';
    if (cat.includes('adventure'))
        return 'explore';
    if (cat.includes('girl') || cat.includes('dress') || cat.includes('fashion'))
        return 'auto_awesome';
    if (cat.includes('horror') || cat.includes('zombie'))
        return 'sentiment_very_dissatisfied';
    if (cat.includes('.io') || cat.includes(' io'))
        return 'wifi_tethering';
    if (cat.includes('idle') || cat.includes('clicker'))
        return 'touch_app';
    if (cat.includes('tower'))
        return 'fort';
    if (cat.includes('cooking') || cat.includes('food'))
        return 'restaurant';
    if (cat.includes('card'))
        return 'style';
    if (cat.includes('board'))
        return 'casino';
    if (cat.includes('simulation'))
        return 'settings';
    if (cat.includes('strategy'))
        return 'psychology';
    if (cat.includes('rpg') || cat.includes('role'))
        return 'shield';
    if (cat.includes('platform'))
        return 'terrain';
    if (cat.includes('bubble'))
        return 'bubble_chart';
    return 'gamepad';
}
function transformGame(game, index, totalFromApi) {
    const assets = game.Asset || [];
    let bestImage = assets[0] || '';
    const square = assets.find((img) => img.includes('512x512') ||
        img.includes('300x300') ||
        img.includes('200x200'));
    if (square)
        bestImage = square;
    const category = game.Category && game.Category.length ? game.Category[0] : 'Casual';
    return {
        id: game.Md5 || `api-${index}`,
        title: game.Title || 'Unknown Game',
        image: bestImage,
        url: game.Url || '',
        category,
        description: game.Description || '',
        isFeatured: index < 10,
        isNew: index >= totalFromApi - 40,
    };
}
function loadCustomGames() {
    try {
        const filePath = findServerRoot();
        if (!fs.existsSync(filePath)) {
            console.log(`ℹ️  custom-games.json not found at: ${filePath}`);
            return [];
        }
        console.log(`📁 Loading custom games from: ${filePath}`);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        console.log(`✅ Loaded ${parsed.length} custom games`);
        return parsed;
    }
    catch (e) {
        console.warn('⚠️  Could not load custom-games.json:', e);
        return [];
    }
}
// ─── Main Fetch ───────────────────────────────────────────────────────────────
async function fetchAllGames() {
    const now = Date.now();
    if (cachedGames && now - cacheTime < CACHE_TTL) {
        return cachedGames;
    }
    console.log('🔄 Fetching games from GameDistribution API (3 pages)...');
    // Fetch all pages in parallel
    const results = await Promise.allSettled(API_PAGES.map((page) => (0, node_fetch_1.default)(buildApiUrl(page)).then((r) => {
        if (!r.ok)
            throw new Error(`Page ${page} responded with ${r.status}`);
        return r.json();
    })));
    const allRaw = [];
    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            allRaw.push(...result.value);
            console.log(`  ✓ Page ${API_PAGES[i]}: ${result.value.length} games`);
        }
        else {
            console.warn(`  ✗ Page ${API_PAGES[i]} failed:`, result.reason?.message);
        }
    });
    // Deduplicate by Md5
    const seen = new Set();
    const uniqueRaw = allRaw.filter((g) => {
        if (seen.has(g.Md5))
            return false;
        seen.add(g.Md5);
        return true;
    });
    const apiGames = uniqueRaw.map((g, i) => transformGame(g, i, uniqueRaw.length));
    const customGames = loadCustomGames();
    // Custom games go at the top (featured), API games follow
    cachedGames = [...customGames, ...apiGames];
    cacheTime = now;
    console.log(`✅ Total games cached: ${cachedGames.length} (${customGames.length} custom + ${apiGames.length} API)`);
    return cachedGames;
}
// ─── Force-refresh cache (call via admin endpoint) ────────────────────────────
function invalidateCache() {
    cachedGames = null;
    cacheTime = 0;
    console.log('🗑️  Game cache cleared.');
}
// ─── Categories ───────────────────────────────────────────────────────────────
async function getCategories() {
    const games = await fetchAllGames();
    const countMap = {};
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
