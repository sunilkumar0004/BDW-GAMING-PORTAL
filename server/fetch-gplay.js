const gplay = require('google-play-scraper');
const https = require('https');
const fs = require('fs');

const apps = {
  'stumble-guys': 'com.games.stumbleguys',
  'mobile-legends': 'com.mobile.legends',
  'ea-fc-mobile': 'com.ea.game.fifa14_row',
  'real-cricket-24': 'com.nautilus.realcricket3d',
  'shadow-fight-4': 'com.nekki.shadowfight4',
  '1v1-lol': 'com.justbuild.simulator',
  'agar-io': 'com.miniclip.agar.io',
  'slither-io': 'air.com.hypah.io.slither',
  'paper-io-2': 'io.voodoo.paper2',
  'krunker-io': 'ch.yendis.krunkerhub'
};

async function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, res => {
      if(res.statusCode !== 200) { resolve(false); return; }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    });
  });
}

async function run() {
  for (const [gameId, appId] of Object.entries(apps)) {
    try {
      console.log('Fetching', gameId);
      const appData = await gplay.default.app({appId: appId});
      if (appData && appData.icon) {
        let iconUrl = appData.icon;
        // make sure it's 512px
        iconUrl = iconUrl.replace(/=-s\d+-/, '=-s512-');
        
        const path = 'c:/Users/NELAESH/OneDrive/Desktop/BDW/poki-clone/client/public/games/' + gameId + '.png';
        await downloadImage(iconUrl, path);
        console.log('Successfully saved', gameId);
      }
    } catch (e) {
      console.error('Failed to process', gameId, e.message);
    }
  }
}

run();
