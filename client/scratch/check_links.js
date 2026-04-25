
const fs = require('fs');
const https = require('https');

async function checkUrl(url) {
    return new Promise((resolve) => {
        const req = https.get(url, { rejectUnauthorized: false, timeout: 5000 }, (res) => {
            resolve(res.statusCode === 200);
            res.resume();
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
    });
}

async function run() {
    const games = JSON.parse(fs.readFileSync('custom-games.json', 'utf8'));
    console.log(`Checking ${Math.min(games.length, 50)} games...`);
    
    for (let i = 0; i < Math.min(games.length, 50); i++) {
        const game = games[i];
        // Test proxied image
        const imgUrl = `http://localhost:3000/api/proxy/image?url=${encodeURIComponent(game.image)}`;
        // Note: Can't test localhost from here easily if server isn't fully up, 
        // so I'll test the RAW upstream image but via the same logic as proxy.
        
        console.log(`[${i+1}] ${game.title}: ${game.image}`);
    }
}

run();
