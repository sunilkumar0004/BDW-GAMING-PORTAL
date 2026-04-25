const https = require('https');
const fs = require('fs');

const urls = {
  'stumble-guys': 'https://cdn.akamai.steamstatic.com/steam/apps/1677740/header.jpg',
  '1v1-lol': 'https://1v1.lol/assets/icon.png',
  'krunker-io': 'https://krunker.io/img/krunker_icon.png',
  // Direct generic png transparent icons
  'mobile-legends': 'https://img.utdstc.com/icon/921/800/9218002047cbcf2ce7ca7eb81f8f3708f51aabca5c9efdb145ab568d40ba4477:200',
  'ea-fc-mobile': 'https://img.utdstc.com/icon/fa5/1c0/fa51c09935bdbea1ce6f00db2c918ee0851efbd34d193d5ed2629b1fbf4cf939:200',
  'real-cricket-24': 'https://img.utdstc.com/icon/829/c9d/829c9dfa53820a4b3d75cda49e0a02cb4cdba1a91e5e6e3dd4adccdf24af868b:200',
  'shadow-fight-4': 'https://img.utdstc.com/icon/2a1/4e0/2a14e0bd31cc0fe38dca80f55e092102046acffbf59b48f6575121df4f87ebd9:200'
};

async function download(url, file) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0'} }, r => {
      if (r.statusCode !== 200) {
         console.log('Failed to download from', url, 'Status:', r.statusCode);
         return resolve(false);
      }
      const f = fs.createWriteStream(file);
      r.pipe(f);
      f.on('finish', () => {
         f.close();
         resolve(true);
      });
    }).on('error', e => {
      console.log('HTTP Error:', e.message);
      resolve(false);
    });
  });
}

async function run() {
  for (let [id, url] of Object.entries(urls)) {
    console.log('Downloading', id);
    let success = await download(url, 'c:/Users/NELAESH/OneDrive/Desktop/BDW/poki-clone/client/public/games/' + id + '.png');
    if (success) {
      console.log('Saved', id);
    }
  }
}

run();
