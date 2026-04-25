
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PAGES = Array.from({ length: 20 }, (_, i) => i + 1);
const AMOUNT_PER_PAGE = 200;
const IP = '52.30.53.241';
const HOST = 'catalog.api.gamedistribution.com';

async function run() {
  console.log('🚀 Starting massive game population (1500+ games)...');
  const allGames = [];

  for (const page of PAGES) {
    const url = `https://${IP}/api/v2.0/rss/All/?collection=all&amount=${AMOUNT_PER_PAGE}&page=${page}&format=json`;
    const cmd = `curl.exe -k -s -H "Host: ${HOST}" "${url}"`;
    
    console.log(`  Fetching page ${page}...`);
    try {
      const output = execSync(cmd, { encoding: 'utf-8' });
      const games = JSON.parse(output);
      if (Array.isArray(games)) {
        allGames.push(...games);
        console.log(`    ✓ Found ${games.length} games`);
      }
    } catch (e) {
      console.error(`    ✗ Page ${page} failed:`, e.message);
    }
  }

  // Deduplicate
  const seen = new Set();
  const unique = allGames.filter(g => {
    const key = g.Md5 || g.Url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`✨ Total unique games found: ${unique.length}`);

  // Transform to our Game format
  const transformed = unique.map((g, i) => {
    const assets = g.Asset || [];
    let image = assets[0] || '';
    const square = assets.find(img => img.includes('512x512') || img.includes('300x300'));
    if (square) image = square;

    return {
      id: g.Md5 || `api-${i}`,
      title: g.Title || 'Unknown Game',
      image: image,
      url: g.Url || '',
      category: (g.Category && g.Category[0]) || 'Casual',
      description: g.Description || '',
      isFeatured: i < 20,
      isNew: i > unique.length - 50
    };
  });

  const targetPath = path.join(__dirname, '..', 'custom-games.json');
  fs.writeFileSync(targetPath, JSON.stringify(transformed, null, 2));
  console.log(`💾 Successfully saved ${transformed.length} games to ${targetPath}`);
}

run();
